import { fetchProductsWithImages, SerpProductItem } from './serpapi';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface IntentClassificationResult {
  is_clear: boolean;
  clarifying_question: string | null;
  search_query: string | null;
  filters: {
    max_price: number | null;
    min_price: number | null;
    brand: string | null;
  };
}

export interface AgentResponse {
  step: 'clarification' | 'recommendation';
  is_clear: boolean;
  clarifying_question: string | null;
  advice_markdown: string | null;
  products: SerpProductItem[];
  search_query: string | null;
  raw_intent?: IntentClassificationResult;
}

// Gemini API kalitlari ro'yxati
function getGeminiApiKeys(): string[] {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 5);
}

// OpenAI API zaxira kaliti
function getOpenAIApiKey(): string {
  return (process.env.OPENAI_API_KEY || '').trim();
}

/**
 * 1-ROL: INTENT CLASSIFIER & QUERY PARSER
 */
const SYSTEM_PROMPT_INTENT = `You are an intelligent e-commerce intent parser. Analyze the user prompt to determine if there is enough information to perform a precise product search.

Return ONLY a JSON object with this exact schema:
{
  "is_clear": true | false,
  "clarifying_question": "Ask a polite question in Uzbek if input is vague, else null",
  "search_query": "Optimized search query in Uzbek/Russian for Google if clear, else null",
  "filters": {
    "max_price": number | null,
    "min_price": number | null,
    "brand": "string" | null
  }
}

Rules:
1. If user input is too broad (e.g. "menga televizor kerak", "telefon olmoqchiman", "konditsioner bormi"), set "is_clear": false and write a helpful, polite "clarifying_question" in Uzbek asking for budget, size, or preferred features.
2. If user input is specific enough (e.g. "50 duymli Smart TV 400$ gacha", "Samsung Galaxy S24 Ultra", "Artel 7kg kir yuvish 4 mln"), set "is_clear": true and build "search_query" (e.g. "Smart TV 50 duym site:uzum.uz OR site:olcha.uz" or "Samsung Smart TV 50 inch").
3. Always respond with raw valid JSON, no markdown codeblocks, starting with { and ending with }.`;

/**
 * 2-ROL: E-COMMERCE VISUAL ANALYST & ADVISOR
 */
const SYSTEM_PROMPT_ADVISOR = `Sen maishiy texnika va elektronika bo'yicha tajribali AI Sotuvchi-Konsultantsan.

Vazifang: 
SerpAPI orqali internetdan topilgan mahsulotlar (matn, narx, rasm URL va havola) ro'yxatini tahlil qilib, xaridorga eng mos variantlarni taqdim etish.

Javob formati (Markdown):

1. Kirish: Xaridor tanloviga qisqa va samimiy munosabat (1-2 gap).

2. Tavsiya etiladigan mahsulotlar (Har bir mahsulot uchun):

🖼 [Mahsulot Rasmi] (Markdown rasm sintaksisida: ![Nomi](image_url))
📌 Mahsulot: [To'liq nomi]
💰 Narxi: [Aniq narxi va valyutasi]
🏪 Manba/Do'kon: [Do'kon nomi]
💡 Afzalligi: [Xaridor so'roviga nega mos kelgani haqida 1 ta gap]
🔗 Sotib olish: [Do'konga o'tish linki](havola)

3. Ekspert Maslahati: Xarid qilishda e'tibor berish kerak bo'lgan 1 ta muhim maslahat.

Qoidalar:
- Faqat taqdim etilgan real SerpAPI natijalaridagi rasm va havolalardan foydalan! Rasm yoki havolalarni o'zingdan to'qima.
- Rasmlar va havolalar ishlaydigan va to'g'ri biriktirilgan bo'lishi shart.
- Javobni chiroyli va tushunarli o'zbek tilida taqdim et.`;

/**
 * Gemini API orqali so'rov yuborish yordamchisi (rotatsiya va timeout bilan)
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
              maxOutputTokens: 2000,
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
        // next candidate
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
 * 1-BOSQICH: INTENT CLASSIFICATION VA QUERY GENERATION
 */
