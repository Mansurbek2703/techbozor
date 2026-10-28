# TECHBOZOR 🛍️⚡
## Maishiy texnikalar savdosi uchun AI asosidagi talab va taklif platformasi (MVP)

TechBozor — xaridor o‘ziga kerakli maishiy texnikani oddiy tilda tavsiflaydigan, sun’iy intellekt (AI) orqali budjetiga mos xolis tavsiyalar oladigan va talabini joylashtiradigan zamonaviy marketplace.

### 🌟 Asosiy Imkoniyatlar

1. **Xaridor uchun (Ro‘yxatdan o‘tmasdan):**
   - Oddiy tilda matn yozish orqali qidiruv (NLP & AI).
   - Budjet va sifat talablarini avtomatik ajratish.
   - O‘zbekiston bozoridagi real narxlar va modellarga asoslangan AI tavsiyalari.
   - 7 ta kategoriya va smart filtrlar (Televizor, Sovutkich, Kir yuvish mashinasi, Konditsioner, Changyutkich, Gaz/Elektr plita, Mikroto‘lqinli pech).
   - Talabni amal qilish muddati (1, 3, 7, 14, 30 kun) va viloyat bilan joylashtirish.
   - SMS orqali kelgan unikal havola orqali takliflarni ko‘rish.
   - «Sotuvchiga qo‘ng‘iroq qilish» (`tel:...`) orqali to‘g‘ridan-to‘g‘ri aloqa.

2. **Sotuvchi uchun:**
   - Ro‘yxatdan o‘tish (1 tadan 3 tagacha xizmat viloyatini tanlash).
   - Sotuvchi shaxsiy kabineti.
   - Mos viloyat va kategoriyadagi yangi xaridor talablarini ko‘rish.
   - Talabga darhol o‘z narx taklifini yuborish (xaridorga avtomatik SMS boradi).
   - O‘z mahsulotlar katalogini boshqarish.

3. **Administrator uchun:**
   - Platformaning to‘liq tahliliy dashboardi.
   - Sotuvchilarni tasdiqlash va bloklash.
   - Xaridor talablari va takliflar nazorati.
   - SMS yuborish tarixi va xarajatlari hisoboti (har bir SMS narxi, jami sarf).
   - AI so‘rovlari statistikasi.

### 🚀 Texnologik Stek
- **Frontend / Backend:** Next.js 14 (App Router, Server Actions, API Routes)
- **Til:** TypeScript
- **Dizayn:** Tailwind CSS (Violet & Emerald Tech ranglar uyg‘unligi, mobile-first, toza responsive)
- **Ikonlar:** Lucide React
- **Ma’lumotlar bazasi:** Persistent JSON Storage (`data/techbozor_db.json`)

### 🛠️ Ishga tushirish

```bash
# Bog'liqliklarni o'rnatish
npm install

# Dasturchi rejimida ishga tushirish (Port 3000)
npm run dev

# Ishchi (Production) rejimda qurish va ishga tushirish
npm run build
npm run start
```
