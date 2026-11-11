import { 
  searchLocalProducts, 
  detectCategoryKey,
  calculateEnergyMetrics,
  CATEGORY_RULES,
  stripRegionFromQuery,
  ALLOWED_DOMAINS,
  SerpProductItem 
} from './serpapi';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface UiFormData {
  regions: string[];
  budget_ranges: string[];
  features: string[];
}

export interface ComparisonItem {
  id: string;
  model: string;
  price: string;
  store: string;
  keySpec: string;
  monthlyKwh?: number;
  monthlyCostUzs?: number;
}

export interface ExtractedFilters {
  budget_max: number | null;
  region: string | null;
  specific_feature?: string | null;
  brand?: string | null;
  room_area?: string | null;
  capacity?: string | null;
}

export interface DynamicFilterFacet {
  id: string;
  label: string;
  options: string[];
}

export interface ClarificationOption {
  id: string;
  label: string;
  payload: Record<string, any>;
}

export interface ClarificationData {
  question: string;
  options: ClarificationOption[];
}

export interface EconomistInsight {
  headline: string; // Maksimal 2 jumla
  monthly_kwh: number;
  monthly_cost_uzs: number;
  tariff_rate: number; // 450 so'm/kVt (O'zbekiston bazaviy ijtimoiy tarifi)
  regional_compatibility: string; // Masalan: Xorazm T3 kompressor / sho'r chang
  roi_summary: string;
}

export interface ExtractedDataOpenWorld {
  category: 'apparel' | 'electronics' | 'materials' | 'other' | string;
  product_name: string;
  location: string | null;
  is_electronic: boolean;
  attributes: {
    color?: string | null;
    material?: string | null;
    size?: string | null;
    specs?: string | null;
    other?: string | null;
    [key: string]: any;
  } | string;
}

export interface OpenWorldStructuredResponse {
  status: 'NEED_CLARIFICATION' | 'READY_TO_SEARCH';
  message: string;
  dynamic_chips: string[];
  extracted_data: ExtractedDataOpenWorld;
}

export interface AgentPipelineResponse {
  type: 'CHAT' | 'SEARCH';
  ui_mode: 'CONVERSATION_ONLY' | 'PRODUCT_RESULTS';
  ai_reply: string;
  message?: string;
  state?: 'CONVERSATION' | 'NEED_CLARIFICATION' | 'PRODUCT_SEARCH';
  status: 'NEED_CLARIFICATION' | 'READY_TO_SEARCH';
  turn_count: number;
  category: string;
  category_key: string;
  dynamic_chips?: string[];
  extracted_data?: ExtractedDataOpenWorld;
  is_electronic?: boolean;
  normalized_params: Record<string, any>;
  clarification_data?: ClarificationData | null;
  economist_insight?: EconomistInsight | null;
  search_payload?: {
    query: string;
    category_key: string;
  };
  products: SerpProductItem[];
  comparison_table: ComparisonItem[];
  short_advice_uz: string;
  smartChips?: Array<{ label: string; payload: string }>;
  cleanQuery?: string;
  replyMessage?: string;
  
  // UI mosligi uchun qo'shimcha maydonlar
  step: 'ready' | 'needs_params';
  is_ready_to_search: boolean;
  normalized_query: string;
  ui_form_data: UiFormData;
  extracted_filters: ExtractedFilters;
  expanded_serpapi_query: string | null;
  dynamic_facets: DynamicFilterFacet[];
}

/**
 * ✂️ Qat'iy Cheklov: AI matnini MAXIMUM 2 ta gapga qisqartirish (Directive v6.0 / Topshiriq 2.2)
 */
export function enforceMaxWordsAndSentences(text: string, maxWords: number = 40, maxSentences: number = 2): string {
  if (!text) return '';
  const trimmed = text.trim();

  // Gaplarni ajratish (. ! ?), lekin sonlardagi nuqtani (masalan 1.5 yilda) gap oxiri deb hisoblamaslik
  const sentenceMatches = trimmed.match(/(?:[^\s.!?]|\.(?=\d)|[^\S\r\n])+(?:[.!?]+(?!\d)|$)/g);
  let result = trimmed;

  if (sentenceMatches && sentenceMatches.length > 0) {
    const cleanSentences = sentenceMatches.map(s => s.trim()).filter(Boolean);
    result = cleanSentences.slice(0, maxSentences).join(' ').trim();
  }

  // So'zlar sonini cheklash
  const words = result.split(/\s+/);
  if (words.length > maxWords) {
    result = words.slice(0, maxWords).join(' ') + '.';
  }

  return result;
}

function getGeminiApiKeys(): string[] {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 5);
}

function getOpenAIApiKey(): string {
  let key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    try {
      const fs = require('fs');
      const path = require('path');
      for (const f of ['.env.local', '.env']) {
        const fullPath = path.resolve(process.cwd(), f);
        if (fs.existsSync(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const line of content.split('\n')) {
            if (line.startsWith('OPENAI_API_KEY=')) {
              key = line.trim().substring('OPENAI_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
              if (key) {
                process.env.OPENAI_API_KEY = key;
                return key;
              }
            }
          }
        }
      }
    } catch {}
  }
  return key;
}

/**
 * 🤖 1-QATLAM: OpenAI GPT-4o-mini Structured Outputs Schema (Directive V15.0)
 */
export const OPEN_WORLD_JSON_SCHEMA = {
  name: 'open_world_agent_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['NEED_CLARIFICATION', 'READY_TO_SEARCH'],
        description: "Agar qidiruv uchun ma'lumotlar yetarli bo'lmasa NEED_CLARIFICATION, hamma narsa aniq bo'lsa READY_TO_SEARCH qaytar."
      },
      message: {
        type: 'string',
        description: "Foydalanuvchiga ko'rsatiladigan keyingi savol yoki xabar."
      },
      dynamic_chips: {
        type: 'array',
        items: { type: 'string' },
        description: "Foydalanuvchi bosishi mumkin bo'lgan 3-4 ta qisqa javob variantlari. Masalan: ['📍 Xorazm', '📍 Toshkent'] yoki ['🧤 Charm', '🧤 Paxta']"
      },
      extracted_data: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['apparel', 'electronics', 'materials', 'other']
          },
          product_name: { type: 'string' },
          location: {
            type: ['string', 'null'],
            description: "Foydalanuvchi tanlagan viloyat yoki shahar. Yo'q bo'lsa null."
          },
          is_electronic: {
            type: 'boolean',
            description: 'Faqat elektr tokida ishlaydigan texnikalar uchun true.'
          },
          attributes: {
            type: 'object',
            description: "Rang, mato, xotira hajmi kabi qolgan barcha parametrlar kalit-qiymat ko'rinishida.",
            properties: {
              color: { type: ['string', 'null'] },
              material: { type: ['string', 'null'] },
              size: { type: ['string', 'null'] },
              specs: { type: ['string', 'null'] },
              other: { type: ['string', 'null'] }
            },
            required: ['color', 'material', 'size', 'specs', 'other'],
            additionalProperties: false
          }
        },
        required: ['category', 'product_name', 'location', 'is_electronic', 'attributes'],
        additionalProperties: false
      }
    },
    required: ['status', 'message', 'dynamic_chips', 'extracted_data'],
    additionalProperties: false
  }
};

/**
 * 🧠 Agentning System Prompti (Miyasi)
 */
