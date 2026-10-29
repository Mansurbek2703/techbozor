import { fetchProductsWithImages, filterRelevantProducts, SerpProductItem } from './serpapi';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface SemanticNormalizationResult {
  normalized_input: string;
  category: string;
  is_clear: boolean;
  clarifying_question: string | null;
  quick_chips: string[];
  serpapi_query: string;
  location?: string;
}

export interface AgentResponse {
  step: 'clarification' | 'recommendation';
  is_clear: boolean;
  normalized_input?: string;
  category?: string;
  clarifying_question: string | null;
  advice_markdown: string | null;
  products: SerpProductItem[];
  search_query: string | null;
  quick_chips: string[];
  raw_intent?: any;
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
 * 🎭 1-ROL: "Semantic Normalizer & Query Builder" (System Instruction)
 */
const SYSTEM_PROMPT_NORMALIZER = `You are a linguistic and e-commerce query normalizer for Uzbekistan's market.

Tasks:
1. Correct user typos, slang, and dialect terms (e.g. "svitkichi", "sovutkich", "xolodinnik", "mzlatkich" -> "muzlatgich", "xolodilnik"; "kondisaner", "kanditsaner", "12 lik" -> "12000 BTU inverter konditsioner"; "tilvizir", "smart tv" -> "Smart TV").
2. Determine the core appliance category and parameters (e.g. "12 lik konditsioner" -> "12000 BTU inverter konditsioner").
3. Identify user location preference (e.g., Xorazm, Toshkent, Samarqand, or Uzbekistan default).
4. Build an optimized SerpAPI Google query targeting ONLY valid Uzbek e-commerce domains: (site:uzum.uz OR site:olcha.uz OR site:texnomart.uz OR site:mediapark.uz OR site:asaxiy.uz).
5. Generate 3-4 contextual, clickable quick_chips in Uzbek for the buyer (e.g. ["Byudjet: 300$-400$", "Faqat Inverter", "12000 BTU"]).

Return ONLY a valid JSON object with this exact schema:
{
  "normalized_input": "Tuzatilgan o'zbekcha ibora",
  "category": "Konditsioner | Muzlatgich | Kir yuvish mashinasi | TV | boshqa",
  "is_clear": true | false,
  "clarifying_question": "So'rov o'ta noaniq bo'lsa o'zbekcha savol, aks holda null",
  "quick_chips": ["Tugma 1", "Tugma 2", "Tugma 3"],
  "serpapi_query": "Aniq qidiruv so'zi (site:uzum.uz OR site:olcha.uz OR site:texnomart.uz OR site:mediapark.uz)"
}

Rules:
- If user input is too vague (e.g. "konditsioner kerak", "menga sovutkich kerak"), set is_clear: false, provide a polite clarifying_question in Uzbek asking for room size/volume and budget, and provide relevant quick_chips.
- If user input is specific enough (e.g. "12 lik konditsioner Xorazmga", "50 duymli Smart TV 400$ gacha"), set is_clear: true and build the optimized serpapi_query.
- Return RAW JSON ONLY, no markdown ticks.`;

/**
 * 🎭 3-ROL: "UI-Ready Product Advisor" (System Instruction)
 */
const SYSTEM_PROMPT_ADVISOR = `Sen O'zbekiston e-commerce bozori bo'yicha professional AI Sotuvchi-Konsultantsan.

Vazifang: 
Faqat berilgan mahalliy do'konlar (Uzum, Olcha, Texnomart, Mediapark, Asaxiy) natijalaridan foydalanib xaridorga eng mos 2-3 ta variantni taqdim etish.

Javob formati (aniq tartibda):

1. Qisqa Tahlil va Salomlashish: 
(Misol: "Xorazm iqlimi yoki xonangiz maydoni uchun 12-lik (12,000 BTU) konditsionerlar 35-40 kv.m xona uchun ideal tanlov...")

2. Solishtirish Jadvali (Markdown Table):
| Mahsulot | Narxi | Inverter / Xususiyat | Do'kon |
|---|---|---|---|
| [Model 1] | [Narxi so'mda] | Ha / Mavjud | [Do'kon nomi] |
| [Model 2] | [Narxi so'mda] | Ha / Mavjud | [Do'kon nomi] |

3. Smart Product Cards (Har bir mahsulot uchun):
🖼 Rasm: ![Nomi](image_url)
📌 Mahsulot: [Nomi va Modeli]
💰 Narxi: [So'mda ko'rsatilgan narxi]
🏪 Do'kon: [Uzum / Olcha / Texnomart va hk]
💡 Afzalligi: [Nega O'zbekiston/hudud iqlimiga va so'rovga mosligi haqida 1 ta jumla]
🔗 Sotib olish: [Do'konga o'tish linki](havola)

4. Proaktiv Maslahat va Tavsiya (1-2 jumla).

Qoidalar:
- Faqat taqdim etilgan real O'zbekiston do'konlari natijalaridan foydalan!
- Soxta chet el do'konlari (eBay, Walmart) yoki palatka/kurtkalarni kiritma.
- Narxlar so'mda yoki aniq ko'rsatilsin.`;

/**
 * Gemini API chaqiruvi (Model kaskadi va tezkor timeout bilan)
 */
async function callGemini(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<string | null> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) return null;

  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ];

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
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2200,
              responseMimeType: jsonMode ? 'application/json' : undefined,
            },
          }),
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;

        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err) {
        // try next model
      }
    }
  }

  return null;
}

