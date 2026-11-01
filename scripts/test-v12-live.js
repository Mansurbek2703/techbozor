const fs = require('fs');

// Load environment variables from .env.local
const env = fs.readFileSync('.env.local', 'utf8');
env.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const k = parts[0].trim();
    const v = parts.slice(1).join('=').trim();
    if (k && !process.env[k]) process.env[k] = v;
  }
});

const key = process.env.OPENAI_API_KEY;

const CONTROLLER_SYSTEM_PROMPT = `Siz O'zbekistonning eng malakali biznes, xarid va elektron savdo bo'yicha Controllerisiz (The Ultimate Commerce Controller - V12.0).
Mijozning yozgan har qanday xom, shevadagi, orfografik xatoli yoki ikkilantiruvchi so'rovini chuqur tahlil qiling va qat'iy JSON qaytaring.

HAR QANDAY SO'ROVNI 2 TA ASOSIY TURGA (TYPE) VA 3 TA HOLATGA (STATE) AJRATING:

1. TYPE: "CHAT" (Muloqot, Salomlashish yoki Aniqlashtirish):
- Qachon: 
  a) Salomlashish, tanishuv ("salom", "assalomu alaykum", "sen kimsan?", "nima qila olasan?");
  b) Umumiy maslahat so'rash ("dasturchiga qanday noutbuk yaxshi?", "sovutgich tanlashda nima muhim?");
  c) Mantiqiy ziddiyat yoki xatolik ("manga likopcha kere smarfunksiyali", "inverter choynak").
- HARAKAT: HECH QANDAY QIDIRUV QILINMAYDI! (searchQuery va cleanQuery BO'SH STRING bo'lsin).
- message: Foydalanuvchiga 1-2 ta jumlada samimiy, lo'nda javob bering (masalan: "Assalomu alaykum! Men Aqlli Bozor xarid yordamchisiman. O‘zbekiston rasmiy do‘konlaridan narxlar va iqtisodiy tahlillarni taqdim etaman. Qanday tovar qidiryapsiz?").

2. TYPE: "SEARCH" (100% Aniq Mahsulot Qidiruvi):
- Qachon: Faqatgina mijozning aynan qaysi toifadagi qanday mahsulotni xohlayotganiga 100% ISHONCHINGIZ KOMIL BO'LSA (masalan: "12 lik konditsioner Toshkentga", "chinni likopcha to'plami", "1.7L elektr choynak").
- HARAKAT: Aniq tozalangan qidiruv kalit so'zini (searchQuery / cleanQuery) va toifani (categoryKey) aniqlab bering.

QAT'IY QOIDALAR:
- categoryKey: Aniq toifani tanlang: "konditsioner", "chinni_idishlar", "elektr_choynak", "televizor", "muzlatgich", "kir_yuvish", "boshqa". Idish-tovoqda smart funksiya yoki elektr bo'lmaydi!
- smartChips: Doimo 3 ta aniq variant (emoji bilan).

CHIQISH FORMATI (Faqat toza JSON):
{
  "type": "CHAT | SEARCH",
  "state": "CONVERSATION | NEED_CLARIFICATION | PRODUCT_SEARCH",
  "categoryKey": "konditsioner | chinni_idishlar | elektr_choynak | televizor | muzlatgich | kir_yuvish | boshqa",
  "searchQuery": "faqat SEARCH bo'lsa qidiruv so'zi, CHAT bo'lsa bo'sh",
  "cleanQuery": "faqat SEARCH bo'lsa qidiruv so'zi, CHAT bo'lsa bo'sh",
  "message": "Mijozga 1-2 jumlada maslahat yoki javob",
  "replyMessage": "Mijozga 1-2 jumlada maslahat yoki javob",
  "smartChips": [
     {"label": "Chip 1 nomi (emoji bilan)", "payload": "Qo'shimcha qidiruv filtri"},
     {"label": "Chip 2 nomi", "payload": "..." },
     {"label": "Chip 3 nomi", "payload": "..." }
  ]
}`;

async function askChatGPTController(userMessage) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CONTROLLER_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