export const SYSTEM_PROMPT_OPEN_WORLD = `Siz O'zbekistonning eng aqlli elektron tijorat maslahatchisisiz.
Foydalanuvchi barcha turdagi mahsulotlarni so'rashi mumkin.

QAT'IY BOSQICHLI QOIDALAR:
1. HAR DOIM HUDUDNI SO'RANG: Agar foydalanuvchi birinchi marta biron narsa so'rasa va qaysi hududga (Toshkent, Xorazm, Samarqand va h.k) yetkazib berish kerakligini aytmagan bo'lsa (location null bo'lsa), sizning birinchi vazifangiz mahsulot turini aniqlashtirish bilan birga, viloyatni ham so'rashdir.
2. MANTIQIY CHIPLAR (ZERO-MIXED CHIPS): Siz qaytaradigan dynamic_chips massivi aslo aralashib ketmasin:
   - 1-BOSQICH (Hudud noma'lum bo'lsa): FAQAT hudud chiplarini bering! Masalan: ["📍 Toshkent shahri", "📍 Xorazm viloyati", "📍 Samarqand viloyati", "📍 Boshqa hudud"]. Hech qachon rang yoki matoni hudud bilan bitta qatorga aralashtirmang!
   - 2-BOSQICH (Hudud ma'lum bo'lgach): Endi FAQAT o'sha mahsulot xususiyati (mato, o'lcham, quvvat, brend yoki rang) chiplarini bering! Masalan qo'lqop uchun: ["🧤 Qalin Charm", "🧵 100% Paxta", "🧶 Issiq Jun"].
3. TOVAR TOIFASINI FARQLASH:
   - "apparel" (kiyim-kechak, qo'lqop, poyabzal, kurtka): Faqat jinsi, o'lchami, matosi va rangini so'ra. Elektr, kVt yoki ROI haqida ASLO gapirma (is_electronic: false).
   - "electronics" (maishiy texnika, noutbuk, telefon): Texnik parametrlar va elektr sarfini hisobga ol (is_electronic: true).
   - "materials" (qurilish mollari, mebel): O'lcham, xomashyo va miqdorni so'ra (is_electronic: false).
   - "other": Boshqa tovarlar (is_electronic: false).
4. SOXTA MODELLAR QAT'IYAN TAQIQLANADI: O'zingizdan "Standart Model", "Pro Edition" kabi soxta modellar yasamang va mahsulotni bor deb aldamang.
5. QIDIRUVGA TAYYORLIK (READY_TO_SEARCH): Agar mahsulot va uning asosiy parametrlari aniq bo'lsa (masalan: "qora charm erkaklar qo'lqopi Xorazm", "12 lik inverter konditsioner Toshkent"), yoki suhbat 3-bosqichga yetgan bo'lsa, status: "READY_TO_SEARCH" qaytar, dynamic_chips massivini bo'sh qoldir va message ga qisqa tasdiq yoz (masalan: "Sizga mos rasmiy do'konlar narxlarini tekshirmoqdaman...").
6. JAVOB FORMATI: Sen faqat qat'iy belgilangan JSON formatida javob qaytarishing shart.

Misol 1 (1-Bosqich - Hudud yo'q):
Foydalanuvchi: "Menga qo'lqop kerak"
Javob:
{
  "status": "NEED_CLARIFICATION",
  "message": "Qo'lqopni yetkazib berish uchun qaysi hududdansiz?",
  "dynamic_chips": ["📍 Toshkent shahri", "📍 Xorazm viloyati", "📍 Samarqand viloyati", "📍 Boshqa hudud"],
  "extracted_data": {
    "category": "apparel",
    "product_name": "qo'lqop",
    "location": null,
    "is_electronic": false,
    "attributes": {
      "color": null,
      "material": null,
      "size": null,
      "specs": null,
      "other": null
    }
  }
}

Misol 2 (2-Bosqich - Hudud ma'lum, endi faqat tovar xususiyatlari):
Foydalanuvchi: "📍 Xorazm viloyati"
Javob:
{
  "status": "NEED_CLARIFICATION",
  "message": "Xorazm uchun qanday matodan ishlangan qo'lqop qidiryapsiz?",
  "dynamic_chips": ["🧤 Qalin Charm", "🧵 100% Paxta", "🧶 Issiq Jun"],
  "extracted_data": {
    "category": "apparel",
    "product_name": "qo'lqop",
    "location": "Xorazm",
    "is_electronic": false,
    "attributes": {
      "color": null,
      "material": null,
      "size": null,
      "specs": null,
      "other": null
    }
  }
}
`;

const SYSTEM_PROMPT_LEAD_ECONOMIST = `Siz — O'zbekiston bozorining Bosh Iqtisodchisisiz. Sizning xulosangiz sarmoyaning o'zini oqlashi (ROI), energiya samaradorligi yoki tovarning amaliy chidamliligiga tayanadi.

QOIDALAR:
1. Qisqalik prinsipi: Kirish qismida maksimal 2 ta jumla bilan tanlovning iqtisodiy mantiqini ayting.
2. Qat'iyan taqiqlanadi: "Bozor narxida", "kelishilgan", "arzon va sifatli", "A+++ energiya" (idish-tovoqlarga, noutbuklarga yoki telefonlarga noo'rin energiya sinfini yozish QAT'IYAN TAQIQLANADI).
3. Chinni va oshxona idishlarida elektr hisobi 0 kVt qilib ko'rsatilsin, uning o'rniga oziq-ovqat xavfsizligi, zarbalarga chidamlilik va uzoq xizmat muddati tahlil qilinsin.
4. Noutbuk va telefonlarda: protsessor unumdorligi, sovutish tizimi, batareya quvvati va rasmiy IMEI/servis kafolati tahlil qilinsin.
5. Maishiy texnikada amaliy elektr sarfi O'zbekistonning joriy 450 so'm/kVt bazaviy tarifi bo'yicha hisoblanadi.

CHIQISH FORMATI (Faqat toza JSON):
{
  "headline": "Maksimal 2 ta qisqa jumla tahliliy xulosa.",
  "monthly_kwh": 0,
  "monthly_cost_uzs": 0,
  "tariff_rate": 450,
  "regional_compatibility": "Hududiy sharoitga moslik va xizmat ko'rsatish.",
  "roi_summary": "Sarmoyaning oqlanishi va uzoq muddatli foyda."
}`;

