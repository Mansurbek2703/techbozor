import urllib.request
import json
import os

key = None
for f in ['.env.local', '.env']:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as env_f:
            for line in env_f:
                if line.startswith('OPENAI_API_KEY='):
                    key = line.strip().split('=', 1)[1].strip('"\'')
                    break
        if key:
            break

schema = {
    "name": "open_world_agent_response",
    "strict": True,
    "schema": {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "enum": ["NEED_CLARIFICATION", "READY_TO_SEARCH"],
                "description": "Agar qidiruv uchun ma'lumotlar yetarli bo'lmasa NEED_CLARIFICATION, hamma narsa aniq bo'lsa READY_TO_SEARCH qaytar."
            },
            "message": {
                "type": "string",
                "description": "Foydalanuvchiga ko'rsatiladigan keyingi savol yoki xabar."
            },
            "dynamic_chips": {
                "type": "array",
                "items": { "type": "string" },
                "description": "Foydalanuvchi bosishi mumkin bo'lgan 3-4 ta qisqa javob variantlari. Masalan: ['📍 Xorazm', '📍 Toshkent'] yoki ['🧤 Charm', '🧤 Paxta']"
            },
            "extracted_data": {
                "type": "object",
                "properties": {
                    "category": {
                        "type": "string",
                        "enum": ["apparel", "electronics", "materials", "other"]
                    },
                    "product_name": { "type": "string" },
                    "location": { 
                        "type": ["string", "null"], 
                        "description": "Foydalanuvchi tanlagan viloyat yoki shahar. Yo'q bo'lsa null." 
                    },
                    "is_electronic": {
                        "type": "boolean",
                        "description": "Faqat elektr tokida ishlaydigan texnikalar uchun true."
                    },
                    "attributes": {
                        "type": "string",
                        "description": "Rang, mato, xotira hajmi kabi qolgan barcha parametrlar kalit-qiymat ko'rinishida."
                    }
                },
                "required": ["category", "product_name", "location", "is_electronic", "attributes"],
                "additionalProperties": False
            }
        },
        "required": ["status", "message", "dynamic_chips", "extracted_data"],
        "additionalProperties": False
    }
}

system_prompt = """Sen "Aqlli Bozor" platformasining intellektual xarid maslahatchisisan.
Sening asosiy vazifang foydalanuvchining xom so'rovini aniq qidiruv parametrlariga (filtrlariga) aylantirish va kerak bo'lganda qo'shimcha savollar berishdir.

QAT'IY QOIDALAR:
1. TOVAR TOIFASINI FARQLASH: Foydalanuvchi so'rovini tahlil qil va uning qaysi toifaga (category) tegishliligini aniqla:
   - "apparel" (kiyim-kechak, qo'lqop, poyabzal): Bunda faqat jinsi, o'lchami, matosi va rangini so'ra. Hech qachon elektr quvvati, kVt yoki ROI haqida gapirma.
   - "electronics" (maishiy texnika, noutbuk, telefon): Bunda texnik parametrlar, elektr sarfi va byudjetni hisobga ol.
   - "materials" (qurilish mollari, mebel): Bunda o'lcham, xomashyo va miqdorni so'ra.
   - "other": Boshqa barcha tovarlar.
2. HUDUDNI ANIQLASH: Tizim foydalanuvchiga to'g'ri do'kon va narxlarni topishi uchun hudud (viloyat/shahar) muhim. Agar joriy suhbat kontekstida foydalanuvchining hududi noma'lum bo'lsa (location null bo'lsa), boshqa parametrlarni so'rash bilan birga hududni ham tanlashni so'ra va dynamic_chips ro'yxatiga hudud variantlarini ham (masalan: "📍 Toshkent", "📍 Xorazm") kirit.
3. CHIPLAR (Guided Chips): Har bir savoling uchun foydalanuvchi tanlashi oson bo'lgan 3-4 ta qisqa, emojili javob variantlarini (chiplarni) taqdim et. Chiplar doim kontekstga va tovar turiga to'liq mos bo'lishi shart.
4. JAVOB FORMATI: Sen faqat qat'iy belgilangan JSON formatida javob qaytarishing shart. Matnli kirish yoki xulosalar yozma.

Misol:
Foydalanuvchi: "Menga qo'lqop kerak"
Javob:
{
  "status": "NEED_CLARIFICATION",
  "message": "Qo'lqopni yetkazib berish uchun qaysi hududdansiz va qanday mato qidiryapsiz?",
  "dynamic_chips": ["📍 Xorazm", "📍 Toshkent", "🧤 Charm", "🧤 Paxta"],
  "extracted_data": {
    "category": "apparel",
    "product_name": "qo'lqop",
    "location": null,
    "is_electronic": false,
    "attributes": ""
  }
}"""

def call_ai(msgs):
    req_data = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt},
            *msgs
        ],
        "response_format": {
            "type": "json_schema",
            "json_schema": schema
        },
        "temperature": 0.1
    }
    req = urllib.request.Request(
        'https://api.openai.com/v1/chat/completions',
        data=json.dumps(req_data).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {key}'
        }
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(json.loads(resp.read().decode('utf-8'))['choices'][0]['message']['content'])

# Test Electronics
print("=== ELECTRONICS TEST: 12 lik konditsioner ===")
res_el = call_ai([{"role": "user", "content": "12 lik konditsioner Toshkent"}])
print(json.dumps(res_el, indent=2, ensure_ascii=False))

# Test Materials
print("\n=== MATERIALS TEST: pishiq g'isht ===")
res_mat = call_ai([{"role": "user", "content": "pishiq g'isht Samarqand"}])
print(json.dumps(res_mat, indent=2, ensure_ascii=False))
