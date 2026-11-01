const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const match = env.match(/OPENAI_API_KEY=(.+)/);
const key = match ? match[1].trim() : '';

const CONTROLLER_SYSTEM_PROMPT = `Siz O'zbekiston e-tijorat va xaridlar bo'yicha aqlli yordamchisiz (Controller).
Vazifangiz: Foydalanuvchi xabarini tahlil qilib, QAT'IY JSON qaytarish.

QOIDALAR:
1. Agar foydalanuvchi salomlashsa, "Sen kimsan?", "nima qila olasan?", o'zini tanishtirishni so'rasa, yoki shunchaki umumiy suhbat/savol bersa:
   * type: "CHAT"
   * message: "O'zingizni tanishtiruvchi yoki savolga 2-3 ta lo'nda jumlada samimiy javob."
   * searchQuery: "" (BO'SH BO'LADI! HECH QANDAY QIDIRUV QILINMAYDI!)
   * smartChips: [3 ta mavzuga oid taklif chipi]

2. Agar foydalanuvchi noaniq, ziddiyatli yozsa (masalan: "smart chinni likopcha"):
   * type: "CHAT"
   * message: "Likopchalarda smart funksiya bo'lmaydi. Sizga chinni likopchalar kerakmi yoki Smart televizor?"
   * searchQuery: ""
   * smartChips: [3 ta variant]

3. FAQATGINA foydalanuvchi aniq mahsulot qidirayotganiga 100% ishonchingiz komil bo'lsa (masalan: "12 lik konditsioner", "chinni choynak", "muzlatgich"):
   * type: "SEARCH"
   * categoryKey: "konditsioner | chinni_idishlar | elektr_choynak | televizor | muzlatgich | kir_yuvish | boshqa"
   * searchQuery: "eng qisqa toza qidiruv so'zi"
   * message: "Siz uchun O'zbekiston rasmiy do'konlaridan eng maqbul variantlar tayyorlanmoqda."
   * smartChips: [3 ta tegishli variant]

CHIQISH FORMATI (Faqat toza JSON):
{
  "type": "CHAT" | "SEARCH",
  "categoryKey": "konditsioner | chinni_idishlar | elektr_choynak | televizor | muzlatgich | kir_yuvish | boshqa",
  "searchQuery": "qidiruv kalit so'zi (faqat SEARCH bo'lsa)",
  "message": "Foydalanuvchiga javob xabari",
  "smartChips": [
    {"label": "Chip 1 nomi (emoji bilan)", "payload": "filtri"},
    {"label": "Chip 2 nomi", "payload": "filtri"},
    {"label": "Chip 3 nomi", "payload": "filtri"}
  ]
}`;

async function testQuery(q) {
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
        { role: 'user', content: q }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });
  const data = await res.json();
  console.log('INPUT:', q);
  console.log('OUTPUT:', JSON.stringify(JSON.parse(data.choices[0].message.content), null, 2));
  console.log('--------------------------------------------------');
}

async function run() {
  await testQuery('Salom, sen kimsan?');
  await testQuery('Sen kimsan?');
  await testQuery('manga likopcha kere smarfunksiyali');
  await testQuery('12 lik konditsioner Toshkentga');
}

run();