async function callGemini(
  systemPrompt: string, 
  userPrompt: string, 
  history: ChatMessage[] = [],
  jsonMode: boolean = false
): Promise<string | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ];

  const contents: any[] = [];
  if (history && history.length > 0) {
    for (const msg of history) {
      if (!msg.content || msg.content.trim() === '') continue;
      const role = (msg.role === 'model' || (msg.role as any) === 'assistant') ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` }]
  });

  for (const key of keys) {
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);

        const res = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.1,
              responseMimeType: jsonMode ? 'application/json' : 'text/plain',
              maxOutputTokens: 600,
            }
          })
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) return candidate.trim();
        }
      } catch (err) {
        // Fallback model
      }
    }
  }

  return null;
}

async function callOpenAI(
  systemPrompt: string, 
  userPrompt: string, 
  history: ChatMessage[] = [],
  jsonMode: boolean = false
): Promise<string | null> {
  const key = getOpenAIApiKey();
  if (!key) return null;

  try {
    // 🧠 Kognitiv Xotirani shakllantirish (V13.0 - Full Context Injection)
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (history && history.length > 0) {
      for (const msg of history) {
        if (!msg.content || msg.content.trim() === '') continue;
        const role = (msg.role === 'model' || (msg.role as any) === 'assistant') ? 'assistant' : 'user';
        messages.push({ role, content: msg.content });
      }
    }

    messages.push({ role: 'user', content: userPrompt });

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.1,
        max_tokens: 600,
        response_format: jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    }
  } catch {}

  return null;
}

/**
 * 🌟 OpenAI GPT-4o-mini Structured Outputs chaqiruvi (Strict Schema)
 */
export async function callOpenAIStructured(
  userPrompt: string,
  history: ChatMessage[] = []
): Promise<OpenWorldStructuredResponse | null> {
  const key = getOpenAIApiKey();
  if (!key) return null;

  try {
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT_OPEN_WORLD },
    ];

    if (history && history.length > 0) {
      for (const msg of history) {
        if (!msg.content || msg.content.trim() === '') continue;
        const role = (msg.role === 'model' || (msg.role as any) === 'assistant') ? 'assistant' : 'user';
        messages.push({ role, content: msg.content });
      }
    }

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== userPrompt) {
      messages.push({ role: 'user', content: userPrompt });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.1,
        response_format: {
          type: 'json_schema',
          json_schema: OPEN_WORLD_JSON_SCHEMA
        }
      })
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.status && parsed.message && Array.isArray(parsed.dynamic_chips) && parsed.extracted_data) {
          return parsed as OpenWorldStructuredResponse;
        }
      }
    }
  } catch (err) {
    console.warn('OpenAI Structured Outputs error:', err);
  }

  return null;
}

/**
 * 🌟 Gemini Structured Outputs zaxirasi
 */
export async function callGeminiStructured(
  userPrompt: string,
  history: ChatMessage[] = []
): Promise<OpenWorldStructuredResponse | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ];

  const contents: any[] = [];
  if (history && history.length > 0) {
    for (const msg of history) {
      if (!msg.content || msg.content.trim() === '') continue;
      const role = (msg.role === 'model' || (msg.role as any) === 'assistant') ? 'model' : 'user';
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: `${SYSTEM_PROMPT_OPEN_WORLD}\n\nUSER PROMPT:\n${userPrompt}` }]
  });

  for (const key of keys) {
    for (const model of candidateModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);

        const res = await fetch(url, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
              maxOutputTokens: 600,
            }
          })
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) {
            const parsed = JSON.parse(candidate.replace(/```json/g, '').replace(/```/g, '').trim());
            if (parsed.status && parsed.message && Array.isArray(parsed.dynamic_chips) && parsed.extracted_data) {
              return parsed as OpenWorldStructuredResponse;
            }
          }
        }
      } catch {}
    }
  }

  return null;
}

/**
 * Deterministik Intent tahlili va Clarification FSM (Fallback mexanizmi)
 */
/**
 * Deterministik Intent tahlili va Clarification FSM (Fallback mexanizmi - V13.0)
 */
function evaluateIntentDeterministic(
  query: string,
  turnCount: number,
  selectedRegion?: string,
  selectedPayload?: Record<string, any>,
  history: ChatMessage[] = []
) {
  const historyText = (history || []).map(m => m.content).join(' ');
  const text = `${historyText} ${query} ${selectedRegion || ''} ${JSON.stringify(selectedPayload || {})}`.toLowerCase();
  const region = selectedRegion || (text.includes('xorazm') ? 'Xorazm' : text.includes('samarqand') ? 'Samarqand' : 'Toshkent');

  // 1. STATE: CONVERSATION (Salomlashish) - Hech qanday hardcoded toifalar berilmaydi!
  if (turnCount === 1 && (/^(salom|assalom|qalaysiz|nima qila olasan|sen kimsan|nima bu|yordam ber|tanishaylik)/i.test(query.trim()))) {
    return {
      state: 'CONVERSATION' as const,
      status: 'NEED_CLARIFICATION' as const,
      turn_count: turnCount,
      category: 'Muloqot va Maslahat',
      category_key: 'boshqa',
      replyMessage: "Assalomu alaykum! Men \"Aqlli Bozor\" elektron savdo va xarid maslahatchisiman. Sizga qanday tovar yoki mahsulot tanlashda yordam berishim mumkin?",
      smartChips: [], // ZERO-HARDCODE: Bo'sh ro'yxat, o'zidan o'zi noutbuk yoki konditsioner chiqarmaydi!
      cleanQuery: '',
      normalized_params: { region }
    };
  }

  // 2. QISHKI KURTKA / KIYIM-KECHAK (V14.0 Edge-Case Test)
  if (/kurtka|plash|palto|nimcha|kastyum|jaket/i.test(text)) {
    const isMen = /erkak|yigit|men|man/i.test(text);
    const isWomen = /ayol|qiz|xotin|women/i.test(text);
    const isKids = /bola|go'dak|o'smir|kid/i.test(text);

    // 2-bosqich: Erkaklar kurtkasi tanlanganda material va uslub
    if (isMen || (turnCount >= 2 && /erkak/i.test(query))) {
      if (turnCount >= 3 || /sintepon|charm|xolofayber|termo|suv/i.test(query)) {
        return {
          status: 'READY_TO_SEARCH' as const,
          turn_count: turnCount,
          category: 'Kiyim-kechak',
          category_key: 'kurtka',
          normalized_params: { region, gender: 'erkaklar' },
          clarification_data: null,
          search_payload: {
            query: `${query} ${region}`.trim(),
            category_key: 'kurtka'
          }
        };
      }
      return {
        state: 'NEED_CLARIFICATION' as const,
        status: 'NEED_CLARIFICATION' as const,
        turn_count: turnCount,
        category: 'Kiyim-kechak',
        category_key: 'kurtka',
        normalized_params: { region, gender: 'erkaklar' },
        replyMessage: "Erkaklar qishki kurtkasi qanday material (charm, sintepon, termo) yoki uslubda bo‘lsin?",
        clarification_data: {
          question: "Erkaklar qishki kurtkasi qanday material (charm, sintepon, termo) yoki uslubda bo‘lsin?",
          options: [
            { id: 'opt_1', label: "🧥 Sintepon / Xolofayber", payload: { material: 'sintepon' } },
            { id: 'opt_2', label: "👔 Qalin Charm / Duxobka", payload: { material: 'charm' } },
            { id: 'opt_3', label: "❄️ Termo / Suv o‘tkazmas", payload: { material: 'termo' } }
          ]
        },
        smartChips: [
          { label: "🧥 Sintepon / Xolofayber", payload: "erkaklar qishki kurtkasi sintepon" },
          { label: "👔 Qalin Charm / Duxobka", payload: "erkaklar charm qishki kurtka" },
          { label: "❄️ Termo / Suv o‘tkazmas", payload: "erkaklar suv otkazmas termo kurtka" }
        ],
        search_payload: {
          query: `erkaklar qishki kurtka ${region}`.trim(),
          category_key: 'kurtka'
        }
      };
    }

    // 1-bosqich: Kurtka so'ralganda
    return {
      state: 'NEED_CLARIFICATION' as const,
      status: 'NEED_CLARIFICATION' as const,
      turn_count: turnCount,
      category: 'Kiyim-kechak',
      category_key: 'kurtka',
      normalized_params: { region },
      replyMessage: "Qishki kurtkani kim uchun qidiryapsiz? Erkaklar, ayollar yoki bolalar uchunmi?",
      clarification_data: {
        question: "Qishki kurtkani kim uchun qidiryapsiz? Erkaklar, ayollar yoki bolalar uchunmi?",
        options: [
          { id: 'opt_1', label: "🧥 Erkaklar kurtkasi", payload: { gender: 'erkaklar' } },
          { id: 'opt_2', label: "👗 Ayollar kurtkasi", payload: { gender: 'ayollar' } },
          { id: 'opt_3', label: "🧒 Bolalar kurtkasi", payload: { gender: 'bolalar' } }
        ]
      },
      smartChips: [
        { label: "🧥 Erkaklar kurtkasi", payload: "erkaklar qishki kurtkasi" },
        { label: "👗 Ayollar kurtkasi", payload: "ayollar qishki kurtkasi" },
        { label: "🧒 Bolalar kurtkasi", payload: "bolalar qishki kurtkasi" }
      ],
      search_payload: {
        query: `qishki kurtka ${region}`.trim(),
        category_key: 'kurtka'
      }
    };
  }

  // 3. PAYPOQ VA MAYDA KIYIMLAR
  if (/paypoq|noski|socks/i.test(text)) {
    return {
      state: 'NEED_CLARIFICATION' as const,
      status: 'NEED_CLARIFICATION' as const,
      turn_count: turnCount,
      category: 'Kiyim-kechak',
      category_key: 'paypoq',
      normalized_params: { region },
      replyMessage: "Klassik paypoqlarni qanday materialdan (paxta, bambuk) va qanday rangda izlayapsiz?",
      clarification_data: {
        question: "Klassik paypoqlarni qanday materialdan va rangda izlayapsiz?",
        options: [
          { id: 'opt_1', label: "🧦 100% Paxta", payload: { material: 'paxta' } },
          { id: 'opt_2', label: "🖤 Qora rangli", payload: { color: 'qora' } },
          { id: 'opt_3', label: "🎋 Bambuk tola", payload: { material: 'bambuk' } }
        ]
      },
      smartChips: [
        { label: "🧦 100% Paxta", payload: "paxta paypoq" },
        { label: "🖤 Qora rangli", payload: "qora klassik paypoq" },
        { label: "🎋 Bambuk tola", payload: "bambuk paypoq" }
      ],
      search_payload: {
        query: `paypoq ${region}`.trim(),
        category_key: 'paypoq'
      }
    };
  }

  // 4. NOUTBUK (Faqat so'ralganda)
  if (/noutbuk|laptop|macbook/i.test(text)) {
    if (turnCount >= 2 && /o'yin|gaming/i.test(text)) {
      return {
        state: 'NEED_CLARIFICATION' as const,
        status: 'NEED_CLARIFICATION' as const,
        turn_count: turnCount,
        category: 'Noutbuk',
        category_key: 'noutbuk',
        replyMessage: "O‘yinlar uchun minimal RTX 3050 yoki 4060 videokartali noutbuklarni ko‘raylikmi?",
        smartChips: [
          { label: "⚡ RTX 4060 (Yuqori FPS)", payload: "noutbuk rtx 4060 gaming" },
          { label: "🎯 RTX 3050 (Hamyonbop)", payload: "noutbuk rtx 3050" },
          { label: "🔥 Asus TUF / Lenovo LOQ", payload: "gaming noutbuk asus tuf lenovo" }
        ],
        search_payload: {
          query: `noutbuk gaming rtx ${region}`.trim(),
          category_key: 'noutbuk'
        }
      };
    }
    return {
      state: 'NEED_CLARIFICATION' as const,
      status: 'NEED_CLARIFICATION' as const,
      turn_count: turnCount,
      category: 'Noutbuk',
      category_key: 'noutbuk',
      replyMessage: "Sizga noutbuk asosan qanday vazifalar (dasturlash, 3D dizayn yoki o‘yinlar) uchun kerak?",
      smartChips: [
        { label: "🎮 O‘yinlar uchun", payload: "o'yinlar uchun" },
        { label: "💻 Dasturlash va IT", payload: "dasturlash va IT uchun" },
        { label: "💼 Ofis va o‘qish", payload: "ofis va o'qish uchun" }
      ],
      search_payload: {
        query: `noutbuk ${region}`.trim(),
        category_key: 'noutbuk'
      }
    };
  }

  // 5. TELEFON (Faqat so'ralganda)
  if (/telefon|smartfon|iphone|samsung|redmi/i.test(text)) {
    return {
      state: 'NEED_CLARIFICATION' as const,
      status: 'NEED_CLARIFICATION' as const,
      turn_count: turnCount,
      category: 'Telefon',
      category_key: 'telefon',
      replyMessage: "Sizga telefon tanlashda asosan qaysi jihati (kamera, batareya quvvati yoki byudjet) muhimroq?",
      smartChips: [
        { label: "📱 Kamera uchun", payload: "kamera uchun flagman telefon" },
        { label: "🔋 Uzoq zaryad (6000mAh)", payload: "katta batareyali telefon" },
        { label: "⚡ Hamyonbop (A-seriya)", payload: "hamyonbop smartfon" }
      ],
      search_payload: {
        query: `smartfon ${region}`.trim(),
        category_key: 'telefon'
      }
    };
  }

  // 6. KONDITSIONER (Faqat so'ralganda)
  if (/kondits|split|inverter|12 lik/i.test(text)) {
    return {
      state: 'NEED_CLARIFICATION' as const,
      status: 'NEED_CLARIFICATION' as const,
      turn_count: turnCount,
      category: 'Konditsioner',
      category_key: 'konditsioner',
      replyMessage: `${region} iqlimi va maydoniga mos konditsioner tanlashda maydon va kompressor turi muhim. Qanday xonaga o'rnatmoqchisiz?`,
      smartChips: [
        { label: "🏠 30-35 kv.m (Inverter)", payload: "12 lik inverter konditsioner" },
        { label: "🏢 40 kv.m+ (On/Off)", payload: "18 lik kuchaytirilgan konditsioner" },
        { label: "⚡ Past kuchlanish 140V", payload: "past kuchlanishga chidamli konditsioner" }
      ],
      search_payload: {
        query: `konditsioner 12000 BTU inverter ${region}`,
        category_key: 'konditsioner'
      }
    };
  }

  // 7. OSHXONA IDISHLARI (Faqat so'ralganda)
  if (/chinni|likop|tarelka|tovoq|serviz/i.test(text)) {
    return {
      state: 'NEED_CLARIFICATION' as const,
      status: 'NEED_CLARIFICATION' as const,
      turn_count: turnCount,
      category: 'Chinni va oshxona idishlari',
      category_key: 'chinni_idishlar',
      replyMessage: "Dasturxoningiz uchun qanday turdagi to‘plam ma‘qul?",
      smartChips: [
        { label: "🍽 6 kishilik to'plam", payload: "chinni serviz 6 kishilik" },
        { label: "🥣 Donalab (Kundalik)", payload: "chinni tarelka likopcha donalab" },
        { label: "✨ Bayramona servirovka", payload: "bayramona chinni idishlar" }
      ],
      search_payload: {
        query: `chinni likopcha va idishlar to'plami ${region}`,
        category_key: 'chinni_idishlar'
      }
    };
  }

  // 8. BARCHA BOSHQA TOVARLAR (Open-World Dynamic Fallback - ZERO HARDCODE!)
  // Mijoz nima so'ragan bo'lsa, o'shani tozalab olib, shu mahsulotga oid savol va chiplar tuziladi!
  const cleanTerm = query.replace(/(menga|kerak|qidiryapman|sotib olmoqchiman|bormi|topib ber|narxi|qancha)/gi, '').trim() || 'mahsulot';
  return {
    state: 'NEED_CLARIFICATION' as const,
    status: 'NEED_CLARIFICATION' as const,
    turn_count: turnCount,
    category: cleanTerm,
    category_key: cleanTerm.toLowerCase().replace(/\s+/g, '_'),
    replyMessage: `${cleanTerm} bo‘yicha qanday parametrlar yoki narx toifasini ko‘rib chiqamiz?`,
    smartChips: [
      { label: `⚡ Hamyonbop ${cleanTerm}`, payload: `hamyonbop ${cleanTerm}` },
      { label: `✨ Sifatli / Premium ${cleanTerm}`, payload: `premium sifatli ${cleanTerm}` },
      { label: `📦 To‘plam / Komplekt`, payload: `${cleanTerm} to'plam` }
    ],
    clarification_data: null,
    cleanQuery: '',
    normalized_params: { region },
    search_payload: {
      query: `${query} ${region}`.trim(),
      category_key: cleanTerm.toLowerCase().replace(/\s+/g, '_')
    }
  };
}

