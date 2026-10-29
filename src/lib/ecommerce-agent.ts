import { searchLocalProducts, validateAndFilterProducts, SerpProductItem } from './serpapi';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DynamicFilterFacet {
  id: string;
  label: string;
  options: string[];
}

export interface ExtractedFilters {
  budget_max: number | null;
  region: string | null;
  specific_feature?: string | null;
  brand?: string | null;
}

export interface CoreAdaptiveAgentResult {
  user_intent: string;
  category: string | null;
  is_ready_for_search: boolean;
  ai_response_text: string;
  dynamic_chips: string[];
  extracted_filters: ExtractedFilters;
  serpapi_query: string | null;
}

export interface AgentV4Response {
  step: 'clarification' | 'recommendation';
  is_ready_for_search: boolean;
  user_intent: string;
  category: string | null;
  ai_response_text: string;
  dynamic_chips: string[];
  extracted_filters: ExtractedFilters;
  serpapi_query: string | null;
  products: SerpProductItem[];
  dynamic_facets: DynamicFilterFacet[];
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
 * 🎭 1-ROL: "Core Adaptive Agent" (v4.0 System Prompt)
 */
const SYSTEM_PROMPT_CORE_AGENT_V4 = `You are the core AI E-Commerce Assistant for an Uzbek platform. Your job is to understand user intent, correct typos/slang, and gather missing parameters dynamically.

Tasks:
1. Typo & Slang Correction: Correct typos, slang, and dialect terms in Uzbek/Russian (e.g., "svitkichi", "sovutkich", "xolodinnik", "mzlatkich", "kholodinnik" -> "Muzlatgich"; "12 lik", "kondisaner", "kanditsaner" -> "12000 BTU inverter konditsioner"; "55 lik smart" -> "55 dyuym 4K Smart TV"; "stiralka", "kir mashin" -> "Kir yuvish mashinasi").
2. Slot-Filling: Extract category, budget_max, specific_feature (inverter, no frost, 4K), and region (e.g. Xorazm, Toshkent, Samarqand, Buxoro, Farg'ona).
3. Region & Readiness Logic (CRITICAL):
   - If the user has NOT provided their destination region, set is_ready_for_search: false, ask which region/city to deliver to in ai_response_text, and put top region names in dynamic_chips (e.g., ["Toshkent shahri", "Xorazm", "Samarqand", "Buxoro", "Farg'ona"]).
   - If region is known but the product request is too vague (e.g. "menga texnika kerak"), set is_ready_for_search: false and ask clarifying questions with category chips.
   - If region is known AND category/product is identified, set is_ready_for_search: true, and generate an enriched serpapi_query targeting Uzbek e-commerce stores (e.g., "12000 BTU inverter konditsioner narxi site:uzum.uz OR site:olcha.uz OR site:texnomart.uz OR site:mediapark.uz").

Return ONLY a valid JSON object matching this schema:
{
  "user_intent": "normalized search intent in Uzbek (e.g. 12000 BTU Inverter Konditsioner Xorazm)",
  "category": "Konditsioner | Muzlatgich | Kir yuvish mashinasi | Televizor | null",
  "is_ready_for_search": true | false,
  "ai_response_text": "Friendly response or clarifying question in Uzbek",
  "dynamic_chips": ["Option 1", "Option 2", "Option 3"],
  "extracted_filters": {
    "budget_max": number | null,
    "region": "Xorazm | Toshkent | null",
    "specific_feature": "inverter | null"
  },
  "serpapi_query": "optimized query string for local stores if ready, else null"
}`;

/**
 * 🎭 2-ROL: "Local E-Commerce & Facet Generator" (v4.0 System Prompt)
 */
const SYSTEM_PROMPT_FACET_ADVISOR_V4 = `Sen O'zbekiston bozoriga ixtisoslashgan professional AI Sotuvchi-Konsultantsan.

Vazifalaring:
1. Topilgan O'zbekiston do'konlari mahsulotlarini tahlil qilib, xaridorga samimiy va professional tavsiya bering.
2. Har bir mahsulot uchun nima sababdan ushbu xaridorga va hudud iqlimiga mosligini qisqa ayting.
3. Foydalanuvchi uchun keyingi bosqichda bosishi mumkin bo'lgan 3-4 ta tezkor variant tugmalarini (dynamic_chips) bering.

Javobni toza, samimiy va chiroyli o'zbek tilida bering.`;

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
                parts: [{ text: `${systemPrompt}\n\nUSER INPUT:\n${userPrompt}` }],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2500,
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
        // try next candidate
      }
    }
  }

  return null;
}

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
 * Topilgan mahsulotlar asosida Dinamik Filtrlar (Adaptive Facets) yaratish
 */