// 3-Bosqich: Strict Guardrail implementation (from serpapi.ts)
function isStrictValidProduct(item, categoryKey) {
  if (!item) return false;
  const store = (item.source || item.store_name || item.store || "").toLowerCase();
  const link = (item.link || item.product_link || "").toLowerCase();

  const FORBIDDEN_DOMAINS = [
    "google", "youtube", "olx", "yandex", "birbir", "prom.uz", 
    "torg.uz", "aliexpress", "amazon", "ebay", "facebook", "instagram",
    "soff.uz", "science", "global-science-review"
  ];
  if (FORBIDDEN_DOMAINS.some(d => store.includes(d) || link.includes(d))) {
    return false;
  }

  const ALLOWED_STORE_DOMAINS = ["uzum.uz", "olcha.uz", "asaxiy.uz", "texnomart.uz", "idea.uz", "zoodmall.uz", "mediapark.uz"];
  const isAllowedStore = ALLOWED_STORE_DOMAINS.some(d => link.includes(d) || store.includes(d));
  if (!isAllowedStore) {
    return false;
  }

  const rawPrice = String(item.price || "").toLowerCase();
  if (!rawPrice || rawPrice.includes("bozor") || rawPrice.includes("kelishilgan") || rawPrice.includes("narxi yo'q") || rawPrice.includes("tekshiring")) {
    return false;
  }

  return true;
}

// Dynamic Badges (from serpapi.ts)
function getCategoryBadges(categoryKey, itemTitle) {
  const title = (itemTitle || "").toLowerCase();
  const cat = (categoryKey || "").toLowerCase();
  const isDish = cat.includes("chinni") || cat.includes("idish") || /chashka|serviz|likopcha|tarelka/i.test(title);

  if (isDish) {
    return ["Oziq-ovqat xavfsizligi sertifikati", "Zarbalarga chidamli chinni", "Mikroto'lqinli pechga mos"];
  }
  return ["A+++ Inverter", "R32 freon xavfsiz", "3 yil kafolat"];
}