export async function generateEconomistInsight(
  categoryKey: string,
  region: string = 'Toshkent',
  cleanProducts: SerpProductItem[] = [],
  isElectronic: boolean = true
): Promise<EconomistInsight> {
  // 🧥 NO-ELECTRIC OPEN-WORLD MAHSULOTLAR (Kiyim-kechak, Kurtka, Paypoq, Qurilish mollari va h.k.)
  if (!isElectronic || ['apparel', 'materials', 'kurtka', 'paypoq', 'other'].includes(categoryKey)) {
    return {
      headline: enforceMaxWordsAndSentences(`${region} bozorida tanlangan ushbu tovarlar chidamliligi, material sifati va rasmiy kafolati bilan eng maqbul tanlovdir.`),
      monthly_kwh: 0,
      monthly_cost_uzs: 0,
      tariff_rate: 0,
      regional_compatibility: region ? `${region} sharoitiga mos va rasmiy yetkazib berish kafolatlangan.` : "O'zbekiston bo'ylab yetkazib berish kafolati mavjud.",
      roi_summary: "Elektr sarflamaydigan tovar: faqat material sifati, uzoq xizmat muddati va qulaylik hisobga olindi."
    };
  }

  const isDish = categoryKey === 'chinni_idishlar' || categoryKey === 'oshxona_anjomlari' || categoryKey === 'oshxona_idishlari';

  // Chinni va oshxona idishlari: 0 kVt elektr, oziq-ovqat xavfsizligi, zarbalarga chidamlilik va ROI tahlili
  if (isDish) {
    const dishPrompt = `Mahsulot kategoriyasi: Chinni va oshxona idishlari.
Hudud: ${region}.
Tozalangan do'konlar va modellar (Clean Results): ${cleanProducts.slice(0, 4).map(p => `${p.title} - ${p.source} (${p.price})`).join('; ')}.

QAT'IY QOIDALAR (V8.0):
1. QAT'IYAN MAKSIMAL 2 TA QISQA JUMLA yozing.
2. Oziq-ovqat xavfsizligi (glazur emal, mikroto'lqinli va idish yuvish mashinasiga moslik), zarbalarga chidamlilik va uzoq xizmat muddati (ROI) haqida gapiring.
3. Elektr energiyasi (kVt, tok, inverter) haqida ASLO gapirmang (idish-tovoqda elektr sarfi 0!). "Bozor narxida" so'zini aslo ishlatmang!
Faqat toza JSON qaytaring:
{
  "headline": "Maksimal 2 ta qisqa jumla tahliliy xulosa.",
  "monthly_kwh": 0,
  "monthly_cost_uzs": 0,
  "tariff_rate": 0,
  "regional_compatibility": "Oziq-ovqat xavfsizligi standartiga mos, mikroto'lqinli pech va idish yuvish mashinasiga to'liq yaroqli.",
  "roi_summary": "Sifatli chinni idishlar tirnalmaydi, darz ketmaydi va uzoq yillar xizmat qiladi."
}`;

    let aiDishJson = await callOpenAI(SYSTEM_PROMPT_LEAD_ECONOMIST, dishPrompt, [], true)
      || await callGemini(SYSTEM_PROMPT_LEAD_ECONOMIST, dishPrompt, [], true);

    if (aiDishJson) {
      try {
        const parsed = JSON.parse(aiDishJson.replace(/```json/g, '').replace(/```/g, '').trim());
        return {
          headline: enforceMaxWordsAndSentences(parsed.headline || `${region} sharoitida sifatli chinni va farfor to'plamlar uzoq yillik xizmat muddatini kafolatlaydi.`),
          monthly_kwh: 0,
          monthly_cost_uzs: 0,
          tariff_rate: 0,
          regional_compatibility: parsed.regional_compatibility || "Oziq-ovqat xavfsizligi standartiga mos, mikroto‘lqinli pech va idish yuvish mashinasiga 100% yaroqli.",
          roi_summary: parsed.roi_summary || "Sifatli chinni idishlar uzoq muddat o‘z jilosini yo‘qotmaydi va oshxona xarajatlarini tejaydi."
        };
      } catch {}
    }

    return {
      headline: enforceMaxWordsAndSentences(`${region} sharoitida sifatli chinni va farfor to'plamlar uzoq yillik xizmat muddatini kafolatlaydi. Emal qoplamasi qattiq suvda ham darz ketmaydi va tirnalishlarga chidamli.`),
      monthly_kwh: 0,
      monthly_cost_uzs: 0,
      tariff_rate: 0,
      regional_compatibility: "Oziq-ovqat xavfsizligi standartiga mos, mikroto‘lqinli pech va idish yuvish mashinasiga 100% yaroqli.",
      roi_summary: "Sifatli chinni idishlar uzoq muddat o‘z jilosini yo‘qotmaydi va oshxona xarajatlarini tejaydi."
    };
  }

  // 💻 NOUTBUK (Laptop): Unumdorlik, sovutish va xizmat muddati tahlili
  if (categoryKey === 'noutbuk') {
    return {
      headline: enforceMaxWordsAndSentences(`${region} bozorida tanlangan ushbu noutbuklar kuchli protsessor, samarali sovutish va rasmiy kafolat bilan eng maqbul sarmoyadir.`),
      monthly_kwh: 15,
      monthly_cost_uzs: 6750,
      tariff_rate: 450,
      regional_compatibility: "Kuchli sovutish tizimi va uzoq batareya quvvati issiq iqlim sharoitida ham barqaror ishlashni ta'minlaydi.",
      roi_summary: "Yuqori unumdorlikdagi protsessor va tezkor SSD drayveri ish va o'yin jarayonida tizim eskirishini oldini oladi."
    };
  }

  // 📱 TELEFON (Smartfon): Rasmiy IMEI, displey va batareya chidamliligi
  if (categoryKey === 'telefon') {
    return {
      headline: enforceMaxWordsAndSentences(`${region} bozorida rasmiy IMEI-kod ro'yxatidan o'tgan va xizmat ko'rsatish kafolatiga ega smartfonlar eng ishonchli xariddir.`),
      monthly_kwh: 3,
      monthly_cost_uzs: 1350,
      tariff_rate: 450,
      regional_compatibility: "O'zbekistonning barcha mobil aloqa operatorlari (5G/4G) va rasmiy IMEI tizimiga to'liq mos.",
      roi_summary: "Rasmiy kafolatli smartfonlar ikkilamchi bozorda o'z qiymatini yuqori saqlaydi va bepul servis xizmatini ta'minlaydi."
    };
  }

  // 🧥 NO-ELECTRIC OPEN-WORLD MAHSULOTLAR (Kiyim-kechak, Kurtka, Paypoq, Qurilish mollari va h.k.)
  const isElectricAppliance = ['konditsioner', 'elektr_choynak', 'televizor', 'muzlatgich', 'kir_yuvish'].includes(categoryKey);
  if (!isElectricAppliance) {
    const promptGeneral = `Mahsulot toifasi: ${categoryKey}.
Hudud: ${region}.
Do'konlar va modellar: ${cleanProducts.slice(0, 4).map(p => `${p.title} - ${p.source} (${p.price})`).join('; ')}.

QAT'IY QOIDALAR (V14.0 Zero-Hardcode):
1. Maksimal 2 ta qisqa jumlada iqtisodiy xulosa va narx-sifat mutanosibligini yozing.
2. Bu mahsulot elektr sarflamaydi (elektr: 0 kVt, inverter haqida gapirilmasin!).
3. Material sifati, chidamlilik va mavsumiy moslikni baholang.
Faqat toza JSON qaytaring:
{
  "headline": "Maksimal 2 ta qisqa jumla.",
  "monthly_kwh": 0,
  "monthly_cost_uzs": 0,
  "tariff_rate": 0,
  "regional_compatibility": "Mahalliy iqlim va sharoitga to'liq mos.",
  "roi_summary": "Sifatli material va mustahkam tikuv uzoq mavsum xizmat qilishni ta'minlaydi."
}`;

    let aiGenJson = await callOpenAI(SYSTEM_PROMPT_LEAD_ECONOMIST, promptGeneral, [], true)
      || await callGemini(SYSTEM_PROMPT_LEAD_ECONOMIST, promptGeneral, [], true);

    if (aiGenJson) {
      try {
        const parsed = JSON.parse(aiGenJson.replace(/```json/g, '').replace(/```/g, '').trim());
        return {
          headline: enforceMaxWordsAndSentences(parsed.headline || `${region} bozorida tanlangan ushbu tovarlar chidamliligi va hamyonbopligi bilan eng maqbul tanlovdir.`),
          monthly_kwh: 0,
          monthly_cost_uzs: 0,
          tariff_rate: 0,
          regional_compatibility: parsed.regional_compatibility || "Mahalliy iqlim va ehtiyojga to'liq mos.",
          roi_summary: parsed.roi_summary || "Sifatli material va to'g'ri tanlov uzoq muddat xarajatlarni tejaydi."
        };
      } catch {}
    }

    return {
      headline: enforceMaxWordsAndSentences(`${region} sharoitida tanlangan ushbu variantlar yuqori chidamliligi va qulayligi bilan eng maqbul xariddir.`),
      monthly_kwh: 0,
      monthly_cost_uzs: 0,
      tariff_rate: 0,
      regional_compatibility: "Mahalliy iqlim va kundalik ehtiyojga to'liq mos.",
      roi_summary: "Sifatli material va to'g'ri tanlov uzoq mavsum xizmat qilishni ta'minlaydi."
    };
  }

  const energy = calculateEnergyMetrics(categoryKey);
  const rule = CATEGORY_RULES[categoryKey] || CATEGORY_RULES['konditsioner'];
  const regionalCompatibility = rule.regional_insight[region] || rule.regional_insight['default'];

  // AI orqali Iqtisodchi tahlilini olish (Maishiy texnika - 450 so'm/kVt bazaviy tarif)
  const prompt = `Mahsulot kategoriyasi: ${rule.name}.
Hudud: ${region}.
Elektr tarifi: 450 so'm/kVt (O'zbekiston bazaviy ijtimoiy tarifi).
Hisoblangan oylik elektr sarfi: ${energy.monthlyKwh} kVt/soat (${energy.monthlyCostUzs.toLocaleString('uz-UZ')} so'm).
Tozalangan do'konlar va modellar (Clean Results): ${cleanProducts.slice(0, 4).map(p => `${p.title} - ${p.source} (${p.price})`).join('; ')}.
Hududiy xususiyat: ${regionalCompatibility}.

QAT'IY QOIDALAR (V8.0):
1. QAT'IYAN MAKSIMAL 2 TA QISQA JUMLADA iqtisodiy xulosa va ROI (o'zini oqlash muddati) asosini yozing.
2. Bozor narxida so'zini aslo ishlatmang! Bo'lar-bo'lmas maqtovlar yozmang, faqat energiya foydasi va xarajatni tejash hisobini bering.
Faqat toza JSON qaytaring.`;

  // 1-o'rinda foydalanuvchining pullik ChatGPT (OpenAI) orqali Iqtisodchi tahlilini olish
  let aiJson = await callOpenAI(SYSTEM_PROMPT_LEAD_ECONOMIST, prompt, [], true);
  if (!aiJson) {
    // Agar OpenAI javob bermasa, Gemini fallback
    aiJson = await callGemini(SYSTEM_PROMPT_LEAD_ECONOMIST, prompt, [], true);
  }

  if (aiJson) {
    try {
      const parsed = JSON.parse(aiJson.replace(/```json/g, '').replace(/```/g, '').trim());
      return {
        headline: enforceMaxWordsAndSentences(parsed.headline || `${region} bozori uchun eng maqbul energiya tejovchi modellar tanlandi.`),
        monthly_kwh: Number(parsed.monthly_kwh) || energy.monthlyKwh,
        monthly_cost_uzs: Number(parsed.monthly_cost_uzs) || energy.monthlyCostUzs,
        tariff_rate: 450,
        regional_compatibility: parsed.regional_compatibility || regionalCompatibility,
        roi_summary: parsed.roi_summary || `Inverter texnologiyasi oddiy modellarga nisbatan oyiga ${Math.round(energy.monthlyCostUzs * 0.35).toLocaleString('uz-UZ')} so‘m tejaydi.`
      };
    } catch {}
  }

  // Deterministik qat'iy iqtisodchi xulosasi (Maksimal 2 jumla)
  let headline = `${region} sharoitida A++ inverter sinfidagi modellarga sarmoya kiritish eng maqbul iqtisodiy tanlovdir. Oylik energiya sarfi o'rtacha ${energy.monthlyCostUzs.toLocaleString('uz-UZ')} so'mni tashkil etib, xarajatlar 1.5 yilda o'zini to'liq oqlaydi.`;
  if (categoryKey === 'elektr_choynak') {
    headline = `${region} suvidagi yuqori qattiqlik hisobga olinganda, zanglamas po'latdan ishlangan yashirin spiralli choynaklar eng uzoq xizmat muddatini beradi. Oyiga taxminan ${energy.monthlyCostUzs.toLocaleString('uz-UZ')} so'm elektr sarflaydi.`;
  } else if (categoryKey === 'oshxona_idishlari') {
    headline = `Chinni va qalin keramik idishlar haroratni uzoq saqlab, qattiq suvda ham o'z jilosini yo'qotmaydi. Ushbu to'plamlar chidamliligi va kundalik foydalanishga yaroqliligi bilan ajralib turadi.`;
  }

  return {
    headline: enforceMaxWordsAndSentences(headline),
    monthly_kwh: energy.monthlyKwh,
    monthly_cost_uzs: energy.monthlyCostUzs,
    tariff_rate: 450,
    regional_compatibility: regionalCompatibility,
    roi_summary: `Energiya sarfi va mahalliy servis kafolati bo‘yicha tanlangan variantlar xarajatlarni minimal darajada ushlab turadi.`
  };
}