export function generateAdaptiveFacets(products: SerpProductItem[], category?: string | null): DynamicFilterFacet[] {
  const facets: DynamicFilterFacet[] = [];
  const catLower = (category || '').toLowerCase();

  // 1. Brendlar bo'yicha dinamik filtr
  const brandsSet = new Set<string>();
  const knownBrands = ['Samsung', 'LG', 'Artel', 'Shivaki', 'Midea', 'Gree', 'TCL', 'Bosch', 'Xiaomi', 'Aux', 'Haier'];
  
  products.forEach(p => {
    const title = p.title.toLowerCase();
    knownBrands.forEach(b => {
      if (title.includes(b.toLowerCase())) {
        brandsSet.add(b);
      }
    });
  });

  if (brandsSet.size > 0) {
    facets.push({
      id: 'brand',
      label: 'Brend',
      options: ['Hammasi', ...Array.from(brandsSet)],
    });
  }

  // 2. Kategoriya bo'yicha maxsus xususiyatlar filtri
  if (catLower.includes('konditsioner')) {
    facets.push({
      id: 'feature',
      label: 'Xususiyat',
      options: ['Hammasi', 'Inverter', 'On/Off', '12000 BTU', '18000 BTU', 'Wi-Fi'],
    });
    facets.push({
      id: 'area',
      label: 'Maydon',
      options: ['Hammasi', '35 m² gacha', '50 m² gacha', '70 m² gacha'],
    });
  } else if (catLower.includes('muzlat') || catLower.includes('sovut')) {
    facets.push({
      id: 'feature',
      label: 'Tizim',
      options: ['Hammasi', 'Total No Frost', 'Inverter kompressor', 'De Frost'],
    });
  } else if (catLower.includes('kir')) {
    facets.push({
      id: 'capacity',
      label: 'Sig‘im',
      options: ['Hammasi', '6 kg', '7 kg', '8 kg', '10 kg'],
    });
    facets.push({
      id: 'feature',
      label: 'Motor turi',
      options: ['Hammasi', 'Inverter Direct Drive', 'Bug‘da yuvish (Steam)'],
    });
  } else if (catLower.includes('tv') || catLower.includes('televizor')) {
    facets.push({
      id: 'size',
      label: 'Ekran diagonali',
      options: ['Hammasi', '43 dyuym', '50 dyuym', '55 dyuym', '65 dyuym'],
    });
    facets.push({
      id: 'feature',
      label: 'Ruxsat',
      options: ['Hammasi', '4K Ultra HD', 'Full HD', 'Smart TV'],
    });
  }

  // 3. Narx filtri
  facets.push({
    id: 'price_range',
    label: 'Narx oralig‘i',
    options: ['Hammasi', '3 mln so‘mgacha', '3 - 5 mln so‘m', '5 mln so‘mdan yuqori'],
  });

  return facets;
}

/**
 * 1-BOSQICH: CORE ADAPTIVE AGENT EXECUTION
 */
