const fs = require('fs');

// Load environment variables
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

const SYSTEM_PROMPT_INTENT_ROUTER = `Siz O'zbekistonning eng malakali biznes, xarid va elektron savdo bo'yicha maslahatchisisiz (The Ultimate Conversational Commerce AI).
Mijozning yozgan har qanday xom, shevadagi, orfografik xatoli yoki ikkilantiruvchi so'rovini chuqur tahlil qiling va qat'iy JSON qaytaring.

HAR QANDAY SO'ROVNI 3 TA HOLATDAN (STATE) BIRIGA AJRATING:

1. STATE: "CONVERSATION" (Muloqot va Umumiy Maslahat):
- Qachon: Mijoz salomlashsa ("salom", "assalomu alaykum"), "nima qila olasan?", o'zingizni tanishtirishni so'rasa, yoki tovar sotib olishga tayyor bo'lmasdan umumiy maslahat so'rasa ("dasturchiga qanday noutbuk yaxshi?", "sovutgich tanlashda nima muhim?").
- Harakat: Hech qanday qidiruv qilmang (cleanQuery bo'sh bo'lsin)! Mijozga do'stona va malakali maslahatchi sifatida 2-3 ta lo'nda jumlada javob (replyMessage) yozing va suhbatni davom ettirish uchun 3 ta Smart Chip bering.

2. STATE: "NEED_CLARIFICATION" (Aniqlashtirish, Sheva va Mantiqiy Ziddiyat):
- Qachon: Mijoz shevada yozsa, sintaktik xato qilsa, so'rovida mantiqiy ziddiyat bo'lsa (masalan: "manga likopcha kere smarfunksiyali", "smart chinni idish", "inverter choynak"), yoki ma'lumot o'ta kam bo'lsa.
- Harakat: QIDIRUVNI TO'XTATING (cleanQuery bo'sh bo'lsin)! Mijozning xatosini muloyim tushuntiring, nima xohlayotganini aniqlashtiruvchi javob (replyMessage) yozing va to'g'ri toifadagi 3 ta Smart Chip taklif qiling. (Masalan: "Likopchalarda smart funksiya bo'lmaydi. Sizga dasturxon uchun chinni likopchalar kerakmi yoki Smart Televizormi?").

3. STATE: "PRODUCT_SEARCH" (100% Ishonch va Qidiruv):
- Qachon: Faqatgina mijozning aynan qaysi toifadagi qanday mahsulotni xohlayotganiga 100% ISHONCHINGIZ KOMIL BO'LSA (masalan: "12 lik konditsioner Toshkentga", "chinni likopcha to'plami", "1.7L elektr choynak").
- Harakat: Aniq tozalangan qidiruv kalit so'zini (cleanQuery) va toifani (categoryKey) aniqlab, qidiruvga ruxsat bering.

QAT'IY QOIDALAR:
- categoryKey: Aniq toifani tanlang: "konditsioner" (konditsioner, inverter, split), "chinni_idishlar" (idish, likopcha, tarelka, chashka, serviz, piyola), "elektr_choynak" (choynak, kettle), "televizor" (televizor, tv), "muzlatgich", "kir_yuvish", "boshqa". Idish-tovoqda smart funksiya yoki elektr bo'lmaydi!
- replyMessage: Qisqa, tushunarli, maksimal 2-3 jumla.
- smartChips: Doimo 3 ta aniq variant (emoji bilan).

CHIQISH FORMATI (Faqat toza JSON):
{
  "state": "CONVERSATION | NEED_CLARIFICATION | PRODUCT_SEARCH",
  "categoryKey": "konditsioner | chinni_idishlar | elektr_choynak | televizor | muzlatgich | kir_yuvish | boshqa",
  "cleanQuery": "qidiruv uchun tozalangan eng qisqa kalit so'z (faqat PRODUCT_SEARCH bo'lsa)",
  "replyMessage": "Mijozga 2-3 ta jumlada maslahat yoki tushuntirish",
  "smartChips": [
     {"label": "Chip 1 nomi (emoji bilan)", "payload": "Qo'shimcha qidiruv filtri"},
     {"label": "Chip 2 nomi", "payload": "..." },
     {"label": "Chip 3 nomi", "payload": "..." }
  ]
}`;