/**
 * Taqqoslash matritsasi (Compare Matrix)
 */
export function buildComparisonTable(products: SerpProductItem[]): ComparisonItem[] {
  return products.slice(0, 4).map(p => ({
    id: p.id,
    model: p.title.length > 38 ? p.title.substring(0, 38) + '...' : p.title,
    price: p.price,
    store: p.source,
    keySpec: p.keySpecs?.[0] || 'Rasmiy kafolat',
    monthlyKwh: p.monthlyKwh,
    monthlyCostUzs: p.monthlyCostUzs,
  }));
}

/**
 * Dinamik Facetlar (Do'kon va Brend)
 */
export function generateAdaptiveFacets(products: SerpProductItem[]): DynamicFilterFacet[] {
  if (!products || products.length === 0) return [];
  const facets: DynamicFilterFacet[] = [];

  const stores = Array.from(new Set(products.map(p => p.source))).filter(Boolean);
  if (stores.length > 1) {
    facets.push({
      id: 'store',
      label: 'Do‘kon',
      options: ['Hammasi', ...stores],
    });
  }

  const knownBrands = ['Samsung', 'LG', 'Artel', 'Midea', 'Gree', 'Tefal', 'Philips', 'Xiaomi', 'TCL', 'Bosch'];
  const matchedBrands = new Set<string>();
  products.forEach(p => {
    const text = p.title.toLowerCase();
    knownBrands.forEach(b => {
      if (text.includes(b.toLowerCase())) matchedBrands.add(b);
    });
  });
  if (matchedBrands.size > 0) {
    facets.push({
      id: 'brand',
      label: 'Brend',
      options: ['Hammasi', ...Array.from(matchedBrands)],
    });
  }

  return facets;
}