export async function executeCoreAdaptiveAgent(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<CoreAdaptiveAgentResult> {
  let contextText = '';
  if (history.length > 0) {
    contextText = 'Oldingi suhbat:\n' + history
      .map(m => `${m.role === 'user' ? 'Xaridor' : 'AI'}: ${m.content}`)
      .join('\n') + '\n\n';
  }
  contextText += `Foydalanuvchi so'rovi: "${userMessage}"`;

  let rawJson = await callGemini(SYSTEM_PROMPT_CORE_AGENT_V4, contextText, true);
  if (!rawJson) {
    rawJson = await callOpenAI(SYSTEM_PROMPT_CORE_AGENT_V4, contextText, true);
  }

  if (rawJson) {
    try {
      const clean = rawJson.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(clean);
      return {
        user_intent: parsed.user_intent || userMessage,
        category: parsed.category || null,
        is_ready_for_search: Boolean(parsed.is_ready_for_search),
        ai_response_text: parsed.ai_response_text || 'Qaysi viloyatga yetkazib berish kerak?',
        dynamic_chips: Array.isArray(parsed.dynamic_chips) ? parsed.dynamic_chips : ['Toshkent shahri', 'Xorazm', 'Samarqand', 'Farg‘ona'],
        extracted_filters: {
          budget_max: parsed.extracted_filters?.budget_max ?? null,
          region: parsed.extracted_filters?.region ?? null,
          specific_feature: parsed.extracted_filters?.specific_feature ?? null,
          brand: parsed.extracted_filters?.brand ?? null,
        },
        serpapi_query: parsed.serpapi_query || null,
      };
    } catch {}
  }

  // Aqlli Lokal Evristika (Fallback)
  const full = (contextText + ' ' + userMessage).toLowerCase();
  const REGIONS = ['toshkent', 'xorazm', 'samarqand', 'buxoro', 'farg‘ona', 'fargona', 'andijon', 'namangan', 'qashqadaryo', 'surxondaryo', 'navoiy', 'jizzax', 'sirdaryo', 'nukus', 'qoraqalpog‘iston'];
  let foundRegion: string | null = null;
  for (const r of REGIONS) {
    if (full.includes(r)) {
      foundRegion = r.charAt(0).toUpperCase() + r.slice(1);
      break;
    }
  }

  let cat = 'Texnika';
  let normalized = userMessage.trim();
  if (/kondits|kandits|12\s*lik|18\s*lik|split/i.test(full)) {
    cat = 'Konditsioner';
    normalized = normalized.replace(/12\s*lik/gi, '12000 BTU Inverter Konditsioner');
  } else if (/muzlat|sovut|xolod|kholod/i.test(full)) {
    cat = 'Muzlatgich';
    normalized = normalized.replace(/svitkichi|xolodinnik|mzlatkich|kholodinnik/gi, 'Muzlatgich No Frost');
  } else if (/kir\s*mash|stiralk/i.test(full)) {
    cat = 'Kir yuvish mashinasi';
    normalized = normalized.replace(/kir\s*mashin|stiralka/gi, 'Kir yuvish mashinasi avtomat');
  } else if (/tv|televiz|smart/i.test(full)) {
    cat = 'Televizor';
  }

  if (!foundRegion) {
    return {
      user_intent: normalized,
      category: cat,
      is_ready_for_search: false,
      ai_response_text: `Yetkazib berish qaysi viloyat yoki shaharga kerak? Hududingizga mos narx va servis kafolatini aniqlab beraman:`,
      dynamic_chips: ['Toshkent shahri', 'Xorazm', 'Samarqand', 'Buxoro', 'Farg‘ona'],
      extracted_filters: { budget_max: null, region: null, specific_feature: null },
      serpapi_query: null,
    };
  }

  return {
    user_intent: `${normalized} ${foundRegion}`,
    category: cat,
    is_ready_for_search: true,
    ai_response_text: `${foundRegion} hududi uchun eng maqbul ${cat.toLowerCase()} modellarini O‘zbekiston rasmiy do‘konlaridan topdim:`,
    dynamic_chips: ['Faqat Inverter', 'Arzonroq variantlar', 'Nasiya hisoblash'],
    extracted_filters: { budget_max: null, region: foundRegion, specific_feature: null },
    serpapi_query: `${cat} ${normalized} narxi site:uzum.uz OR site:olcha.uz OR site:texnomart.uz`,
  };
}

/**
 * 🚀 UNIFIED AI E-COMMERCE ENGINE v4.0 ASOSIY WORKFLOW
 */
export async function runEcommerceAgentV4(
  userMessage: string,
  history: ChatMessage[] = []
): Promise<AgentV4Response> {
  // 1-BOSQICH: Core Adaptive Agent
  const coreResult = await executeCoreAdaptiveAgent(userMessage, history);

  // Agar qidiruvga tayyor bo'lmasa -> Clarification
  if (!coreResult.is_ready_for_search || !coreResult.serpapi_query) {
    return {
      step: 'clarification',
      is_ready_for_search: false,
      user_intent: coreResult.user_intent,
      category: coreResult.category,
      ai_response_text: coreResult.ai_response_text,
      dynamic_chips: coreResult.dynamic_chips,
      extracted_filters: coreResult.extracted_filters,
      serpapi_query: null,
      products: [],
      dynamic_facets: [],
    };
  }

  // 2-BOSQICH: Qidiruv va Natijalarni Tozalash
  const targetRegion = coreResult.extracted_filters.region || 'O‘zbekiston';
  const products = await searchLocalProducts(
    coreResult.serpapi_query,
    coreResult.category || undefined,
    targetRegion
  );

  // Dinamik filtrlar (Adaptive Facets) faqat topilgan natijalarga qarab hosil qilinadi
  const facets = generateAdaptiveFacets(products, coreResult.category);

  return {
    step: 'recommendation',
    is_ready_for_search: true,
    user_intent: coreResult.user_intent,
    category: coreResult.category,
    ai_response_text: coreResult.ai_response_text,
    dynamic_chips: coreResult.dynamic_chips,
    extracted_filters: coreResult.extracted_filters,
    serpapi_query: coreResult.serpapi_query,
    products: products,
    dynamic_facets: facets,
  };
}

// Barcha qadimgi chaqiruvlar uchun yagona eksport
export async function runEcommerceAgent(userMessage: string, history: ChatMessage[] = []) {
  return runEcommerceAgentV4(userMessage, history);
}

export async function runEcommerceAgentV3(userMessage: string, history: ChatMessage[] = []) {
  return runEcommerceAgentV4(userMessage, history);
}
