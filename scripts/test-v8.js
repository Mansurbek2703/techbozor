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
console.log('--- 1. OPENAI API KEY XAVFSIZLIK VA TEKSHIRUVI ---');
console.log('Server-side kalit mavjud:', Boolean(key));
console.log('Kalit formati:', key ? key.substring(0, 10) + '...' + key.substring(key.length - 6) : 'YOQ');

async function testIntentAndEconomist() {
  const systemIntent = `Siz O'zbekiston e-commerce bozori bo'yicha aqlli yordamchisiz.
Vazifangiz: Foydalanuvchi so'rovini tahlil qilib, qat'iy JSON qaytarish.
Format:
{
  "categoryKey": "konditsioner | chinni_idishlar | elektr_choynak | televizor | boshqa",
  "cleanQuery": "qidiruv uchun tozalangan eng qisqa kalit so'z",
  "smartChips": [
     {"label": "Chip 1 nomi (emoji bilan)", "payload": "Qo'shimcha qidiruv filtri"},
     {"label": "Chip 2 nomi", "payload": "..." },
     {"label": "Chip 3 nomi", "payload": "..." }
  ]
}
Qoida: Smart Chips foydalanuvchini charchatmasligi uchun aynan shu toifaga eng mos 3 ta tayyor variant bo'lishi shart.`;

  // Test 1: Konditsioner Intent
  console.log('\n--- 2. INTENT AI TEST: 12 LIK KONDITSIONER ---');
  const res1 = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemIntent },
        { role: 'user', content: '12 lik konditsioner Toshkentga kerak' }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });
  const data1 = await res1.json();
  const parsed1 = JSON.parse(data1.choices[0].message.content);
  console.log('Intent natijasi:', JSON.stringify(parsed1, null, 2));
  console.log('Token sarfi:', data1.usage);

  // Test 2: Chinni Idish Intent
  console.log('\n--- 3. INTENT AI TEST: CHINNI IDISHLAR ---');
  const res2 = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemIntent },
        { role: 'user', content: 'chinni chashka to\'plami Xorazmga' }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });
  const data2 = await res2.json();
  const parsed2 = JSON.parse(data2.choices[0].message.content);
  console.log('Chinni Intent natijasi:', JSON.stringify(parsed2, null, 2));
  console.log('Token sarfi:', data2.usage);

  // Test 3: The Economist GPT - Konditsioner
  console.log('\n--- 4. THE ECONOMIST GPT: KONDITSIONER (450 so\'m/kVt, max 2 jumla) ---');
  const systemEconomist = `Siz — O'zbekiston bozorining Bosh Iqtisodchisisiz (The Economist GPT). Sizning xulosangiz sarmoyaning o'zini oqlashi (ROI), energiya samaradorligi yoki tovarning amaliy chidamliligiga tayanadi.
QAT'IY QOIDALAR (V8.0):
1. Qisqalik prinsipi: Xulosa QAT'IYAN MAKSIMAL 2 TA JUMLA bo'lishi shart. Bo'lar-bo'lmas maqtovlar, umumiy gaplar ASLO YOZILMASIN.
2. Qat'iyan taqiqlanadi: "Bozor narxida", "kelishilgan", "arzon va sifatli".
3. Maishiy texnikada amaliy elektr sarfi O'zbekistonning joriy 450 so'm/kVt bazaviy tarifi bo'yicha hisoblanadi va o'zini oqlash muddati (ROI) ko'rsatiladi.
Format:
{
  "headline": "Maksimal 2 ta qisqa jumla.",
  "monthly_kwh": 150,
  "monthly_cost_uzs": 67500,
  "roi_summary": "Sarmoyaning o'zini oqlashi hisobi."
}`;

  const res3 = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemEconomist },
        { role: 'user', content: 'Kategoriya: Konditsioner. Hudud: Toshkent. Tarif: 450 so\'m/kVt. Oylik sarf: 150 kVt/soat (67,500 so\'m). Do\'konlar: Artel Inverter 12 (Uzum - 4,890,000 so\'m), Shivaki 12 (Olcha - 5,100,000 so\'m). Qat\'iy 2 ta jumlada iqtisodiy xulosa va ROI yozing. JSON qaytaring.' }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });
  const data3 = await res3.json();
  const parsed3 = JSON.parse(data3.choices[0].message.content);
  console.log('Konditsioner Iqtisodchi xulosasi:', JSON.stringify(parsed3, null, 2));

  // Test 4: The Economist GPT - Chinni Idish (0 kVt, food-safety)
  console.log('\n--- 5. THE ECONOMIST GPT: CHINNI IDISHLAR (0 kVt, no electricity) ---');
  const res4 = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + key
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemEconomist },
        { role: 'user', content: 'Kategoriya: Chinni va oshxona idishlari. Hudud: Xorazm. Do\'konlar: Farfor 6 kishilik to\'plam (Uzum - 280,000 so\'m). QOIDALAR: Qat\'iyan maksimal 2 jumla. Oziq-ovqat xavfsizligi, zarbalarga chidamlilik va uzoq xizmat muddati (ROI) haqida gapiring. Elektr energiyasi (kVt, tok) haqida ASLO gapirmang (0 kVt!). JSON qaytaring.' }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });
  const data4 = await res4.json();
  const parsed4 = JSON.parse(data4.choices[0].message.content);
  console.log('Chinni idish Iqtisodchi xulosasi:', JSON.stringify(parsed4, null, 2));

  // Test 5: Gatekeeper Zero-Regression (isStrictValidProduct)
  console.log('\n--- 6. ZERO-REGRESSION: THE ABSOLUTE GATEKEEPER VALIDATSIYASI ---');
  
  // Gatekeeper qoidalari
  function testGatekeeper(item, categoryKey) {
    const store = (item.source || '').toLowerCase();
    const link = (item.link || '').toLowerCase();
    if (store.includes('google') || link.includes('google.com')) return { valid: false, reason: 'BLOCKED: google.com manbasi' };
    if (store.includes('yandex') || link.includes('yandex')) return { valid: false, reason: 'BLOCKED: yandex manbasi' };
    
    const rawPrice = String(item.price || '').toLowerCase();
    if (!rawPrice || rawPrice.includes('bozor') || rawPrice.includes('kelishilgan')) return { valid: false, reason: 'BLOCKED: Noaniq narx ("Bozor narxida")' };
    const numPrice = parseInt(rawPrice.replace(/[^\d]/g, ''), 10);
    if (!numPrice || numPrice <= 0) return { valid: false, reason: 'BLOCKED: 0 so\'m narx' };

    const isDish = categoryKey === 'chinni_idishlar';
    const img = (item.thumbnail || '').toLowerCase();
    if (isDish && ['headphone', 'naushnik', 'earphone'].some(p => img.includes(p))) {
      return { valid: false, reason: 'BLOCKED: Idish so\'rovida quloqchin rasmi' };
    }

    return { valid: true, reason: 'PASSED: Toza O\'zbekiston rasmiy do\'koni' };
  }

  const testCases = [
    { item: { title: 'Konditsioner Artel 12', source: 'Google Shopping', link: 'https://google.com/search?q=12', price: '4,500,000 so\'m' }, category: 'konditsioner' },
    { item: { title: 'Chinni chashka 6 dona', source: 'Uzum Market', link: 'https://uzum.uz/product/123', price: 'Bozor narxida' }, category: 'chinni_idishlar' },
    { item: { title: 'Likopcha to\'plami', source: 'Asaxiy', link: 'https://asaxiy.uz/p/456', price: '0 so\'m' }, category: 'chinni_idishlar' },
    { item: { title: 'Chinni serviz', source: 'Olcha.uz', link: 'https://olcha.uz/p/789', price: '320,000 so\'m', thumbnail: 'https://cdn.olcha.uz/headphone_wireless.jpg' }, category: 'chinni_idishlar' },
    { item: { title: 'Artel Inverter 12 HD', source: 'Uzum Market', link: 'https://uzum.uz/product/999', price: '4,890,000 so\'m', thumbnail: 'https://images.uzum.uz/ac_clean.jpg' }, category: 'konditsioner' },
    { item: { title: 'Chinni likopchalar 6 kishilik', source: 'Texnomart', link: 'https://texnomart.uz/p/888', price: '250,000 so\'m', thumbnail: 'https://texnomart.uz/farfor_plate.jpg' }, category: 'chinni_idishlar' }
  ];

  testCases.forEach((tc, idx) => {
    const res = testGatekeeper(tc.item, tc.category);
    console.log(`Test #${idx + 1} [${tc.item.title}] (${tc.item.source}) -> ${res.valid ? '✅ ' : '❌ '}${res.reason}`);
  });
}

testIntentAndEconomist().catch(console.error);