/**
 * 🚀 ASOSIY PIPELINE DVIGATELI (5-Qatlamli Arxitektura)
 */

/**
 * 🤖 3.3. Autonomous AI Agent: SerpAPI Cheklovini Aylanib O'tish (Function Calling Loop - V16.0)
 * Agar birinchi qidiruvda tovar topilmasa, kalit so'zni o'zgartirib (qisqartirib/sinonimlar bilan) qayta qidiradi.
 */
export async function autonomousAgentProductSearch(
  initialQuery: string,
  category: string | undefined,
  activeRegion: string,
  history: ChatMessage[] = []
): Promise<{
  products: SerpProductItem[];
  finalAdvice?: string;
  searchHistory: Array<{ query: string; found: number }>;
}> {
  const key = getOpenAIApiKey();
  const cleanInitial = stripRegionFromQuery(initialQuery);
  const searchHistory: Array<{ query: string; found: number }> = [];

  // Agar OpenAI kalit bo'lmasa, to'g'ridan-to'g'ri qidiruv
  if (!key) {
    const raw = await searchLocalProducts(cleanInitial, category, activeRegion);
    searchHistory.push({ query: cleanInitial, found: raw.length });
    return { products: raw.slice(0, 4), searchHistory };
  }

  const systemPrompt = `Siz O'zbekistonning eng malakali avtonom elektron savdo agentisiz.
Vazifangiz: O'zbekiston milliy do'konlaridan (Uzum, Texnomart, Mediapark, Olcha, Ishonch, Credit Asia, Idea va h.k.) mijoz so'ragan mahsulotni topish.
QAT'IY QOIDALAR:
1. QIDIRUVNI MANTIQAN IKKIGA BO'LING: search_uzbek_ecommerce vositasiga yuboriladigan search_query ichiga HECH QACHON viloyat/shahar nomini (masalan: Xorazm, Toshkent, Samarqand) qo'shmang! Faqat tovar va model nomini bering (masalan: "LG kolonnali konditsioner 24000 BTU" yoki "LG konditsioner").
2. QAYTA IZLASH (RETRY LOOP): Agar vosita "found: 0" deb javob bersa, darhol taslim bo'lmang! Kalit so'zni o'zgartiring:
   - "LG yerda turadigan" -> "LG kolonnali konditsioner" yoki "LG shkaf konditsioner"
   - Qisqartiring: "LG konditsioner 24000" yoki "LG inverter konditsioner"
   - Sinonimlarini sinang.
3. DEAD LOOP YO'QLIGI: Agar bir necha urinishdan so'ng ham O'zbekiston bozorida ushbu aniq model umuman topilmasa, aslo yana "Hududni tanlang" deb so'ramang! Foydalanuvchiga ${activeRegion}ga yetkazib berish sharti bilan hozircha ushbu model yo'qligini ayting va muqobil variantlarni (devorga ilinadigan kuchliroq LG modellari, yoki Artel, Samsung, Gree brendlari) taklif qiling.`;

  const agentMessages: Array<any> = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Hudud: ${activeRegion}. Foydalanuvchi qidiruvi: "${cleanInitial}". Mos mahsulotlarni topib bering.` }
  ];

  const tools = [
    {
      type: 'function',
      function: {
        name: 'search_uzbek_ecommerce',
        description: "O'zbekiston onlayn do'konlaridan mahsulot izlash. Diqqat: Qidiruv so'ziga viloyat nomini qo'shmang! Agar topilmasa, kalit so'zni o'zgartirib yoki qisqartirib qayta ishlating.",
        parameters: {
          type: 'object',
          properties: {
            search_query: { type: 'string', description: 'Mahsulot nomi va modeli (viloyat nomi aslo qo\'shilmasin!)' },
            category: { type: 'string', description: 'Tovar toifasi (apparel, electronics, materials, etc.)' }
          },
          required: ['search_query']
        }
      }
    }
  ];

  let bestProducts: SerpProductItem[] = [];
  let finalAdvice = '';

  // Maksimal 3 ta qadam (Initial + 2 ta retry)
  for (let step = 0; step < 3; step++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: agentMessages,
          tools,
          tool_choice: step === 0 ? { type: 'function', function: { name: 'search_uzbek_ecommerce' } } : 'auto',
          temperature: 0.1
        })
      });
      clearTimeout(timeoutId);

      if (!res.ok) break;

      const data = await res.json();
      const choiceMsg = data.choices?.[0]?.message;
      if (!choiceMsg) break;

      agentMessages.push(choiceMsg);

      // Agar model tool chaqirgan bo'lsa
      if (choiceMsg.tool_calls && choiceMsg.tool_calls.length > 0) {
        const toolCall = choiceMsg.tool_calls[0];
        if (toolCall.function?.name === 'search_uzbek_ecommerce') {
          let args: any = {};
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch {}

          const rawQuery = args.search_query || cleanInitial;
          const queryNoRegion = stripRegionFromQuery(rawQuery);
          console.log(`[AutonomousAgent] Step ${step + 1} Search Query: "${queryNoRegion}" (Region: ${activeRegion})`);

          const found = await searchLocalProducts(queryNoRegion, args.category || category, activeRegion);
          searchHistory.push({ query: queryNoRegion, found: found.length });

          if (found.length > 0) {
            bestProducts = found;
            console.log(`[AutonomousAgent] Step ${step + 1} Found ${found.length} products!`);
            // Tool natijasini modelga qaytaramiz
            agentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                status: 'success',
                found_count: found.length,
                top_products: found.slice(0, 4).map(p => ({
                  title: p.title,
                  price: p.price,
                  store: p.source
                }))
              })
            });

            // Model yakuniy xulosa bersin
            try {
              const finalRes = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                  model: 'gpt-4o-mini',
                  messages: agentMessages,
                  temperature: 0.1
                })
              });
              if (finalRes.ok) {
                const finalData = await finalRes.json();
                finalAdvice = finalData.choices?.[0]?.message?.content || '';
              }
            } catch {}

            break; // Mahsulot topildi, tsikldan chiqamiz!
          } else {
            console.log(`[AutonomousAgent] Step ${step + 1} 0 products found for "${queryNoRegion}". Retrying with adjusted query...`);
            // Mahsulot topilmadi - Agentga qayta izlash uchun yo'naltirish beramiz
            agentMessages.push({
              role: 'tool',
              tool_call_id: toolCall.id,
              content: JSON.stringify({
                status: 'not_found',
                found_count: 0,
                message: `"${queryNoRegion}" bo'yicha rasmiy do'konlarda mahsulot topilmadi. Iltimos, kalit so'zni o'zgartirib (sinonimlar: masalan 'yerda turadigan' o'rniga 'kolonnali', yoki qisqartirilgan brend/model nomi) qayta qidiring.`
              })
            });
            // Tsikl davom etadi va agent qayta izlaydi
            continue;
          }
        }
      } else {
        // Model matnli javob qaytardi
        finalAdvice = choiceMsg.content || '';
        break;
      }
    } catch (err) {
      console.warn('[AutonomousAgent error]:', err);
      break;
    }
  }

  // Agar agent orqali ham topilmagan bo'lsa va hali to'g'ridan-to'g'ri qidiruv qilinmagan bo'lsa
  if (bestProducts.length === 0 && searchHistory.length === 0) {
    bestProducts = await searchLocalProducts(cleanInitial, category, activeRegion);
  }

  return {
    products: bestProducts.slice(0, 4),
    finalAdvice,
    searchHistory
  };
}