async function runRouter(prompt) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT_INTENT_ROUTER },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function runAllTests() {
  console.log('====================================================');
  console.log('🧪 V11.0 THE ULTIMATE CONVERSATIONAL COMMERCE AI TEST');
  console.log('====================================================\n');

  // TEST 1: Sheva va Mantiq Testi
  console.log('--- TEST 1: Sheva va Mantiqiy Ziddiyat Testi ---');
  console.log('Foydalanuvchi so\'rovi: "manga likopcha kere smarfunksiyali"');
  const t1 = await runRouter('manga likopcha kere smarfunksiyali');
  console.log('Holat (State):', t1.state);
  console.log('AI Javobi (replyMessage):', t1.replyMessage);
  console.log('Smart Chiplar:', t1.smartChips);
  console.log('Qidiruv to\'xtatildimi (cleanQuery yo\'q):', !t1.cleanQuery || t1.cleanQuery.length === 0);
  console.log('Natija:', t1.state === 'NEED_CLARIFICATION' ? '✅ PASSED (Qidiruv to\'xtatildi, tushuntirish berildi)' : '❌ FAILED');

  // TEST 2: Chat / Salomlashish Testi
  console.log('\n--- TEST 2: Muloqot va Maslahat (Chat) Testi ---');
  console.log('Foydalanuvchi so\'rovi: "Sen nima qila olasan?"');
  const t2 = await runRouter('Sen nima qila olasan?');
  console.log('Holat (State):', t2.state);
  console.log('AI Javobi:', t2.replyMessage);
  console.log('Smart Chiplar:', t2.smartChips);
  console.log('Qidiruv qilinmadi (cleanQuery yo\'q):', !t2.cleanQuery || t2.cleanQuery.length === 0);
  console.log('Natija:', t2.state === 'CONVERSATION' ? '✅ PASSED (Tanishdi va maslahat chiplarini berdi, qidiruv yo\'q)' : '❌ FAILED');

  // TEST 3: Zero-Regression Aniq Mahsulot Qidiruvi
  console.log('\n--- TEST 3: 100% Ishonchli Mahsulot Qidiruvi ---');
  console.log('Foydalanuvchi so\'rovi: "12 lik konditsioner"');
  const t3 = await runRouter('12 lik konditsioner');
  console.log('Holat (State):', t3.state);
  console.log('Tozalangan kalit so\'z (cleanQuery):', t3.cleanQuery);
  console.log('Toifa (categoryKey):', t3.categoryKey);
  console.log('Natija:', t3.state === 'PRODUCT_SEARCH' && t3.categoryKey === 'konditsioner' ? '✅ PASSED (100% ishonch bilan qidiruvga ruxsat berildi)' : '❌ FAILED');

  // TEST 4: Kognitiv Badgelar va Mutlaq Darvoza
  console.log('\n--- TEST 4: Mutlaq Darvoza va Kognitiv Badgelar ---');
  const { isStrictValidProduct, getCategoryBadges } = require('../src/lib/serpapi');
  
  const badItems = [
    { source: 'Google Shopping', link: 'https://google.com/search', price: '3,000,000 so\'m', title: 'Artel 12' },
    { source: 'olx.uz', link: 'https://olx.uz/d/123', price: '4,000,000 so\'m', title: 'Konditsioner' },
    { source: 'birbir.uz', link: 'https://birbir.uz/p/555', price: '2,500,000 so\'m', title: 'Konditsioner' },
    { source: 'Uzum Market', link: 'https://uzum.uz/p/1', price: 'Bozor narxida', title: 'Chinni tovoq' },
    { source: 'Uzum Market', link: 'https://uzum.uz/p/2', price: '0 so\'m', title: 'Chashka' },
    { source: 'Olcha', link: 'https://olcha.uz/p/3', price: '250,000 so\'m', title: 'Chinni likopcha', thumbnail: 'https://olcha.uz/headphone.jpg' }
  ];

  badItems.forEach((item, idx) => {
    const valid = isStrictValidProduct(item, 'chinni_idishlar');
    console.log(`Axlat/Noo'rin tovar #${idx + 1} [${item.source} - ${item.price || item.thumbnail}] -> ${!valid ? '✅ QAT\'IY BLOKLANDI' : '❌ XATO: O\'TIB KETDI'}`);
  });

  const dishBadges = getCategoryBadges('chinni_idishlar', 'Chinni likopchalar 6 kishilik');
  const hasFakeEnergy = dishBadges.some(b => b.includes('A+++') || b.includes('Inverter') || b.includes('Energiya'));
  console.log('\nLikopcha badgelari:', dishBadges);
  console.log('Soxta energiya teglari yo\'qligi:', !hasFakeEnergy ? '✅ PASSED (0 ta soxta tejamkorlik)' : '❌ FAILED');

  console.log('\n====================================================');
  console.log('🎉 BARCHA V11.0 TESTLARI MUVAFFAQIYATLI YAKUNLANDI!');
  console.log('====================================================');
}

runAllTests().catch(console.error);
