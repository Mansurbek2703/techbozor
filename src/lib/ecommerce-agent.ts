import { 
  searchLocalProducts, 
  detectCategoryKey,
  calculateEnergyMetrics,
  CATEGORY_RULES,
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

export interface AgentPipelineResponse {
  type: 'CHAT' | 'SEARCH';
  ui_mode: 'CONVERSATION_ONLY' | 'PRODUCT_RESULTS';
  ai_reply: string;
  state?: 'CONVERSATION' | 'NEED_CLARIFICATION' | 'PRODUCT_SEARCH';
  status: 'NEED_CLARIFICATION' | 'READY_TO_SEARCH';
  turn_count: number;
  category: string;
  category_key: string;
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
  return (process.env.OPENAI_API_KEY || '').trim();
}

/**
 * 🤖 1-QATLAM: "Aqlli Hamroh" va Niyatni Marshrutlash (The Ultimate Open-World Commerce Controller - V14.0)
 */
const SYSTEM_PROMPT_INTENT_ROUTER = `Siz O'zbekistonning eng aqlli elektron tijorat maslahatchisisiz (The Ultimate Open-World Commerce AI - V14.0).
Foydalanuvchi BARCHA TURDAGI mahsulotlarni (kiyim-kechak, maishiy texnika, oziq-ovqat, qurilish mollari, elektronika, oshxona anjomlari, kantselyariya, sport mollari va h.k.) so'rashi mumkin.

QAT'IY QOIDA (ZERO-HARDCODE):
Hech qachon o'zingizcha "Noutbuk", "Telefon", "Konditsioner" kabi toifalarni tiqishtirmang! Foydalanuvchi nima so'ragan bo'lsa (masalan, Paypoq, Qishki kurtka, Daftar, G'isht, Televizor va h.k.), keyingi savolingiz va taklif qiladigan Smart Chiplaringiz FAQAT VA FAQAT SHU MAHSULOTGA taalluqli bo'lishi SHART.

Misol 1: Agar mijoz "Klassik paypoqlar" desa:
Noto'g'ri: "Noutbuk ko'rasizmi?"
To'g'ri: "Klassik paypoqlarni qanday materialdan (paxta, bambuk) va qanday rangda izlayapsiz?"
To'g'ri Chiplar: [{"label": "🧦 100% Paxta", "payload": "paxta paypoq"}, {"label": "🖤 Qora rangli", "payload": "qora klassik paypoq"}, {"label": "🎋 Bambuk tola", "payload": "bambuk paypoq"}]

Misol 2: Agar mijoz "Menga qishki kurtka kerak" desa:
To'g'ri: "Qishki kurtkani kim uchun qidiryapsiz? Erkaklar, ayollar yoki bolalar uchunmi?"
To'g'ri Chiplar: [{"label": "🧥 Erkaklar kurtkasi", "payload": "erkaklar qishki kurtkasi"}, {"label": "👗 Ayollar kurtkasi", "payload": "ayollar qishki kurtkasi"}, {"label": "🧒 Bolalar kurtkasi", "payload": "bolalar qishki kurtkasi"}]

Misol 3: Agar mijoz "Erkaklar kurtkasi" desa (2-bosqich):
To'g'ri: "Erkaklar qishki kurtkasi qanday material (charm, sintepon, xolofayber) yoki uslubda bo'lsin?"
To'g'ri Chiplar: [{"label": "🧥 Sintepon / Xolofayber", "payload": "erkaklar qishki kurtkasi sintepon"}, {"label": "👔 Qalin Charm / Duxobka", "payload": "erkaklar charm qishki kurtka"}, {"label": "❄️ Termo / Suv o'tkazmas", "payload": "erkaklar suv otkazmas termo kurtka"}]

HAR QANDAY SO'ROVNI 2 TA ASOSIY TURGA (TYPE) VA 3 TA HOLATGA (STATE) AJRATING:
1. TYPE "CHAT" (Muloqot yoki Aniqlashtirish):
   - Qachon: Salomlashish, umumiy maslahat yoki mahsulot parametrlari (o'lchami, materiali, modeli, rangi, vazifasi) hali to'liq aniqlashtirilmagan bo'lsa.
   - HARAKAT: Hech qanday mahsulot qidiruvi qilinmaydi! searchQuery va cleanQuery BO'SH STRING bo'ladi.
   - status: "NEED_CLARIFICATION", state: "NEED_CLARIFICATION" (yoki salomlashish bo'lsa "CONVERSATION").
2. TYPE "SEARCH" (Aniq Mahsulot Qidiruvi):
   - Qachon: Mijoz aynan qanday parametrli yoki qaysi modeldagi mahsulotni xohlayotgani aniq bo'lsa (masalan: "erkaklar qishki kurtkasi sintepon", "paxta paypoq qora", "12 lik inverter konditsioner", "asus vivobook 16gb", "midea 12 btu").
   - HARAKAT: searchQuery va cleanQuery to'ldiriladi. status: "READY_TO_SEARCH", state: "PRODUCT_SEARCH".

CHIQISH FORMATI (Faqat toza JSON):
{
  "type": "CHAT | SEARCH",
  "state": "CONVERSATION | NEED_CLARIFICATION | PRODUCT_SEARCH",
  "status": "NEED_CLARIFICATION | READY_TO_SEARCH",
  "categoryKey": "mijoz so'ragan mahsulotning toza lotincha nomi (masalan: kurtka, paypoq, gisht, noutbuk, telefon, idish, kiyim)",
  "searchQuery": "faqat SEARCH bo'lsa toza qidiruv so'zi, CHAT bo'lsa bo'sh",
  "cleanQuery": "faqat SEARCH bo'lsa toza qidiruv so'zi, CHAT bo'lsa bo'sh",
  "ai_reply": "Mijoz so'ragan mahsulotga 100% moslashtirilgan, mantiqiy va professional savol/maslahat (Maksimal 2 gap).",
  "replyMessage": "Mijoz so'ragan mahsulotga 100% moslashtirilgan, mantiqiy va professional savol/maslahat (Maksimal 2 gap).",
  "smartChips": [
     {"label": "Chip 1 (Emoji bilan)", "payload": "Aynan shu mahsulotga oid aniqlashtiruvchi parametr yoki qidiruv so'zi"},
     {"label": "Chip 2 (Emoji bilan)", "payload": "Aynan shu mahsulotga oid variant"},
     {"label": "Chip 3 (Emoji bilan)", "payload": "Aynan shu mahsulotga oid variant"}
  ]
};`;

/**
 * 🎩 2.2. Bosh Iqtisodchi va Xarid Strategi (Lead Economist Advisor - V7.0)
 */
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
  region: string,
  cleanProducts: SerpProductItem[]
): Promise<EconomistInsight> {
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

  // 1-QATLAM: Intent AI & Clarification FSM
  let intentResult: any = null;

  // Agar Gemini/OpenAI mavjud bo'lsa va turn < 3 bo'lsa, AI ga yuborish
  // V14.0: Har doim GPT chaqiriladi (clarification_payload yoki turn 2 bo'lsa ham)
  if (currentTurn < 5) {
    const aiPrompt = `FOYDALANUVCHI SO'ROVI: "${userMessage}"
JORIY BOSQICH (TURN): ${currentTurn}
HUDUD: ${targetRegion}
Iltimos, texnik topshiriqdagi JSON formatda javob bering.`;

    // 🧠 1-o'rinda pullik ChatGPT (OpenAI) API dan suhbat tarixi bilan birga foydalanish (V13.0)
    const rawAiJson = await callOpenAI(SYSTEM_PROMPT_INTENT_ROUTER, aiPrompt, history, true)
      || await callGemini(SYSTEM_PROMPT_INTENT_ROUTER, aiPrompt, history, true);

    if (rawAiJson) {
      try {
        const cleaned = rawAiJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        
        const isChat = parsed.type === 'CHAT' || parsed.state === 'CONVERSATION' || parsed.state === 'NEED_CLARIFICATION' || (!parsed.searchQuery && !parsed.cleanQuery);
        const state: 'CONVERSATION' | 'NEED_CLARIFICATION' | 'PRODUCT_SEARCH' =
          isChat
            ? (parsed.state === 'NEED_CLARIFICATION' ? 'NEED_CLARIFICATION' : 'CONVERSATION')
            : 'PRODUCT_SEARCH';

        const cleanQuery = (!isChat)
          ? (parsed.searchQuery || parsed.cleanQuery || userMessage)
          : '';
        const detectedKey = (parsed.categoryKey && parsed.categoryKey !== 'boshqa')
          ? parsed.categoryKey
          : (detectCategoryKey(cleanQuery || userMessage) !== 'boshqa' ? detectCategoryKey(cleanQuery || userMessage) : (parsed.categoryKey || 'boshqa'));
        const chips: Array<{ label: string; payload: string }> = Array.isArray(parsed.smartChips)
          ? parsed.smartChips
          : (parsed.clarification_data?.options || []);
        const replyMsg = parsed.message || parsed.replyMessage || (parsed.clarification_data?.question) || '';

        intentResult = {
          type: isChat ? 'CHAT' : 'SEARCH',
          ui_mode: isChat ? 'CONVERSATION_ONLY' : 'PRODUCT_RESULTS',
          ai_reply: replyMsg,
          state,
          status: state === 'PRODUCT_SEARCH' ? 'READY_TO_SEARCH' : 'NEED_CLARIFICATION',
          turn_count: currentTurn,
          category: CATEGORY_RULES[detectedKey]?.name || parsed.category || (state === 'CONVERSATION' ? 'Muloqot' : 'Maslahat'),
          category_key: detectedKey,
          cleanQuery,
          replyMessage: replyMsg,
          smartChips: chips,
          search_payload: {
            query: cleanQuery || userMessage,
            category_key: detectedKey,
          },
          clarification_data: chips.length > 0 ? {
            question: replyMsg || "Iltimos, tanlang:",
            options: chips.map((c: any, idx: number) => ({
              id: `chip_${idx}`,
              label: c.label || c.title || String(c),
              payload: { filter: c.payload || c.queryAppend || c.label }
            }))
          } : null,
          normalized_params: {
            region: targetRegion,
            item_type: detectedKey
          }
        };
      } catch {}
    }
  }

  // Fallback FSM (V13.0 Kognitiv Xotira)
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
    };
  }

  // Turn count ni yangilash
  intentResult.turn_count = currentTurn;

  // 🛑 1-BOSQICH: GPT'NI "CONTROLLER" QILISH
  // Agar type === "CHAT" (yoki CONVERSATION / NEED_CLARIFICATION):
  // HECH QANDAY SERPAPI QIDIRUVI QILINMAYDI! Mahsulotlar va jadvallar bo'sh ketadi!
  if (intentResult.type === 'CHAT' || intentResult.ui_mode === 'CONVERSATION_ONLY' || intentResult.state === 'CONVERSATION' || intentResult.state === 'NEED_CLARIFICATION' || (intentResult.status === 'NEED_CLARIFICATION' && currentTurn < 3)) {
    const adviceText = intentResult.ai_reply || intentResult.replyMessage || intentResult.clarification_data?.question || 'Assalomu alaykum! Men "Aqlli Bozor" xarid yordamchisiman. Sizga qanday tovar bo‘yicha yordam bera olaman?';

    return {
      type: 'CHAT',
      ui_mode: 'CONVERSATION_ONLY',
      ai_reply: adviceText,
      state: intentResult.state || 'CONVERSATION',
      status: 'NEED_CLARIFICATION',
      turn_count: currentTurn,
      category: intentResult.category || 'Muloqot va Maslahat',
      category_key: intentResult.category_key || 'boshqa',
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
        region: targetRegion,
        specific_feature: null,
      },
      expanded_serpapi_query: null,
      dynamic_facets: [],
    };
  }

  // 🚀 STATE 3: PRODUCT_SEARCH (Faqat 100% ishonch bo'lganda Qora ishlar, SerpAPI va Sanitizatsiya)
  const searchQuery = intentResult.cleanQuery || intentResult.search_payload?.query || userMessage;
  const categoryKey = intentResult.category_key || detectCategoryKey(searchQuery, intentResult.category);
  const activeRegion = intentResult.normalized_params?.region || targetRegion;

  const rawProducts = await searchLocalProducts(searchQuery, intentResult.category, activeRegion);
  // Faqat eng sara 4 ta natija
  const cleanProducts = rawProducts.slice(0, 4);

  // 4-QATLAM: Bosh Iqtisodchi AI (Lead Economist Advisor)
  const economistInsight = await generateEconomistInsight(categoryKey, activeRegion, cleanProducts);

  // 5-QATLAM: Taqqoslash Jadvali va Formatlangan Chiqish
  const comparisonTable = buildComparisonTable(cleanProducts);
  const facets = generateAdaptiveFacets(cleanProducts);

  return {
    type: 'SEARCH',
    ui_mode: 'PRODUCT_RESULTS',
    ai_reply: intentResult.ai_reply || intentResult.replyMessage || economistInsight.headline,
    state: 'PRODUCT_SEARCH',
    status: 'READY_TO_SEARCH',
    turn_count: currentTurn,
    category: intentResult.category || CATEGORY_RULES[categoryKey]?.name || 'Texnika',
    category_key: categoryKey,
    normalized_params: intentResult.normalized_params || { region: activeRegion },
    clarification_data: intentResult.clarification_data || (intentResult.smartChips && intentResult.smartChips.length > 0 ? {
      question: "Iltimos, aniqroq natija uchun bittasini tanlang:",
      options: intentResult.smartChips.map((c: any, i: number) => ({
        id: `chip_${i}`,
        label: c.label,
        payload: { filter: c.payload }
      }))
    } : null),
    economist_insight: economistInsight,
    search_payload: {
      query: searchQuery,
      category_key: categoryKey
    },
    products: cleanProducts,
    comparison_table: comparisonTable,
    short_advice_uz: economistInsight.headline,
    smartChips: intentResult.smartChips || [],
    cleanQuery: searchQuery,

    // UI legacy
    step: 'ready',
    is_ready_to_search: true,
    normalized_query: searchQuery,
    ui_form_data: {
      regions: ["Toshkent", "Xorazm", "Samarqand", "Buxoro", "Farg'ona", "Andijon"],
      budget_ranges: ["Hamyonbop", "O‘rta toifa", "Premium"],
      features: ["Energiya tejamkor", "Rasmiy kafolat", "Tezkor yetkazish"],
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