export async function classifyIntent(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<IntentClassificationResult> {
  // Suhbat kontekstini birlashtirish
  let fullContext = '';
  if (history.length > 0) {
    fullContext = 'Suhbat tarixi:\n' + history
      .map(m => `${m.role === 'user' ? 'Xaridor' : 'Konsultant'}: ${m.content}`)
      .join('\n') + '\n\n';
  }
  fullContext += `Xaridorning so'nggi so'rovi: "${userMessage}"`;

  let rawJson = await callGemini(SYSTEM_PROMPT_INTENT, fullContext, true);
  if (!rawJson) {
    rawJson = await callOpenAI(SYSTEM_PROMPT_INTENT, fullContext, true);
  }

  if (rawJson) {
    try {
      const clean = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      return {
        is_clear: Boolean(parsed.is_clear),
        clarifying_question: parsed.clarifying_question || null,
        search_query: parsed.search_query || null,
        filters: {
          max_price: parsed.filters?.max_price ?? null,
          min_price: parsed.filters?.min_price ?? null,
          brand: parsed.filters?.brand ?? null,
        },
      };
    } catch {
      // fallback to heuristics
    }
  }

  // Aqlli Lokal Evristika (Heuristics Fallback)
  const lower = (fullContext + ' ' + userMessage).toLowerCase();
  const words = userMessage.trim().split(/\s+/);

  // Aniq parametrlar bormi? (dyuym, narx, model raqami, brend)
  const hasBudget = /(\d+[\.,]?\d*)\s*(?:mln|million|milyon|\$|usd|so[‘']?m)/i.test(lower) || /\d{5,8}/.test(lower);
  const hasSpecifics = /\b(\d{2,3}\s*(?:duym|dyuym|inch|sm|kg|btu|litr)|4k|smart|inverter|oled|qled|ultra|pro|plus|max)\b/i.test(lower);
  const hasBrand = /\b(samsung|lg|artel|shivaki|midea|tcl|sony|apple|xiaomi|roborock|bosch)\b/i.test(lower);

  if ((hasBudget && (hasSpecifics || hasBrand)) || (hasSpecifics && hasBrand) || words.length >= 6) {
    let q = userMessage.trim();
    if (!q.toLowerCase().includes('site:')) {
      q += ' site:uzum.uz OR site:olcha.uz OR site:texnomart.uz';
    }
    return {
      is_clear: true,
      clarifying_question: null,
      search_query: q,
      filters: { max_price: null, min_price: null, brand: null },
    };
  }

  // Aks holda noaniq so'rov: Aniqlashtiruvchi savol berish kerak
  let politeQuestion = "Qidirayotgan texnikangiz uchun qancha budjet rejalashtiryapsiz va qanday o‘lcham yoki qo‘shimcha talablaringiz bor?";
  if (lower.includes('televizor') || lower.includes('tv')) {
    politeQuestion = "Televizor uchun qancha budjet ajratyapsiz va xonangizga mos qanday o‘lcham (masalan: 43, 50 yoki 55 dyuym) hamda Smart TV kerakmi?";
  } else if (lower.includes('sovutkich') || lower.includes('xolodilnik')) {
    politeQuestion = "Sovutkichning sig‘imi (litr), No Frost funksiyasi va taxminiy budjetingiz qancha?";
  } else if (lower.includes('kir') || lower.includes('mashina')) {
    politeQuestion = "Kir yuvish mashinasining sig‘imi (masalan: 6kg, 7kg yoki 8kg), Inverter motor va mo‘ljallangan budjetingiz qanday?";
  } else if (lower.includes('konditsioner') || lower.includes('split')) {
    politeQuestion = "Konditsioner qancha maydonga (m²) mo‘ljallangan va qishda isitish (Inverter) talab qilinadimi?";
  }

  return {
    is_clear: false,
    clarifying_question: politeQuestion,
    search_query: null,
    filters: { max_price: null, min_price: null, brand: null },
  };
}

/**
 * 3-BOSQICH: E-COMMERCE VISUAL ANALYST & ADVISOR (YAKUNIY JAVOB)
 */
export async function generateProductAdvice(
  userQuery: string,
  products: SerpProductItem[],
  history: ChatMessage[] = []
): Promise<string> {
  const productsSummary = products.map((p, idx) => `
Mahsulot #${idx + 1}:
- Sarlavha: ${p.title}
- Narxi: ${p.price}
- Manba/Do'kon: ${p.source}
- Rasm URL: ${p.thumbnail || 'mavjud emas'}
- Havola: ${p.link}
- Tavsif/Snippet: ${p.snippet || ''}
`).join('\n');

  const promptContent = `Xaridor so'rovi: "${userQuery}"\n\nSerpAPI orqali internetdan topilgan real mahsulotlar:\n${productsSummary}\n\nIltimos, yuqoridagi qoidalarga qat'iy rioya qilgan holda xaridorga Markdown formatida maslahat bering. Rasmlar va havolalarni faqat yuqorida keltirilgan real URL'lardan foydalanib kiriting.`;

  let advice = await callGemini(SYSTEM_PROMPT_ADVISOR, promptContent, false);
  if (!advice) {
    advice = await callOpenAI(SYSTEM_PROMPT_ADVISOR, promptContent, false);
  }

  if (advice) {
    return advice;
  }

  // Fallback Markdown agar AI modellari javob bermasa
  let md = `### 🌟 Siz uchun saralangan eng maqbul variantlar\n\nSiz kiritgan talablar bo‘yicha internet va do‘konlar bo‘yicha real variantlar tahlil qilindi:\n\n`;
  products.forEach((p, i) => {
    md += `#### ${i + 1}. ${p.title}\n`;
    if (p.thumbnail) {
      md += `![${p.title}](${p.thumbnail})\n\n`;
    }
    md += `📌 **Mahsulot:** ${p.title}\n`;
    md += `💰 **Narxi:** ${p.price}\n`;
    md += `🏪 **Do'kon:** ${p.source}\n`;
    md += `💡 **Afzalligi:** Talabingizga to'liq mos va internetda eng yuqori baholangan variant.\n`;
    if (p.link && p.link !== '#') {
      md += `🔗 [Do'konga o'tish va xarid qilish](${p.link})\n\n`;
    }
    md += `---\n\n`;
  });
  md += `💡 **Ekspert Maslahati:** Xarid qilishdan oldin do‘kondan rasmiy servis kafolati va yetkazib berish shartlarini aniqlashtirib oling.`;

  return md;
}

/**
 * BUTUN SIKLNI BOSHQARUVCHI ASOSIY AGENT FUNKSIYASI
 */
export async function runEcommerceAgent(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<AgentResponse> {
  // 1-bosqich: Intent Classifier
  const classification = await classifyIntent(userMessage, history);

  // Agar so'rov noaniq bo'lsa -> SSENARIY A (Aniqlashtirish)
  if (!classification.is_clear) {
    return {
      step: 'clarification',
      is_clear: false,
      clarifying_question: classification.clarifying_question,
      advice_markdown: null,
      products: [],
      search_query: null,
      raw_intent: classification,
    };
  }

  // Agar so'rov aniq bo'lsa -> SSENARIY B (Qidiruv va Tahlil)
  const searchQuery = classification.search_query || userMessage;

  // 2-bosqich: SerpAPI orqali mahsulotlarni tortib olish
  const products = await fetchProductsWithImages(searchQuery, 4);

  // 3-bosqich: Gemini AI orqali tahlil va maslahat
  const adviceMarkdown = await generateProductAdvice(userMessage, products, history);

  return {
    step: 'recommendation',
    is_clear: true,
    clarifying_question: null,
    advice_markdown: adviceMarkdown,
    products: products,
    search_query: searchQuery,
    raw_intent: classification,
  };
}