async function runAllAudits() {
  console.log('====================================================');
  console.log('🔴 V12.0 QAT\'IY AUDIT TESTI (CONTROLLER & GUARDRAIL)');
  console.log('====================================================\n');

  let passed = true;

  // 1. "Salom, sen kimsan?"
  console.log('👉 [TEST 1] "Salom, sen kimsan?" so\'rovi tekshirilmoqda...');
  const gptRes1 = await askChatGPTController("Salom, sen kimsan?");
  console.log('   GPT chiqishi:', JSON.stringify(gptRes1, null, 2));

  if (gptRes1.type === "CHAT") {
    console.log('   ✅ TEST 1 MUVAFFAQIShIYATLI: GPT type === "CHAT", SerpAPI qidiruvi QILINMAYDI!');
    console.log('   ui_mode: "CONVERSATION_ONLY", ai_reply:', gptRes1.message || gptRes1.replyMessage);
  } else {
    console.error('   ❌ TEST 1 XATO: type !== "CHAT"');
    passed = false;
  }

  // 2. "Sen kimsan?"
  console.log('\n👉 [TEST 2] "Sen kimsan?" qisqa so\'rovi tekshirilmoqda...');
  const gptRes2 = await askChatGPTController("Sen kimsan?");
  console.log('   GPT chiqishi:', JSON.stringify(gptRes2, null, 2));

  if (gptRes2.type === "CHAT") {
    console.log('   ✅ TEST 2 MUVAFFAQIShIYATLI: GPT type === "CHAT", "yordamchi so\'z turkumlari" blogi qidirilmaydi!');
  } else {
    console.error('   ❌ TEST 2 XATO: type !== "CHAT"');
    passed = false;
  }

  // 3. Mantiqsiz so'rov: "manga likopcha kere smarfunksiyali"
  console.log('\n👉 [TEST 3] "manga likopcha kere smarfunksiyali" mantiqiy ziddiyat testi...');
  const gptRes3 = await askChatGPTController("manga likopcha kere smarfunksiyali");
  console.log('   GPT chiqishi:', JSON.stringify(gptRes3, null, 2));

  if (gptRes3.type === "CHAT" && (!gptRes3.searchQuery || gptRes3.searchQuery === "")) {
    console.log('   ✅ TEST 3 MUVAFFAQIShIYATLI: Mantiqsiz so\'rov bloklandi, tushuntirish berildi, qidiruv qilinmadi!');
  } else {
    console.error('   ❌ TEST 3 XATO: Mantiqsiz so\'rov qidiruvga yo\'naltirildi!');
    passed = false;
  }

  // 4. Haqiqiy qidiruv: "12 lik konditsioner Toshkentga"
  console.log('\n👉 [TEST 4] "12 lik konditsioner Toshkentga" qidiruv testi...');
  const gptRes4 = await askChatGPTController("12 lik konditsioner Toshkentga");
  console.log('   GPT chiqishi:', JSON.stringify(gptRes4, null, 2));

  if (gptRes4.type === "SEARCH" && gptRes4.searchQuery) {
    console.log('   ✅ TEST 4 MUVAFFAQIShIYATLI: type === "SEARCH", tozalangan kalit so\'z:', gptRes4.searchQuery);
  } else {
    console.error('   ❌ TEST 4 XATO: type !== "SEARCH"');
    passed = false;
  }

  // 5. Axlat Domenlar Guardrail Testi
  console.log('\n👉 [TEST 5] Axlat Domenlar (global-science-review.com, soff.uz, google) Qalqon testi...');
  const testGarbage = [
    { title: "Yordamchi so'z turkumlari haqida darslik", link: "https://global-science-review.com/article/123", price: "50 000 so'm", source: "global-science-review.com" },
    { title: "Sen kimsan maqolasi", link: "https://soff.uz/maqolalar/sen-kimsan", price: "20 000 so'm", source: "soff.uz" },
    { title: "Google natijasi", link: "https://google.com/search?q=test", price: "100 000 so'm", source: "google.com" },
    { title: "Bozor narxida konditsioner", link: "https://uzum.uz/product/1", price: "Bozor narxida", source: "uzum.uz" },
  ];

  let guardrailSuccess = true;
  for (const g of testGarbage) {
    const ok = isStrictValidProduct(g, "konditsioner");
    if (ok) {
      console.error(`   ❌ QALQON TESHILDI: ${g.source} o'tib ketdi!`);
      guardrailSuccess = false;
    } else {
      console.log(`   🛡️ BLOKLANDI: ${g.source} (${g.title})`);
    }
  }

  // Haqiqiy do'kon tovari:
  const validItem = { title: "Artel 12 lik konditsioner", link: "https://uzum.uz/product/artel-12", price: "4 200 000 so'm", source: "uzum.uz" };
  if (isStrictValidProduct(validItem, "konditsioner")) {
    console.log(`   ✅ QABUL QILINDI: ${validItem.source} (${validItem.title})`);
  } else {
    console.error('   ❌ Xato: Uzum tovari bloklandi!');
    guardrailSuccess = false;
  }

  if (guardrailSuccess) {
    console.log('   ✅ TEST 5 MUVAFFAQIShIYATLI: Guardrail barcha axlat domenlarni 100% kesib tashladi!');
  } else {
    passed = false;
  }

  // 6. Idish-tovoqda A+++ yo'qligi testi
  console.log('\n👉 [TEST 6] Chinni idishda A+++ energiya yorlig\'i yo\'qligi testi...');
  const dishBadges = getCategoryBadges("chinni_idishlar", "6 kishilik naqshli chinni likopcha");
  console.log('   Chinni idish teglari:', dishBadges);
  const hasA3 = dishBadges.some(b => /a\+\+\+|energiya|inverter|freon/i.test(b));
  if (!hasA3) {
    console.log('   ✅ TEST 6 MUVAFFAQIShIYATLI: Chinni idishda A+++ energiya yo\'q, faqat oziq-ovqat xavfsizligi va chidamlilik teglari chiqmoqda!');
  } else {
    console.error('   ❌ TEST 6 XATO: Idishga energiya tegi yozilgan!');
    passed = false;
  }

  console.log('\n====================================================');
  if (passed) {
    console.log('🎉 BARCHA 6 TA V12.0 AUDIT TESTLARI 100% MUVAFFAQIShIYATLI YAKUNLANDI!');
  } else {
    console.log('❌ AYRIM TESTLARDA XATOLIK BO\'LDI!');
  }
  console.log('====================================================');
}

runAllAudits();