export async function runEcommerceAgentPipeline(
  userMessage: string,
  history: ChatMessage[] = [],
  params?: {
    region?: string;
    budget?: string;
    feature?: string;
    turn_count?: number;
    clarification_payload?: Record<string, any>;
  }
): Promise<AgentPipelineResponse> {
  const currentTurn = (params?.turn_count || 1);
  const targetRegion = params?.region || 'Toshkent';

  // 1-QATLAM: OpenAI GPT-4o-mini Structured Outputs (Open-World AI Maslahatchisi)
  let structured = await callOpenAIStructured(userMessage, history);
  if (!structured) {
    structured = await callGeminiStructured(userMessage, history);
  }

  let intentResult: any = null;

  if (structured) {
    const isReadyToSearch = structured.status === 'READY_TO_SEARCH';
    const chips: string[] = Array.isArray(structured.dynamic_chips) ? structured.dynamic_chips : [];
    const smartChips = chips.map(c => ({ label: c, payload: c }));
    const ext = structured.extracted_data || {
      category: 'other',
      product_name: userMessage,
      location: targetRegion,
      is_electronic: false,
      attributes: {}
    };

    let attrStr = '';
    if (ext.attributes && typeof ext.attributes === 'object') {
      attrStr = Object.values(ext.attributes).filter(Boolean).join(' ');
    } else if (typeof ext.attributes === 'string') {
      attrStr = ext.attributes;
    }

    const cleanQuery = isReadyToSearch
      ? `${ext.product_name} ${attrStr} ${ext.location || targetRegion}`.trim()
      : '';

    intentResult = {
      type: isReadyToSearch ? 'SEARCH' : 'CHAT',
      ui_mode: isReadyToSearch ? 'PRODUCT_RESULTS' : 'CONVERSATION_ONLY',
      ai_reply: structured.message,
      message: structured.message,
      state: isReadyToSearch ? 'PRODUCT_SEARCH' : 'NEED_CLARIFICATION',
      status: structured.status,
      turn_count: currentTurn,
      category: ext.category,
      category_key: ext.category,
      dynamic_chips: chips,
      smartChips,
      extracted_data: ext,
      is_electronic: ext.is_electronic,
      cleanQuery,
      replyMessage: structured.message,
      search_payload: {
        query: cleanQuery || userMessage,
        category_key: ext.category,
      },
      clarification_data: chips.length > 0 ? {
        question: structured.message,
        options: chips.map((c, idx) => ({
          id: `chip_${idx}`,
          label: c,
          payload: { filter: c }
        }))
      } : null,
      normalized_params: {
        region: ext.location || targetRegion,
        item_type: ext.category
      }
    };
  }

  // Fallback FSM (Agarda GPT va Gemini ishlamasa)
  if (!intentResult) {
    const fsmResult = evaluateIntentDeterministic(
      userMessage,
      currentTurn,
      params?.region,
      params?.clarification_payload,
      history
    );
    const fsm: any = fsmResult;
    const isChatFsm = fsm.state === 'CONVERSATION' || fsm.state === 'NEED_CLARIFICATION' || fsm.status === 'NEED_CLARIFICATION';
    intentResult = {
      ...fsmResult,
      type: isChatFsm ? 'CHAT' : 'SEARCH',
      ui_mode: isChatFsm ? 'CONVERSATION_ONLY' : 'PRODUCT_RESULTS',
      ai_reply: fsm.replyMessage || '',
      message: fsm.replyMessage || '',
      dynamic_chips: (fsm.smartChips || []).map((c: any) => c.label),
      extracted_data: {
        category: fsm.category_key || 'other',
        product_name: userMessage,
        location: targetRegion,
        is_electronic: ['konditsioner', 'televizor', 'muzlatgich', 'kir_yuvish', 'elektr_choynak'].includes(fsm.category_key || ''),
        attributes: {}
      }
    };
  }

  // Turn count ni yangilash
  intentResult.turn_count = currentTurn;

  // 🛑 2-BOSQICH: GPT'NI "CONTROLLER" QILISH
  // Agar status === "NEED_CLARIFICATION" (yoki ui_mode === "CONVERSATION_ONLY"):
  // HECH QANDAY SERPAPI QIDIRUVI QILINMAYDI! Mahsulotlar va jadvallar bo'sh ketadi!
  if (intentResult.status === 'NEED_CLARIFICATION' || intentResult.ui_mode === 'CONVERSATION_ONLY') {
    const adviceText = intentResult.ai_reply || intentResult.replyMessage || 'Assalomu alaykum! Men "Aqlli Bozor" xarid yordamchisiman. Sizga qanday tovar bo‘yicha yordam bera olaman?';

    return {
      type: 'CHAT',
      ui_mode: 'CONVERSATION_ONLY',
      ai_reply: adviceText,
      message: adviceText,
      state: 'NEED_CLARIFICATION',
      status: 'NEED_CLARIFICATION',
      turn_count: currentTurn,
      category: intentResult.category || 'apparel',
      category_key: intentResult.category_key || 'apparel',
      dynamic_chips: intentResult.dynamic_chips || (intentResult.smartChips || []).map((c: any) => c.label),
      extracted_data: intentResult.extracted_data,
      is_electronic: intentResult.is_electronic ?? false,
      normalized_params: intentResult.normalized_params || {},
      clarification_data: intentResult.clarification_data,
      economist_insight: null,
      search_payload: intentResult.search_payload,
      products: [], // 100% BO'SH - KARTOCHKALAR CHIZILMAYDI!
      comparison_table: [], // TAQQOSLASH JADVALI CHIZILMAYDI!
      short_advice_uz: adviceText,
      smartChips: intentResult.smartChips || [],
      cleanQuery: '',
      replyMessage: adviceText,

      // UI legacy
      step: 'needs_params',
      is_ready_to_search: false,
      normalized_query: userMessage,
      ui_form_data: {
        regions: ["Toshkent", "Xorazm", "Samarqand", "Buxoro", "Farg'ona", "Andijon"],
        budget_ranges: ["Hamyonbop", "O‘rta toifa", "Premium"],
        features: (intentResult.clarification_data?.options || []).map((o: any) => o.label),
      },
      extracted_filters: {
        budget_max: null,
        region: intentResult.normalized_params?.region || targetRegion,
        specific_feature: null,
      },
      expanded_serpapi_query: null,
      dynamic_facets: [],
    };
  }

  // 🚀 3-BOSQICH: PRODUCT_SEARCH (Faqat status: READY_TO_SEARCH bo'lganda Autonomous Agent va Mahsulotlar)
  const isElectronic = intentResult.extracted_data?.is_electronic ?? (intentResult.category_key === 'electronics' || ['konditsioner', 'televizor', 'muzlatgich', 'kir_yuvish', 'elektr_choynak'].includes(intentResult.category_key));
  const activeRegion = intentResult.extracted_data?.location || intentResult.normalized_params?.region || targetRegion;
  
  // 1. QIDIRUVNI MANTIQAN IKKIGA BO'LISH (SEPARATE CONTEXT FROM QUERY - V16.0)
  // Qidiruv so'ziga viloyat nomi qo'shilmaydi! Viloyat konteksti alohida yetkazib berish va Bosh Iqtisodchiga beriladi.
  const rawProdName = intentResult.extracted_data?.product_name || intentResult.cleanQuery || userMessage;
  const searchQuery = stripRegionFromQuery(rawProdName);
  const categoryKey = intentResult.category_key || detectCategoryKey(searchQuery, intentResult.category);

  // 3. AI AGENT YARATISH: AUTONOMOUS FUNCTION CALLING (OPENAI TOOLS - V16.0)
  // Birinchi marta topilmasa, o'zi kalit so'zni o'zgartirib qayta qidiradi!
  const agentSearchResult = await autonomousAgentProductSearch(
    searchQuery,
    intentResult.category,
    activeRegion,
    history
  );
  const cleanProducts = agentSearchResult.products.slice(0, 4);

  // 🛡️ ZERO-DEAD-LOOP & GRACEFUL FAILURE (V16.0): Agar mahsulot topilmasa,
  // hech qachon yana hududni so'ramaymiz! Muqobil tovar parametrlarini taklif qilamiz.
  if (cleanProducts.length === 0) {
    const notFoundMsg = agentSearchResult.finalAdvice ||
      `${activeRegion}ga yetkazib berish sharti bilan rasmiy do‘konlarda hozircha siz so‘ragan "${searchQuery}" modeli topilmadi. Keling, o‘rniga muqobil variantlarni yoki boshqa brendlarni (Artel, Samsung) ko‘rib chiqamizmi?`;

    // Mantiqiy muqobil chiplar (Aslo viloyat chiplari chiqmaydi!)
    let alternativeChips: string[] = [];
    if (categoryKey === 'konditsioner' || /konditsioner/i.test(searchQuery)) {
      alternativeChips = [
        '❄️ Devorga ilinadigan (LG)',
        '🏢 Boshqa brend (Artel/Gree)',
        '⚡ Quvvatni o‘zgartirish'
      ];
    } else if (categoryKey === 'apparel' || /kurtka|kiyim|oyoqkiyim|qo'lqop/i.test(searchQuery)) {
      alternativeChips = [
        '🧥 Boshqa model/mato',
        '🏷️ Boshqa brend',
        '📏 O‘lchamni o‘zgartirish'
      ];
    } else if (categoryKey === 'televizor' || /televizor|tv/i.test(searchQuery)) {
      alternativeChips = [
        '📺 Artel Smart TV',
        '🌟 Samsung Crystal UHD',
        '📐 Boshqa diagonal'
      ];
    } else {
      alternativeChips = [
        '🔍 Boshqa model ko‘rish',
        '🏷️ Muqobil brendlar',
        '⚙️ Parametrlarni o‘zgartirish'
      ];
    }

    const smartChips = alternativeChips.map(c => ({ label: c, payload: c }));

    return {
      type: 'CHAT',
      ui_mode: 'CONVERSATION_ONLY',
      ai_reply: notFoundMsg,
      message: notFoundMsg,
      state: 'NEED_CLARIFICATION',
      status: 'NEED_CLARIFICATION',
      turn_count: currentTurn,
      category: intentResult.category || 'boshqa',
      category_key: categoryKey,
      dynamic_chips: alternativeChips,
      extracted_data: intentResult.extracted_data,
      is_electronic: isElectronic,
      normalized_params: { region: activeRegion },
      clarification_data: {
        question: notFoundMsg,
        options: alternativeChips.map((c, i) => ({ id: `alt_${i}`, label: c, payload: { filter: c } }))
      },
      economist_insight: null,
      search_payload: {
        query: searchQuery,
        category_key: categoryKey
      },
      products: [],
      comparison_table: [],
      short_advice_uz: notFoundMsg,
      smartChips,
      cleanQuery: '',
      replyMessage: notFoundMsg,
      step: 'needs_params',
      is_ready_to_search: false,
      normalized_query: searchQuery,
      ui_form_data: {
        regions: ["Toshkent", "Xorazm", "Samarqand", "Buxoro", "Farg'ona", "Andijon"],
        budget_ranges: ["Hamyonbop", "O‘rta toifa", "Premium"],
        features: [],
      },
      extracted_filters: {
        budget_max: null,
        region: activeRegion,
        specific_feature: null,
      },
      expanded_serpapi_query: null,
      dynamic_facets: [],
    };
  }

  // 4-QATLAM: Bosh Iqtisodchi AI (Lead Economist Advisor - isElectronic bayrog'i bilan)
  const economistInsight = await generateEconomistInsight(categoryKey, activeRegion, cleanProducts, isElectronic);

  // 5-QATLAM: Taqqoslash Jadvali va Formatlangan Chiqish
  const comparisonTable = buildComparisonTable(cleanProducts);
  const facets = generateAdaptiveFacets(cleanProducts);

  return {
    type: 'SEARCH',
    ui_mode: 'PRODUCT_RESULTS',
    ai_reply: intentResult.ai_reply || intentResult.replyMessage || economistInsight.headline,
    message: intentResult.ai_reply || intentResult.replyMessage || economistInsight.headline,
    state: 'PRODUCT_SEARCH',
    status: 'READY_TO_SEARCH',
    turn_count: currentTurn,
    category: intentResult.category || CATEGORY_RULES[categoryKey]?.name || 'Mahsulotlar',
    category_key: categoryKey,
    dynamic_chips: [],
    extracted_data: intentResult.extracted_data,
    is_electronic: isElectronic,
    normalized_params: intentResult.normalized_params || { region: activeRegion },
    clarification_data: null,
    economist_insight: economistInsight,
    search_payload: {
      query: searchQuery,
      category_key: categoryKey
    },
    products: cleanProducts,
    comparison_table: comparisonTable,
    short_advice_uz: economistInsight.headline,
    smartChips: [],
    cleanQuery: searchQuery,
    replyMessage: intentResult.ai_reply || intentResult.replyMessage || economistInsight.headline,

    // UI legacy
    step: 'ready',
    is_ready_to_search: true,
    normalized_query: searchQuery,
    ui_form_data: {
      regions: ["Toshkent", "Xorazm", "Samarqand", "Buxoro", "Farg'ona", "Andijon"],
      budget_ranges: ["Hamyonbop", "O‘rta toifa", "Premium"],
      features: (facets[0]?.options || []).slice(0, 4),
    },
    extracted_filters: {
      budget_max: null,
      region: activeRegion,
      specific_feature: null,
    },
    expanded_serpapi_query: searchQuery,
    dynamic_facets: facets,
  };
}

// Barcha orqaga mos chaqiruvlar
export async function runEcommerceAgent(
  userMessage: string, 
  history: ChatMessage[] = [],
  params?: { 
    region?: string; 
    budget?: string; 
    feature?: string; 
    turn_count?: number; 
    clarification_payload?: Record<string, any>;
  }
) {
  return runEcommerceAgentPipeline(userMessage, history, params);
}

export async function runEcommerceAgentV5(
  userMessage: string,
  history: ChatMessage[] = [],
  params?: { region?: string; budget?: string; feature?: string }
) {
  return runEcommerceAgentPipeline(userMessage, history, params);
}