/**
 * OpenAI Fallback yordamchisi
 */
async function callOpenAI(systemPrompt: string, userPrompt: string, jsonMode: boolean = false): Promise<string | null> {
  const key = getOpenAIApiKey();
  if (!key) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * 1-BOSQICH: NORMALIZER & INTENT AI (Linguistic Normalizer & Query Builder)
 */
export async function normalizeAndClassifyIntent(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<SemanticNormalizationResult> {
  let fullContext = '';
  if (history.length > 0) {
    fullContext = 'Suhbat tarixi:\n' + history
      .map(m => `${m.role === 'user' ? 'Xaridor' : 'Konsultant'}: ${m.content}`)
      .join('\n') + '\n\n';
  }
  fullContext += `Xaridorning so'nggi so'rovi: "${userMessage}"`;

  let rawJson = await callGemini(SYSTEM_PROMPT_NORMALIZER, fullContext, true);
  if (!rawJson) {
    rawJson = await callOpenAI(SYSTEM_PROMPT_NORMALIZER, fullContext, true);
  }

  if (rawJson) {
    try {
      const clean = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      return {
        normalized_input: parsed.normalized_input || userMessage,
        category: parsed.category || 'Boshqa',
        is_clear: Boolean(parsed.is_clear),
        clarifying_question: parsed.clarifying_question || null,
        quick_chips: Array.isArray(parsed.quick_chips) ? parsed.quick_chips : ['Inverter', 'Arzonroq', 'Rasmiy kafolat'],
        serpapi_query: parsed.serpapi_query || `${userMessage} (site:uzum.uz OR site:olcha.uz OR site:texnomart.uz)`,
        location: parsed.location || 'O‘zbekiston',
      };
    } catch {
      // fallback to heuristics
    }
  }

  // Evristik fallback (Imlo xatolari va dialektlarni qo'lda to'g'rilash)
  let normalized = userMessage.trim();
  let category = 'Boshqa';
  const lower = normalized.toLowerCase();

  if (/svitkichi|sovutkich|xolodinnik|mzlatkich|xaladilnik|muzlatg/i.test(lower)) {
    category = 'Muzlatgich';
    normalized = normalized.replace(/svitkichi|xolodinnik|mzlatkich|xaladilnik/gi, 'muzlatgich');
  } else if (/kondisaner|kanditsaner|konditsaner|konditsioner|12\s*lik|18\s*lik|24\s*lik/i.test(lower)) {
    category = 'Konditsioner';
    if (/12\s*lik/i.test(lower)) normalized = normalized.replace(/12\s*lik/gi, '12000 BTU inverter konditsioner');
    else if (/18\s*lik/i.test(lower)) normalized = normalized.replace(/18\s*lik/gi, '18000 BTU inverter konditsioner');
  } else if (/kir\s*mashin|stiralka|kiryuvish/i.test(lower)) {
    category = 'Kir yuvish mashinasi';
    normalized = normalized.replace(/kir\s*mashin|stiralka/gi, 'kir yuvish mashinasi avtomat');
  } else if (/tilvizir|telvizor|smart\s*tv/i.test(lower)) {
    category = 'TV';
  }

  const isClear = /\b(\d{2,3}\s*(?:duym|dyuym|btu|kg|litr)|inverter|smart|4k|mln|so['‘]?m|\$)\b/i.test(lower) || normalized.split(' ').length >= 5;

  return {
    normalized_input: normalized,
    category: category,
    is_clear: isClear,
    clarifying_question: isClear ? null : `${category} uchun qancha budjet ajratyapsiz va qanday o‘lcham yoki funksiyalar kerak?`,
    quick_chips: category === 'Konditsioner' 
      ? ['12000 BTU Inverter', 'Xorazm iqlimiga mos', '300$-400$ gacha']
      : ['Byudjet variant', 'Inverter motor', 'Rasmiy kafolat'],
    serpapi_query: `${normalized} (site:uzum.uz OR site:olcha.uz OR site:texnomart.uz OR site:mediapark.uz)`,
  };
}

/**
 * 4-BOSQICH: SMART ADVISOR AI (UI-Ready Product Advisor)
 */
export async function generateSmartProductAdvice(
  normalizedQuery: string,
  products: SerpProductItem[],
  category: string,
  history: ChatMessage[] = []
): Promise<string> {
  const productsSummary = products.map((p, idx) => `
Mahsulot #${idx + 1}:
- Sarlavha: ${p.title}
- Narxi: ${p.price}
- Do'kon: ${p.source}
- Rasm URL: ${p.thumbnail}
- Havola: ${p.link}
- Snippet: ${p.snippet || ''}
`).join('\n');

  const promptContent = `Xaridor so'rovi (Tuzatilgan): "${normalizedQuery}" (Kategoriya: ${category})

O'zbekiston do'konlaridan topilgan va filtrdan o'tgan real mahsulotlar:
${productsSummary}

Iltimos, belgilangan formatda:
1. Qisqa Tahlil va Salomlashish (hudud yoki xona maydoni bo'yicha)
2. Solishtirish Jadvali (Markdown Table)
3. Smart Product Cards (Rasmlar, narxlar so'mda, do'kon va xarid havolalari bilan)
4. Proaktiv Maslahat
taqdim et.`;

  let advice = await callGemini(SYSTEM_PROMPT_ADVISOR, promptContent, false);
  if (!advice) {
    advice = await callOpenAI(SYSTEM_PROMPT_ADVISOR, promptContent, false);
  }

  if (advice) {
    return advice;
  }

  // Fallback Structured Markdown
  let md = `### 🌟 Siz uchun saralangan eng maqbul variantlar\n\n`;
  md += `Sizning so‘rovingiz bo‘yicha O‘zbekiston rasmiy do‘konlari (Uzum, Olcha, Texnomart) tahlil qilindi.\n\n`;
  
  // Solishtirish jadvali
  md += `| Mahsulot | Narxi | Xususiyati | Do'kon |\n|---|---|---|---|\n`;
  products.forEach(p => {
    md += `| ${p.title.slice(0, 30)}... | ${p.price} | Inverter / Kafolatlangan | ${p.source} |\n`;
  });
  md += `\n---\n\n### Tavsiya etiladigan mahsulotlar:\n\n`;

  products.forEach(p => {
    md += `🖼 ![${p.title}](${p.thumbnail})\n`;
    md += `📌 **Mahsulot:** ${p.title}\n`;
    md += `💰 **Narxi:** ${p.price}\n`;
    md += `🏪 **Do'kon:** ${p.source}\n`;
    md += `💡 **Afzalligi:** O‘zbekiston sharoitiga moslangan, rasmiy servis kafolatiga ega.\n`;
    md += `🔗 **Sotib olish:** [Do'konga o'tish linki](${p.link})\n\n---\n\n`;
  });

  md += `💡 **Ekspert Maslahati:** Xarid qilishdan oldin o‘rnatib berish xizmati va do‘kon kafolat talonini tekshirib oling.`;
  return md;
}

/**
 * ASOSIY AGENT WORKFLOW (v2.0)
 */
export async function runEcommerceAgent(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<AgentResponse> {
  // 1-BOSQICH: Normalizer & Intent AI
  const normResult = await normalizeAndClassifyIntent(userMessage, history);

  // Agar so'rov noaniq bo'lsa -> SSENARIY A (Aniqlashtirish va Quick Chips)
  if (!normResult.is_clear) {
    return {
      step: 'clarification',
      is_clear: false,
      normalized_input: normResult.normalized_input,
      category: normResult.category,
      clarifying_question: normResult.clarifying_question,
      advice_markdown: null,
      products: [],
      search_query: null,
      quick_chips: normResult.quick_chips,
      raw_intent: normResult,
    };
  }

  // 2-BOSQICH & 3-BOSQICH: Targeted SerpAPI Search & Category Filter
  const products = await fetchProductsWithImages(
    normResult.serpapi_query,
    3,
    normResult.category
  );

  // 4-BOSQICH: Smart Advisor AI
  const adviceMarkdown = await generateSmartProductAdvice(
    normResult.normalized_input,
    products,
    normResult.category,
    history
  );

  return {
    step: 'recommendation',
    is_clear: true,
    normalized_input: normResult.normalized_input,
    category: normResult.category,
    clarifying_question: null,
    advice_markdown: adviceMarkdown,
    products: products,
    search_query: normResult.serpapi_query,
    quick_chips: normResult.quick_chips.length > 0 
      ? normResult.quick_chips 
      : ['Arzonroq variantlar', 'Faqat Inverter modellar', 'Nasiya narxini hisoblash'],
    raw_intent: normResult,
  };
}
