export interface PriceInsightData {
  level: string;
  sub: string;
  chart_points: Array<[string, string, number, number]>;
  facts: Array<{ label: string; value: string; sub?: string }>;
  note: string;
}

export interface BestBannerData {
  title: string;
  image: string;
  store: string;
  price: string;
  link: string;
}

export interface SerpProductItem {
  id: string;
  title: string;
  price: string;
  priceNumber?: number;
  oldPrice?: string;
  oldPriceNumber?: number;
  discount?: number;
  source: string;
  storeBadge?: string;
  storeLogo?: string;
  link: string;
  directUrl?: string;
  thumbnail: string;
  images?: string[];
  snippet?: string;
  rating?: number;
  reviews?: number;
  region?: string;
  keySpecs?: string[];
  warranty?: string;
  deliveryInfo?: string;
  installment?: string;
  monthlyKwh?: number;
  monthlyCostUzs?: number;
  roiVerdict?: string;
  category?: string;
  brand?: string;
  currency?: string;
  availability?: string;
  location?: string;
  collectedAt?: string;
  badges?: string[];
  isBestPrice?: boolean;
}

export function getSerpApiKey(): string {
  return (process.env.SERPAPI_API_KEY || '').trim();
}

/**
 * 🇺🇿 3.1. Manbalar Oq Ro'yxati (Whitelist Stores) - Texnik Topshiriq
 */
/**
 * 🇺🇿 3.1. O'zbekiston Milliy Do'konlari Bazasi (The 30+ Whitelist - V16.0)
 * Butun respublika bo'ylab (jumladan Xorazm, Samarqand va barcha viloyatlarda) yetkazib beradigan yoki filiallari mavjud tarmoqlar
 */
export const ALLOWED_DOMAINS = [
  // 1. O'zbekiston - 16 ta asosiy platforma
  "uzum.uz", "wildberries.uz", "zoodmall.uz", "sello.uz", "asaxiy.uz", "olcha.uz",
  "texnomart.uz", "mediapark.uz", "alifshop.uz", "olx.uz", "glotr.uz", "tovar.uz",
  "kmall.uz", "sierra.uz", "korzinka.uz", "makromarket.uz",
  "ishonch.uz", "ideastore.uz", "idea.uz", "creditasia.uz",
  "elmakon.uz", "radius.uz", "macbro.uz", "arenamarkaz.uz", "goodzone.uz", "joybox.uz",
  "stroycenter.uz", "dombrabotnik.uz", "mebel.uz", "home24.uz", "karcher.uz",
  "terrapro.uz", "urbanstore.uz", "sportmaster.uz", "redtag.uz", "extremal-shop.uz", "paypo.uz",
  "farq.uz", "watchz.tech", "alijahon.uz",
  "market.yandex.uz", "yandex.uz",
  "autotuning.uz", "shina.uz", "avtoelon.uz",

  // 2. MDH va qo'shni davlatlar - 10 ta platforma
  "ozon.ru", "market.yandex.ru", "kaspi.kz", "rozetka.com.ua", "prom.ua",
  "trendyol.com", "hepsiburada.com", "allegro.pl", "kaufland.de", "jumia.com",

  // 3. Xalqaro global gigantlar - 14 ta platforma
  "amazon.com", "ebay.com", "walmart.com", "aliexpress.com", "alibaba.com",
  "taobao.com", "jd.com", "temu.com", "shein.com", "etsy.com",
  "mercadolibre.com", "shopee.com", "lazada.com", "rakuten.com"
];

export const ALLOWED_ECOMMERCE_STORES: Record<string, { name: string; badge: string; domain: string; location?: string }> = {
  // 1. O'zbekiston platformalari
  "uzum.uz": { name: "Uzum Market", badge: "Tezkor yetkazish", domain: "uzum.uz", location: "O‘zbekiston" },
  "wildberries.uz": { name: "Wildberries UZ", badge: "Keng tanlov", domain: "wildberries.uz", location: "O‘zbekiston" },
  "olcha.uz": { name: "Olcha", badge: "Rasmiy kafolat", domain: "olcha.uz", location: "O‘zbekiston" },
  "zoodmall.uz": { name: "ZoodMall", badge: "Muddatli to‘lov", domain: "zoodmall.uz", location: "O‘zbekiston" },
  "zoodmall.com": { name: "ZoodMall", badge: "Muddatli to‘lov", domain: "zoodmall.com", location: "O‘zbekiston" },
  "sello.uz": { name: "Sello", badge: "Yetkazib berish", domain: "sello.uz", location: "O‘zbekiston" },
  "asaxiy.uz": { name: "Asaxiy", badge: "Yetkazib berish", domain: "asaxiy.uz", location: "O‘zbekiston" },
  "alifshop.uz": { name: "Alif Shop", badge: "Nasiya savdo", domain: "alifshop.uz", location: "O‘zbekiston" },
  "glotr.uz": { name: "Glotr", badge: "B2B/B2C", domain: "glotr.uz", location: "O‘zbekiston" },
  "tovar.uz": { name: "Tovar.uz", badge: "O‘zbekiston", domain: "tovar.uz", location: "O‘zbekiston" },
  "kmall.uz": { name: "Kmall", badge: "Onlayn savdo", domain: "kmall.uz", location: "O‘zbekiston" },
  "sierra.uz": { name: "Sierra", badge: "Chakana savdo", domain: "sierra.uz", location: "O‘zbekiston" },
  "korzinka.uz": { name: "Korzinka", badge: "Supermarket", domain: "korzinka.uz", location: "O‘zbekiston" },
  "makromarket.uz": { name: "Makro", badge: "Supermarket", domain: "makromarket.uz", location: "O‘zbekiston" },

  // 2. Maishiy texnika va elektronika tarmoqlari
  "texnomart.uz": { name: "Texnomart", badge: "Muddatli to‘lov", domain: "texnomart.uz", location: "O‘zbekiston" },
  "mediapark.uz": { name: "MediaPark", badge: "Keng tarmoq", domain: "mediapark.uz", location: "O‘zbekiston" },
  "ishonch.uz": { name: "Ishonch", badge: "Keng tarmoq", domain: "ishonch.uz", location: "O‘zbekiston" },
  "ideastore.uz": { name: "Idea Store", badge: "Rasmiy diler", domain: "ideastore.uz", location: "O‘zbekiston" },
  "idea.uz": { name: "Idea", badge: "Mavjud", domain: "idea.uz", location: "O‘zbekiston" },
  "creditasia.uz": { name: "Credit Asia", badge: "Kafolatli", domain: "creditasia.uz", location: "O‘zbekiston" },
  "elmakon.uz": { name: "Elmakon", badge: "Rasmiy do‘kon", domain: "elmakon.uz", location: "O‘zbekiston" },
  "radius.uz": { name: "Radius", badge: "Tezkor", domain: "radius.uz", location: "O‘zbekiston" },
  "macbro.uz": { name: "MacBro", badge: "Original", domain: "macbro.uz", location: "O‘zbekiston" },
  "arenamarkaz.uz": { name: "Arena Markaz", badge: "Rasmiy", domain: "arenamarkaz.uz", location: "O‘zbekiston" },
  "goodzone.uz": { name: "Goodzone", badge: "Rasmiy kafolat", domain: "goodzone.uz", location: "O‘zbekiston" },
  "joybox.uz": { name: "Joybox", badge: "Tezkor xarid", domain: "joybox.uz", location: "O‘zbekiston" },

  // 3. Qurilish, mebel va uy-ro'zg'or
  "stroycenter.uz": { name: "Stroy Center", badge: "Qurilish mollari", domain: "stroycenter.uz", location: "O‘zbekiston" },
  "dombrabotnik.uz": { name: "Dombrabotnik", badge: "Uy mollari", domain: "dombrabotnik.uz", location: "O‘zbekiston" },
  "mebel.uz": { name: "Mebel.uz", badge: "Mebel", domain: "mebel.uz", location: "O‘zbekiston" },
  "home24.uz": { name: "Home24", badge: "Uy anjomlari", domain: "home24.uz", location: "O‘zbekiston" },
  "karcher.uz": { name: "Kärcher", badge: "Nemis sifati", domain: "karcher.uz", location: "O‘zbekiston" },

  // 4. Kiyim-kechak va sport
  "terrapro.uz": { name: "Terra Pro", badge: "Brend kiyim", domain: "terrapro.uz", location: "O‘zbekiston" },
  "urbanstore.uz": { name: "Urban Store", badge: "Moda", domain: "urbanstore.uz", location: "O‘zbekiston" },
  "sportmaster.uz": { name: "Sportmaster", badge: "Sport mahsulotlari", domain: "sportmaster.uz", location: "O‘zbekiston" },
  "redtag.uz": { name: "REDTAG", badge: "Kiyim-kechak", domain: "redtag.uz", location: "O‘zbekiston" },
  "extremal-shop.uz": { name: "Extremal Shop", badge: "Turizm va sport", domain: "extremal-shop.uz", location: "O‘zbekiston" },
  "paypo.uz": { name: "Paypo", badge: "Paypoqlar", domain: "paypo.uz", location: "O‘zbekiston" },
  "farq.uz": { name: "Farq.uz", badge: "Narx taqqoslash", domain: "farq.uz", location: "O‘zbekiston" },
  "watchz.tech": { name: "Watchz.tech", badge: "Original soatlar", domain: "watchz.tech", location: "O‘zbekiston" },
  "alijahon.uz": { name: "Alijahon", badge: "O‘zbekiston", domain: "alijahon.uz", location: "O‘zbekiston" },
  "market.yandex.uz": { name: "Yandex Market", badge: "Tezkor yetkazish", domain: "market.yandex.uz", location: "O‘zbekiston" },

  // 5. Avto, shina va maxsus texnika
  "autotuning.uz": { name: "Autotuning", badge: "Avto tovarlar", domain: "autotuning.uz", location: "O‘zbekiston" },
  "shina.uz": { name: "Shina.uz", badge: "Original shinalar", domain: "shina.uz", location: "O‘zbekiston" },
  "avtoelon.uz": { name: "Avtoelon", badge: "Yangi ehtiyot qismlar", domain: "avtoelon.uz", location: "O‘zbekiston" },

  // 6. MDH va Qo'shni davlat gigantlari
  "ozon.ru": { name: "Ozon", badge: "Rossiya bozori", domain: "ozon.ru", location: "Rossiya" },
  "market.yandex.ru": { name: "Yandex Market RU", badge: "Rossiya bozori", domain: "market.yandex.ru", location: "Rossiya" },
  "kaspi.kz": { name: "Kaspi.kz", badge: "Qozog‘iston bozori", domain: "kaspi.kz", location: "Qozog‘iston" },
  "trendyol.com": { name: "Trendyol", badge: "Turkiya", domain: "trendyol.com", location: "Turkiya" },
  "hepsiburada.com": { name: "Hepsiburada", badge: "Turkiya", domain: "hepsiburada.com", location: "Turkiya" },
  "rozetka.com.ua": { name: "Rozetka", badge: "Ukraina", domain: "rozetka.com.ua", location: "Ukraina" },
  "prom.ua": { name: "Prom.ua", badge: "Ukraina", domain: "prom.ua", location: "Ukraina" },
  "allegro.pl": { name: "Allegro", badge: "Yevropa", domain: "allegro.pl", location: "Polsha" },
  "kaufland.de": { name: "Kaufland", badge: "Germaniya", domain: "kaufland.de", location: "Germaniya" },

  // 7. Global marketpleyslar
  "amazon.com": { name: "Amazon", badge: "Global gigant", domain: "amazon.com", location: "Global (AQSh)" },
  "ebay.com": { name: "eBay", badge: "Global bozor", domain: "ebay.com", location: "Global" },
  "walmart.com": { name: "Walmart", badge: "AQSh chakana", domain: "walmart.com", location: "AQSh" },
  "aliexpress.com": { name: "AliExpress", badge: "Xitoy chakana", domain: "aliexpress.com", location: "Xitoy / Global" },
  "alibaba.com": { name: "Alibaba", badge: "Ulgurji B2B", domain: "alibaba.com", location: "Xitoy B2B" },
  "temu.com": { name: "Temu", badge: "Arzon trendlar", domain: "temu.com", location: "Global" },
  "shein.com": { name: "SHEIN", badge: "Moda va kiyim", domain: "shein.com", location: "Global" },
  "etsy.com": { name: "Etsy", badge: "Handmade", domain: "etsy.com", location: "Global" },
};

/**
 * 🇺🇿 Qidiruv so'zidan viloyat va shahar nomlarini tozalash (SEPARATE CONTEXT FROM QUERY - V16.0)
 * Qidiruv so'ziga viloyat nomi qo'shilsa milliy do'konlardagi tovarlar topilmay qoladi.
 */
export function stripRegionFromQuery(query: string): string {
  if (!query) return '';
  const regions = [
    'toshkent shahri', 'toshkent viloyati', 'toshkent shaxri', 'toshkent sh.', 'toshkent',
    'xorazm viloyati', 'xorazm',
    'samarqand viloyati', 'samarqand',
    'buxoro viloyati', 'buxoro',
    'andijon viloyati', 'andijon',
    "farg'ona viloyati", 'fargona viloyati', "farg'ona", 'fargona',
    'namangan viloyati', 'namangan',
    'qashqadaryo viloyati', 'qashqadaryo',
    'surxondaryo viloyati', 'surxondaryo',
    'jizzax viloyati', 'jizzax',
    'sirdaryo viloyati', 'sirdaryo',
    'navoiy viloyati', 'navoiy',
    "qoraqalpog'iston", 'qoraqalpogiston',
    'viloyati', 'shahri'
  ];
  let cleaned = query;
  for (const reg of regions) {
    const re = new RegExp(`\\b${reg}\\b`, 'gi');
    cleaned = cleaned.replace(re, ' ');
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

export const KNOWN_UZBEK_STORES: Record<string, string> = {
  'asaxiy.uz': 'Asaxiy',
  'mediapark.uz': 'Mediapark',
  'texnomart.uz': 'Texnomart',
  'idea.uz': 'Idea',
  'uzum.uz': 'Uzum Market',
  'olcha.uz': 'Olcha',
  'zoodmall.com': 'Zoodmall',
  'zoodmall.uz': 'Zoodmall',
  'elmakon.uz': 'Elmakon',
  'tezz.uz': 'Tezz.uz',
  'ikarvon.uz': 'IKarvon',
};

/**
 * 🇺🇿 3.2. Taksonomiya va Negativ Filtrlar Lug'ati (Category Rules)
 */
export interface CategoryRule {
  key: string;
  name: string;
  required_tokens: string[];
  forbidden_tokens: string[];
  min_price: number;
  max_price: number;
  monthly_kwh_est: number;
  regional_insight: Record<string, string>;
}

export const CATEGORY_RULES: Record<string, CategoryRule> = {
  "elektr_choynak": {
    key: "elektr_choynak",
    name: "Elektr choynak",
    required_tokens: ["choynak", "kettle", "термопот", "samovar", "tefal"],
    forbidden_tokens: [
      "naushnik", "headphone", "airpods", "klaviatura", "mouse", 
      "televizor", "smart tv", "kabel", "chexol", "plita", "filtr",
      "headset", "quloqchin", "telefon", "noutbuk"
    ],
    min_price: 80_000,
    max_price: 4_000_000,
    monthly_kwh_est: 18,
    regional_insight: {
      "Toshkent": "Toshkentning qattiq suvi uchun zanglamas po‘lat ten (SUS 304) va quruq qaynashdan avto-o‘chish tizimi shart.",
      "Xorazm": "Sho‘r suv sharoitida zanglamaydigan yopiq diskli isitgich va oson tozalanuvchi metall filtr zarur.",
      "default": "Avtomatik o‘chish va zanglamas po‘lat korpus xizmat muddatini uzaytiradi."
    }
  },
  "konditsioner": {
    key: "konditsioner",
    name: "Konditsioner",
    required_tokens: ["konditsioner", "кондиционер", "split", "inverter", "btu", "сплит"],
    forbidden_tokens: [
      "pult", "kronshteyn", "freon", "truba", "filtr", "chexol", 
      "naushnik", "headset", "choynak", "televizor"
    ],
    min_price: 2_500_000,
    max_price: 60_000_000,
    monthly_kwh_est: 150,
    regional_insight: {
      "Xorazm": "Xorazmning +45°C gacha issiq iqlimi va sho‘r havosi uchun T3 tropik kompressor hamda Gold Fin/Blue Fin korroziyaga qarshi qoplama talab etiladi.",
      "Toshkent": "Tarmoq kuchlanishi o‘ynashiga qarshi past kuchlanishda (160V-260V) barqaror ishlovchi inverter kompressor maqbul.",
      "default": "Inverter texnologiyasi oddiy modellarga nisbatan oyiga 35-40% elektrni tejaydi."
    }
  },
  "televizor": {
    key: "televizor",
    name: "Televizor",
    required_tokens: ["televizor", "tv", "телевизор", "smart tv", "oled", "qled", "uhd"],
    forbidden_tokens: [
      "pult", "chexol", "kronshteyn", "kabel", "tyuner", "naushnik", 
      "headphone", "choynak"
    ],
    min_price: 900_000,
    max_price: 80_000_000,
    monthly_kwh_est: 25,
    regional_insight: {
      "Toshkent": "Kuchlanish tebranishiga chidamli quvvat bloki (100-240V) va Smart TV Android/Google TV platformasi tavsiya etiladi.",
      "default": "4K UltraHD Smart TV o‘rtacha 90-110 Vt quvvat sarflaydi."
    }
  },
  "muzlatgich": {
    key: "muzlatgich",
    name: "Muzlatgich / Sovutkich",
    required_tokens: ["muzlatgich", "sovutkich", "xolodilnik", "холодильник", "морозильник", "no frost"],
    forbidden_tokens: ["kompressor", "freon", "polka", "termostat", "pult", "naushnik", "choynak"],
    min_price: 1_800_000,
    max_price: 35_000_000,
    monthly_kwh_est: 24,
    regional_insight: {
      "Xorazm": "Yuqori yozgi haroratda ST/T iqlim sinfiga ega, No Frost tizimi bilan jihozlangan model zarur.",
      "default": "Inverter kompressorli No Frost sovutkich elektr energiyasini 30% tejaydi."
    }
  },
  "kir_yuvish": {
    key: "kir_yuvish",
    name: "Kir yuvish mashinasi",
    required_tokens: ["kir yuvish", "стиральн", "kir mashina", "avtomat", "washing"],
    forbidden_tokens: ["shlang", "motor", "remont", "zapchast", "poroshok", "naushnik"],
    min_price: 2_000_000,
    max_price: 25_000_000,
    monthly_kwh_est: 20,
    regional_insight: {
      "Toshkent": "Qattiq suv sharoitida qizdirgich tenini seramika himoya qoplamali modellar ko‘p yil xizmat qiladi.",
      "Xorazm": "Past suv bosimida ham ishlay oluvchi pompa va zanglamas baraban zarur.",
      "default": "Inverter Direct Drive motor A+++ energiya samaradorligini ta'minlaydi."
    }
  },
  "chinni_idishlar": {
    key: "chinni_idishlar",
    name: "Chinni va oshxona idishlari",
    required_tokens: ["chashka", "idish", "serviz", "piyola", "tarelka", "likopcha", "choynak", "nabor", "farfor", "chinni", "qozon", "tova", "lagan", "tovoq"],
    forbidden_tokens: [
      "naushnik", "headphone", "headset", "quloqchin", "telefon", "noutbuk", 
      "smartfon", "televizor", "konditsioner", "klaviatura", "mouse", "chexol", "kabel", "earbuds"
    ],
    min_price: 25_000,
    max_price: 5_000_000,
    monthly_kwh_est: 0,
    regional_insight: {
      "default": "Yuqori haroratda pishirilgan keramik va chinni idishlar issiqlikni uzoq saqlaydi, mikroto‘lqinli pechga mos va emal qoplamasi qattiq suvda ham darz ketmaydi."
    }
  },
  "oshxona_anjomlari": {
    key: "chinni_idishlar",
    name: "Oshxona anjomlari",
    required_tokens: ["chashka", "idish", "serviz", "piyola", "tarelka", "likopcha", "farfor", "chinni", "qozon", "tova", "lagan", "tovoq"],
    forbidden_tokens: [
      "naushnik", "headphone", "headset", "quloqchin", "telefon", "noutbuk", 
      "smartfon", "televizor", "konditsioner", "klaviatura", "mouse"
    ],
    min_price: 25_000,
    max_price: 5_000_000,
    monthly_kwh_est: 0,
    regional_insight: {
      "default": "Zarbalarga chidamli va oziq-ovqat xavfsizligi standartlariga to'liq javob beradi."
    }
  },
  "oshxona_idishlari": {
    key: "chinni_idishlar",
    name: "Oshxona idishlari",
    required_tokens: ["chashka", "idish", "serviz", "piyola", "tarelka", "likopcha", "choynak", "nabor", "farfor", "chinni", "qozon", "tova"],
    forbidden_tokens: [
      "naushnik", "headphone", "headset", "quloqchin", "telefon", "noutbuk", 
      "smartfon", "televizor", "konditsioner", "klaviatura", "mouse", "chexol"
    ],
    min_price: 25_000,
    max_price: 5_000_000,
    monthly_kwh_est: 0,
    regional_insight: {
      "default": "Yuqori haroratda pishirilgan keramik va chinni idishlar issiqlikni uzoq saqlaydi va emal qoplamasi qattiq suvda ham darz ketmaydi."
    }
  },
  "telefon": {
    key: "telefon",
    name: "Smartfonlar va telefonlar",
    required_tokens: ["telefon", "smartfon", "iphone", "samsung", "redmi", "xiaomi", "honor", "vivo", "oppo", "galaxy", "realme"],
    forbidden_tokens: ["chexol", "steklo", "shnur", "kabel", "konditsioner", "muzlatgich", "choynak"],
    min_price: 500_000,
    max_price: 25_000_000,
    monthly_kwh_est: 2,
    regional_insight: {
      "default": "O'zbekiston hududida IMEI ro'yxatidan o'tgan (Uztel rasmiy) va 1 yil rasmiy kafolatga ega modellar tavsiya etiladi."
    }
  },
  "noutbuk": {
    key: "noutbuk",
    name: "Noutbuklar va kompyuterlar",
    required_tokens: ["noutbuk", "laptop", "kompyuter", "macbook", "lenovo", "asus", "hp", "acer", "dell", "thinkpad", "victus", "tuf"],
    forbidden_tokens: ["chexol", "sumka", "mouse", "sichqoncha", "konditsioner", "muzlatgich", "choynak"],
    min_price: 2_000_000,
    max_price: 45_000_000,
    monthly_kwh_est: 10,
    regional_insight: {
      "default": "Rasmiy servis markazi mavjud va kuchlanish tebranishlariga chidamli quvvatlagichli modellar ma'qul."
    }
  },
  "apparel": {
    key: "apparel",
    name: "Kiyim-kechak va poyabzal",
    required_tokens: [],
    forbidden_tokens: ["telefon", "noutbuk", "televizor", "konditsioner", "muzlatgich", "kompressor"],
    min_price: 1_000,
    max_price: 50_000_000,
    monthly_kwh_est: 0,
    regional_insight: {
      "default": "O‘lcham, mato tarkibi (paxta/sintetika) va yetkazib berish shartlariga e’tibor bering."
    }
  },
  "boshqa": {
    key: "boshqa",
    name: "Mahsulot",
    required_tokens: [],
    forbidden_tokens: [],
    min_price: 1_000,
    max_price: 100_000_000,
    monthly_kwh_est: 0,
    regional_insight: {
      "default": "Rasmiy kafolat va tezkor yetkazib berish shartlariga e'tibor qarating."
    }
  }
};

/**
 * So'rovdan kategoriya kalitini aniqlash
 */
export function detectCategoryKey(query?: string, categoryHint?: string | null): string {
  const text = `${query || ''} ${categoryHint || ''}`.toLowerCase();
  if (/\b(telefon|smartfon|iphone|samsung|galaxy|redmi|xiaomi|honor|vivo|oppo|realme|pixel)\b/i.test(text)) {
    return 'telefon';
  }
  if (/\b(noutbuk|laptop|kompyuter|macbook|komp|asus|lenovo|hp|acer|dell|thinkpad|victus|tuf)\b/i.test(text)) {
    return 'noutbuk';
  }
  if (/\b(choynak|kettle|термопот|samovar)\b/i.test(text) && !/\b(chashka|serviz|piyola|likopcha|likopchalar|tarelka)\b/i.test(text)) {
    return 'elektr_choynak';
  }
  if (/\b(kondits|kandits|split|inverter|btu)\b/i.test(text)) {
    return 'konditsioner';
  }
  if (/\b(tv|televiz|smart\s*tv|oled|qled)\b/i.test(text)) {
    return 'televizor';
  }
  if (/\b(muzlat|sovut|xolod|мороз)\b/i.test(text)) {
    return 'muzlatgich';
  }
  if (/\b(kir\s*mash|kir\s*yuvish|stiralk|washing)\b/i.test(text)) {
    return 'kir_yuvish';
  }
  if (/\b(chashka|idish|serviz|piyola|tarelka|likopcha|likopchalar|lagan|tovoq|farfor|chinni|qozon|tova)\b/i.test(text)) {
    return 'chinni_idishlar';
  }
  if (/\b(paypoq|noski|носки|socks|kurtka|krossovka|futbolka|shim|ko'ylak|kiyim|tufli|botinka|kepka|shapka|krasovka)\b/i.test(text)) {
    return 'apparel';
  }
  if (categoryHint && CATEGORY_RULES[categoryHint]) {
    return categoryHint;
  }
  return 'boshqa'; // ❌ NEVER default to 'konditsioner'!
}

// Gallyutsinatsiya va chet el platformalarini chetlatish uchun stop-so'zlar
const STOP_WORDS = [
  'tent', 'cabin', 'guitar', 'amp', 'palatka', 'kurtka', 'palto',
  'ebay', 'qvc', 'walmart', 'amazon', 'aliexpress', 'alibaba',
  'chexol', 'zapchast', 'zapchasti', 'shnur', 'motor', 'remont',
  'qopqoq', 'batareya almashtirish'
];

/**
 * 🚫 Blog, maqola, forum va obzorlarni qat'iy chetlatish kalit so'zlari
 */
export const BLOG_AND_ARTICLE_KEYWORDS = [
  'maqola', 'blog', 'yangiliklar', 'qanday tanlash', 'haqida ma\'lumot',
  'maslahat', 'ko\'rsatma', 'obzor', 'sharh', 'forum', 'wikipedia', 'habar',
  'qanday ishlaydi', 'foydali maslahat', 'reiting', 'top-10', 'top 10', 'tarixi',
  'qoidalari', 'usullari', 'arxiv'
];

/**
 * 🚫 Idish-tovoqlar so'ralganda qat'iy chetlatilishi lozim bo'lgan texnika kalit so'zlari
 */
export const FORBIDDEN_KEYWORDS_FOR_DISHWARE = [
  'naushnik', 'headphone', 'headset', 'quloqchin', 'telefon', 'noutbuk', 
  'smartfon', 'televizor', 'konditsioner', 'monoblok', 'kir yuvish', 'muzlatgich'
];

/**
 * So'rov oshxona idishlariga tegishli ekanligini tekshirish
 */
export function isDishwareQuery(query?: string, category?: string | null): boolean {
  const text = `${query || ''} ${category || ''}`.toLowerCase();
  return /\b(chashka|chashkalar|idish|idishlar|serviz|choynak|piyola|piyolalar|tarelka|tarelka|likopcha|likopchalar|lagan|tovoq|qozon|tova|vilka|qoshiq|pichoq|kostryulya|farfor|keramika|keramik|stakan|bokal|choy\s*idish|oshxona\s*idish|krujka|choy\s*to'plami|chinni|chinni_idishlar|oshxona_anjomlari)\b/i.test(text);
}

/**
 * 🏷️ 1. Kategoriyaga sezgir yorliqlar (Category-Aware Badges - V7.0)
 * Chinni idishlarga energiya tejamkorligi aslo yozilmaydi!
 */
export function getCategoryBadges(categoryKey: string, itemTitle: string): string[] {
  const title = (itemTitle || "").toLowerCase();
  const cat = (categoryKey || "").toLowerCase();
  
  if (cat.includes("chinni") || cat.includes("idish") || cat.includes("oshxona") || isDishwareQuery(title, cat)) {
    const badges = ["Oziq-ovqat xavfsizligi sertifikati"];
    if (title.includes("chinni") || title.includes("farfor")) {
      badges.push("Sifatli chinni");
    } else {
      badges.push("Zarbalarga chidamli chinni");
    }
    if (title.includes("pasabahce") || title.includes("shisha")) {
      badges.push("Zarbalarga chidamli shisha");
    }
    badges.push("Mikroto'lqinli pechga mos");
    badges.push("Idish yuvish mashinasiga mos");
    return badges;
  }
  
  if (cat === "elektr_choynak" || title.includes("choynak") || title.includes("kettle")) {
    return ["Avtomatik o'chish tizimi", "Yashirin qizdirish diski", "Qasmoqqa qarshi filtr"];
  }
  
  if (cat === "konditsioner" || title.includes("konditsioner") || title.includes("inverter")) {
    return ["A+++ Inverter", "R32 freon xavfsiz", "3 yil kafolat"];
  }

  if (cat === "televizor" || title.includes("tv") || title.includes("smart")) {
    return ["Smart TV Android", "4K UltraHD", "Rasmiy kafolat"];
  }

  if (cat === "telefon" || /telefon|smartfon|iphone|samsung|galaxy|redmi|xiaomi|honor/i.test(title)) {
    return ["Rasmiy IMEI ro'yxatdan o'tgan", "1 yil kafolat", "Original qadoq"];
  }

  if (cat === "noutbuk" || /noutbuk|laptop|kompyuter|macbook|asus|lenovo|hp|acer/i.test(title)) {
    return ["Kuchli protsessor", "Rasmiy kafolat", "Tezkor SSD xotira"];
  }

  return ["Rasmiy do'kon kafolati"];
}

/**
 * 🚫 2. Qat'iy do'kon va rasm filtri (Hardened Sanitize V7.0)
 */
export const FORBIDDEN_IMAGE_PATTERNS = [
  "headphone", "naushnik", "earphone", "mouse", "keyboard", 
  "klaviatura", "gadget", "smartwatch", "banner", "logo", "promo",
  "earbuds", "cable", "chexol", "airpods"
];

/**
 * 🛡️ The Absolute Gatekeeper: Agregator API natijalarini qat'iy tekshiruvchi filtr
 */
export function isStrictValidProduct(item: any, categoryKey: string): boolean {
  if (!item) return false;

  // A. Do'kon nomi tekshiruvi: google.com, youtube.com, olx.uz, yandex.uz, birbir.uz, soff.uz, science kabi ruxsatsiz axlat domenlar 100% bloklansin
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

  // Faqat ruxsat etilgan rasmiy do'konlar (30+ Whitelist - V16.0)
  const isAllowedStore = ALLOWED_DOMAINS.some(d => {
    const rootName = d.replace(/\.uz|\.com/g, '');
    return link.includes(d) || store.includes(d) || store.includes(rootName);
  }) ||
    Object.keys(ALLOWED_ECOMMERCE_STORES).some(domain => {
      const meta = ALLOWED_ECOMMERCE_STORES[domain];
      return link.includes(domain) || store.includes(domain) || store.includes(meta.name.toLowerCase());
    });
  if (!isAllowedStore) {
    return false;
  }

  // B. Narx tekshiruvi: "Bozor narxida", narxsiz, kelishilgan yoki 0 so'm bo'lsa darhol chetlatiladi
  let rawPrice = String(item.price || "").toLowerCase();
  if (!rawPrice || rawPrice.includes("bozor") || rawPrice.includes("kelishilgan") || rawPrice.includes("narxi yo'q") || rawPrice.includes("tekshiring")) {
    const fromSnippet = extractPriceFromText(item.snippet || "");
    if (fromSnippet) {
      item.price = `${fromSnippet} so‘m`;
      rawPrice = item.price;
    } else {
      return false;
    }
  }

  const priceNum = parseUzbekPrice(item.price);
  if (!priceNum || priceNum <= 0) {
    return false;
  }

  // C. Rasm tekshiruvi: Agar idish qidirilganda rasm nomida yoki URL'ida elektronika so'zlari bo'lsa
  const isDish = categoryKey === "oshxona_anjomlari" || categoryKey === "chinni_idishlar" || categoryKey === "oshxona_idishlari" || isDishwareQuery(item.title, categoryKey);
  const imgUrl = (item.image || item.thumbnail || item.serpapi_thumbnail || "").toLowerCase();
  const title = (item.title || "").toLowerCase();

  if (isDish) {
    if (FORBIDDEN_IMAGE_PATTERNS.some(pat => imgUrl.includes(pat) || title.includes(pat))) {
      return false; // Naushnik rasmlari shu yerda o'chiriladi!
    }
  }

  return true;
}

/**
 * Matndan O'zbekiston narxlarini aniqlash (so'm, сум, uzs)
 */
export function extractPriceFromText(text: string): number | null {
  if (!text) return null;
  const match = text.match(/(\d{1,3}(?:[\s.,]\d{3})+(?:\s*(?:so['’`]?m|сум|uzs))?|\d{4,9}\s*(?:so['’`]?m|сум|uzs))/i);
  if (match) {
    const rawDigits = match[1].replace(/[^\d]/g, '');
    const num = parseInt(rawDigits, 10);
    if (!isNaN(num) && num >= 1000 && num <= 100000000) {
      return num;
    }
  }
  return null;
}

/**
 * 🛡️ 3.3. Qat'iy Validatsiya: Narxni tahlil qilish (parse_uzbek_price)
 */
export function parseUzbekPrice(rawVal: any): number | null {
  if (!rawVal) return null;
  const valStr = String(rawVal).toLowerCase().trim();

  // Bozor narxida, narx ko'rsatilmagan kabi holatlarni rad etish
  if (['bozor narxida', 'kelishilgan', "narxi yo'q", "narx ko'rsatilmagan", 'mavjud emas', "do'kondan tekshiring", "narxni do‘kondan tekshiring"].some(x => valStr.includes(x))) {
    return null;
  }

  const fromText = extractPriceFromText(valStr);
  if (fromText) return fromText;

  const cleaned = valStr.replace(/[^\d]/g, '');
  if (!cleaned) return null;
  const num = parseInt(cleaned, 10);
  return isNaN(num) || num <= 0 ? null : num;
}

/**
 * 🛡️ 3.3. Qat'iy Validatsiya: Rasm tekshiruvi (validate_image_url)
 */
export function validateImageUrl(url: string, title: string, forbiddenKeywords: string[]): boolean {
  if (!url || !url.startsWith('http')) {
    return false;
  }

  const lowerUrl = url.toLowerCase();
  // Placeholder va dummy rasmlarni bloklash
  if (['placeholder', 'default', 'no-image', 'empty', 'avatar', 'blank', 'notfound'].some(x => lowerUrl.includes(x))) {
    return false;
  }

  // Rasm nomida boshqa kategoriya nomi kelsa bloklash (masalan choynakda headphone.jpg)
  if (forbiddenKeywords.some(badWord => lowerUrl.includes(badWord.toLowerCase()))) {
    return false;
  }

  return true;
}

/**
 * Joriy O'zbekiston tariflari bo'yicha energiya sarfi va oylik xarajat hisobi
 * Bazaviy ijtimoiy norma: 1 kVt/soat = 450 so'm (200 kVt gacha)
 */
export function calculateEnergyMetrics(categoryKey: string) {
  const rule = CATEGORY_RULES[categoryKey] || CATEGORY_RULES['boshqa'] || { monthly_kwh_est: 0 };
  const monthlyKwh = rule.monthly_kwh_est || 0;
  const tariffPerKwh = 450; // so'm/kVt (O'zbekiston 2024-2026 joriy bazaviy tarifi)
  const monthlyCostUzs = monthlyKwh * tariffPerKwh;

  return {
    monthlyKwh,
    monthlyCostUzs,
    tariffPerKwh
  };
}

/**
 * 🛡️ Strict Query Sanitizer va Kategoriya Nazorati (Directive v6.0 Checklist)
 */
export function validateProductCategory(
  query: string,
  productTitle: string,
  snippet?: string,
  expectedCategory?: string
): boolean {
  const qLower = (query || '').toLowerCase();
  const titleLower = (productTitle || '').toLowerCase();
  const snipLower = (snippet || '').toLowerCase();
  const allLower = `${titleLower} ${snipLower}`;

  // 1. Blog, maqola, sharh va yangiliklarni qat'iy bloklash
  if (BLOG_AND_ARTICLE_KEYWORDS.some(kw => titleLower.includes(kw))) {
    return false;
  }

  // 2. Chashka, idish, serviz so'ralganda:
  if (isDishwareQuery(qLower, expectedCategory)) {
    // Agar texnika so'zlari bo'lsa darhol kesib tashlash!
    if (FORBIDDEN_KEYWORDS_FOR_DISHWARE.some(fk => allLower.includes(fk))) {
      return false; // Bu mahsulotni tashlab yubor!
    }
    // Sarlavhada idish yoki oshxona elementi bo'lishi shart
    const hasDishWord = /\b(chashka|idish|serviz|choynak|piyola|tarelka|qozon|tova|krujka|farfor|keramik|stakan|bokal|choy|to'plam|oshxona|nabor|likopcha)\b/i.test(allLower);
    if (!hasDishWord) {
      return false;
    }
  }

  // 3. Monoblok so'ralganda faqat monoblok va PC modellar
  if (qLower.includes('monoblok')) {
    if (titleLower.includes('televizor') && !titleLower.includes('monoblok')) return false;
    if (titleLower.includes('quloqchin') || titleLower.includes('headset')) return false;
  }

  return true;
}

/**
 * 🛡️ 3.3. Qat'iy Validatsiya Dvigateli (Deterministic Guardrail Code - Texnik Topshiriq)
 */
export function sanitizeAggregatedResults(
  rawSerpItems: any[], 
  categoryKey: string,
  targetRegion: string = 'Toshkent'
): SerpProductItem[] {
  const rule = CATEGORY_RULES[categoryKey] || CATEGORY_RULES['boshqa'];
  if (!rule) return [];

  const cleanResults: SerpProductItem[] = [];
  const seenTitles = new Set<string>();
  const energy = calculateEnergyMetrics(categoryKey);
  const regInsight = rule.regional_insight[targetRegion] || rule.regional_insight['default'];

  for (const item of rawSerpItems) {
    const title = (item.title || '').trim();
    if (!title || seenTitles.has(title.toLowerCase())) continue;

    const snippet = (item.snippet || '').trim();
    const link = item.link || item.product_link || '';
    const img = item.thumbnail || item.serpapi_thumbnail || item.image || (item.pagemap?.cse_image?.[0]?.src) || '';
    const sourceStr = (item.source || '').toLowerCase();
    const fullContent = `${title} ${snippet}`.toLowerCase();

    // 1. Do'kon tekshiruvi: faqat ruxsat etilgan do'konlar (ALLOWED_ECOMMERCE_STORES)
    let matchedStore: { name: string; badge: string; domain: string } | null = null;
    for (const [domain, meta] of Object.entries(ALLOWED_ECOMMERCE_STORES)) {
      if (link.toLowerCase().includes(domain) || sourceStr.includes(domain) || sourceStr.includes(meta.name.toLowerCase())) {
        matchedStore = meta;
        break;
      }
    }
    if (!matchedStore) {
      continue;
    }

    // 2. Taqiqlangan so'zlar tekshiruvi (Anti-Mismatch)
    if (rule.forbidden_tokens.length > 0 && rule.forbidden_tokens.some(neg => fullContent.includes(neg.toLowerCase()))) {
      continue;
    }

    // 3. Majburiy tovar belgilari mavjudligi (faqat agar kategoriya uchun belgilangan bo'lsa)
    if (rule.required_tokens.length > 0 && !rule.required_tokens.some(req => fullContent.includes(req.toLowerCase()))) {
      continue;
    }

    // 4. Narxni qat'iy tahlil qilish
    const priceNum = parseUzbekPrice(item.price || item.snippet);
    if (!priceNum) {
      continue;
    }
    if (priceNum < rule.min_price || priceNum > rule.max_price) {
      continue;
    }

    // 5. Rasm validatsiyasi
    if (!validateImageUrl(img, title, rule.forbidden_tokens)) {
      continue;
    }

    seenTitles.add(title.toLowerCase());

    cleanResults.push({
      id: generateUniqueId(),
      title: title.slice(0, 70),
      price: `${priceNum.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m`,
      priceNumber: priceNum,
      source: matchedStore.name,
      storeBadge: matchedStore.badge,
      link,
      thumbnail: img,
      images: [img],
      snippet: snippet.slice(0, 120),
      region: targetRegion,
      keySpecs: extractKeySpecs(title, snippet, categoryKey),
      warranty: rule.key === 'konditsioner' ? '3 yil kompressor kafolati' : '12 oy rasmiy kafolat',
      deliveryInfo: `${targetRegion} bo‘ylab 24 soatda yetkazish (${matchedStore.badge})`,
      monthlyKwh: energy.monthlyKwh,
      monthlyCostUzs: energy.monthlyCostUzs,
      roiVerdict: regInsight,
    });
  }

  // Narx bo'yicha saralash va eng sara 12 ta natijani ajratish
  cleanResults.sort((a, b) => (a.priceNumber || 0) - (b.priceNumber || 0));
  return cleanResults.slice(0, 12);
}

/**
 * Tasodifiy unikal ID generatsiyasi
 */
export function generateUniqueId(): string {
  return 'prod-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

/**
 * Linkdan do'kon nomini aniqlash (Directive v6.0: "Mahalliy do'kon" emas, aniq brend)
 */
export function extractDomainName(link: string): string {
  if (!link) return 'Uzum Market';
  const linkLower = link.toLowerCase();
  for (const [domain, name] of Object.entries(KNOWN_UZBEK_STORES)) {
    if (linkLower.includes(domain)) {
      return name;
    }
  }
  try {
    const u = new URL(link);
    const host = u.hostname.replace(/^www\./, '');
    const parts = host.split('.');
    if (parts.length > 0 && parts[0]) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return 'Uzum Market';
  } catch {
    return 'Uzum Market';
  }
}

/**
 * Matndan narxni aniqlash (Hech qanday "Bozor narxida" emas!)
 */
export function extractPriceFromSnippet(text?: string): string {
  if (!text) return 'Narxni do‘kondan tekshiring';
  const priceMatch = text.match(/(\d+[\d\s.,]*\s*(?:so[‘']?m|сум|\$|usd|uzs))/i);
  if (priceMatch) {
    return priceMatch[1].trim();
  }
  return 'Narxni do‘kondan tekshiring';
}

/**
 * Kategoriyaga mos ishonchli rasm helperi (Directive v6.0)
 */
export function getProductFallbackImage(category?: string, title?: string): string {
  const text = `${category || ''} ${title || ''}`.toLowerCase();
  
  // Elektr choynak (Kettle)
  if (text.includes('choynak') || text.includes('kettle') || text.includes('термопот') || text.includes('samovar')) {
    return 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80';
  }

  // Oshxona idishlari, chashka va servizlar
  if (isDishwareQuery(text, category)) {
    return 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('monoblok') || text.includes('all-in-one') || text.includes('all in one')) {
    return 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('konditsioner') || text.includes('split') || text.includes('btu') || text.includes('ac')) {
    return 'https://images.unsplash.com/photo-1614633833026-06201a4034aa?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('muzlat') || text.includes('sovut') || text.includes('xolod')) {
    return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('kir') || text.includes('wash') || text.includes('стирал')) {
    return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('tv') || text.includes('televizor') || text.includes('smart')) {
    return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80';
  }
  if (text.includes('noutbuk') || text.includes('laptop') || text.includes('kompyuter')) {
    return 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80';
  }

  // Umumiy yoki kiyim-kechak uchun soxta qahva stakanlari berilmasin
  return '';
}

/**
 * Xususiyatlar ekstraktori (Specs generator)
 */
function extractKeySpecs(title: string, snippet?: string, category?: string): string[] {
  const specs: string[] = [];
  const text = `${title} ${snippet || ''}`.toLowerCase();

  // Agar idish yoki chashka bo'lsa
  if (isDishwareQuery(text, category)) {
    if (/keramik|chinn|farfor/i.test(text)) specs.push('Sifatli chinni / keramika');
    if (/6\s*kishi|serviz|to'plam|nabor/i.test(text)) specs.push('To‘liq to‘plam (Serviz)');
    if (/choynak|choy/i.test(text)) specs.push('Choy marosimi uchun');
    specs.push('Issiqlikka chidamli', 'Oson yuviladi va xavfsiz');
    return specs.slice(0, 3);
  }

  // RAM
  const ramMatch = text.match(/(\d+\s*(?:gb|гб)\s*(?:ram|tezkor|ddr\d?))/i) || text.match(/(\b\d+\s*(?:gb|гб)\b)/i);
  if (ramMatch && !ramMatch[0].toLowerCase().includes('ssd')) specs.push(`RAM: ${ramMatch[0].trim()}`);

  // SSD/HDD
  const ssdMatch = text.match(/(\d+\s*(?:gb|tb|тб|гб)\s*(?:ssd|hdd|xotira|nvme))/i);
  if (ssdMatch) specs.push(`Xotira: ${ssdMatch[0].trim()}`);

  // Diagonali / Ekran
  const screenMatch = text.match(/(\d+(?:\.\d+)?["”\s]*(?:duym|дюйм|inch|'))/i);
  if (screenMatch) specs.push(`Ekran: ${screenMatch[0].trim()}`);

  // Protsessor / GPU
  const cpuMatch = text.match(/(core\s*i[3579][\w-]*|ryzen\s*[3579][\w-]*|m[123]\s*pro|rtx\s*\d{4}|gtx\s*\d{4})/i);
  if (cpuMatch) specs.push(`Protsessor/GPU: ${cpuMatch[0].trim()}`);

  // Quvvat / Inverter / No Frost
  if (/inverter|инвертор/i.test(text)) specs.push('Tejamkor Inverter tizimi');
  if (/no frost|ноу фрост/i.test(text)) specs.push('No Frost avto-eritish');
  if (/smart tv|4k|uhd/i.test(text)) specs.push('Smart TV 4K UltraHD');

  if (specs.length === 0) {
    specs.push('Rasmiy O‘zbekiston kafolati', 'Yetkazib berish xizmati mavjud');
  }

  return specs.slice(0, 3);
}

/**
 * 🛡️ Backend uchun Multi-Store Scraping, Himoya va Validation Kodi (v6.0)
 */
export function validateAndFilterProducts(
  rawResults: any[],
  expectedCategory?: string,
  targetRegion?: string,
  searchQuery?: string
): SerpProductItem[] {
  const cleanProducts: SerpProductItem[] = [];
  const queryLower = (searchQuery || expectedCategory || '').toLowerCase();
  const seenTitles = new Set<string>();
  const storeCounts: Record<string, number> = {};

  for (const item of rawResults) {
    const title = (item.title || '').trim();
    if (!title || seenTitles.has(title.toLowerCase())) continue;

    const titleLower = title.toLowerCase();
    const sourceLower = (item.source || '').toLowerCase();
    const link = item.link || item.product_link || '';
    const linkLower = link.toLowerCase();
    const snippetLower = (item.snippet || '').toLowerCase();
    const allText = `${titleLower} ${sourceLower} ${linkLower} ${snippetLower}`;

    // 1. Stop-word yoki chet el domenlarini qat'iy chetlatish
    if (STOP_WORDS.some(sw => allText.includes(sw))) {
      continue;
    }

    // 2. Qat'iy Kategoriya va Relevancy tekshiruvi (Directive v6.0)
    const isValidCategory = validateProductCategory(
      queryLower,
      title,
      item.snippet,
      expectedCategory
    );
    if (!isValidCategory) {
      continue;
    }

    // 3. Do'kon nomini aniqlash va O'zbekiston do'koniga bog'lash
    const storeName = extractDomainName(link || item.source);

    // Bir do'kondan ko'pi bilan 2 ta mahsulot olish (Multi-store xilma-xilligi uchun)
    const currentCount = storeCounts[storeName] || 0;
    if (currentCount >= 2 && cleanProducts.length >= 4) {
      continue;
    }

    // 4. Rasm manbasini olish: pagemap cse_image, serpapi thumbnail yoki fallback
    let thumbnail = item.thumbnail || item.serpapi_thumbnail || '';
    if (!thumbnail && item.pagemap?.cse_image && Array.isArray(item.pagemap.cse_image) && item.pagemap.cse_image[0]?.src) {
      thumbnail = item.pagemap.cse_image[0].src;
    }
    if (!thumbnail || thumbnail.length < 5) {
      thumbnail = getProductFallbackImage(expectedCategory, title);
    }

    // 5. Narxni ajratish - Hech qanday "Bozor narxida" so'zi bo'lmasin!
    let price = item.price;
    if (!price || price === 'Bozor narxida') {
      if (item.snippet) {
        price = extractPriceFromSnippet(item.snippet);
      }
    }
    if (!price || price === 'Bozor narxida') {
      price = 'Narxni do‘kondan tekshiring';
    }

    // Xususiyatlar
    const keySpecs = extractKeySpecs(title, item.snippet, expectedCategory);

    seenTitles.add(titleLower);
    storeCounts[storeName] = currentCount + 1;

    cleanProducts.push({
      id: generateUniqueId(),
      title,
      price,
      source: storeName,
      link: link || '#',
      thumbnail,
      images: [thumbnail],
      snippet: item.snippet,
      region: targetRegion || 'Toshkent',
      keySpecs,
      warranty: isDishwareQuery(queryLower) ? 'Sifat sertifikati mavjud' : '12 oy rasmiy kafolat',
      deliveryInfo: `${targetRegion || 'Toshkent'} bo‘ylab 24 soatda yetkazish`,
    });

    if (cleanProducts.length >= 8) break; // Eng mos 8 ta variant
  }

  return cleanProducts;
}

/**
 * 🌐 Backend logic for Multi-Store Scraping and Validation (v6.0)
 */
export async function fetchAndEnrichStores(
  expandedQuery: string,
  category?: string,
  region?: string,
  originalSearchTerm?: string
): Promise<SerpProductItem[]> {
  const apiKey = getSerpApiKey();
  if (!apiKey) {
    console.warn('[SerpAPI] SERPAPI_API_KEY mavjud emas');
    return [];
  }

  const rawResults: any[] = [];
  const cleanQuery = expandedQuery.trim();

  try {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', cleanQuery);
    url.searchParams.set('gl', 'uz');
    url.searchParams.set('hl', 'uz');
    url.searchParams.set('num', '20'); // Ko'proq natija tortib olish
    url.searchParams.set('api_key', apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(url.toString(), {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const shopping = data.inline_shopping_results || data.shopping_results || [];
      const organic = data.organic_results || [];
      rawResults.push(...shopping, ...organic);
    }
  } catch (err: any) {
    console.warn('[SerpAPI fetchAndEnrichStores error]:', err?.message || err);
  }

  const categoryKey = detectCategoryKey(originalSearchTerm || cleanQuery, category);
  // 🛡️ The Absolute Gatekeeper: Agregator API ma'lumotlarini qat'iy sanitizatsiya qilish
  const sanitized = sanitizeAggregatedResults(rawResults, categoryKey, region || 'Toshkent');
  const strictlyValid = sanitized.filter(item => isStrictValidProduct(item, categoryKey));
  return strictlyValid;
}

/**
 * Qidiruv yordamchisi (Directive v7.0 Mosligi bilan)
 */

/**
 * ⚡ IQTISODCHI REAL-TIME SEARCH ENGINE (v19.0)
 * O'zbekistonning barcha rasmiy do'konlari narxlari va yuqori sifatli HD rasmlarini
 * o'ta tez (keshlash va sub-sekund agregatsiya bilan) tortib olish dvigateli.
 */
const searchMemoryCache = new Map<string, { data: SerpProductItem[]; expiresAt: number }>();

export async function searchMaxProfit(
  query: string,
  category?: string,
  region?: string
): Promise<SerpProductItem[]> {
  const cleanTerm = stripRegionFromQuery(query).trim();
  if (!cleanTerm) return [];

  const targetRegion = region || 'Toshkent';
  const cacheKey = `${cleanTerm.toLowerCase()}__${targetRegion.toLowerCase()}`;

  // ⚡ 1-QADAM: Xotiradagi o'ta tez kesh (0-1ms javob tezligi!)
  const cached = searchMemoryCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const catKey = detectCategoryKey(cleanTerm, category);
  const rule = CATEGORY_RULES[catKey] || CATEGORY_RULES['boshqa'] || { monthly_kwh_est: 0, min_price: 10000, max_price: 100000000, regional_insight: {} };
  const energy = calculateEnergyMetrics(catKey);
  const regInsight = (rule.regional_insight && rule.regional_insight[targetRegion]) || (rule.regional_insight && rule.regional_insight['default']) || "Rasmiy kafolat va yetkazib berish xizmati bilan.";

  // URL 1: Search endpoint
  const searchUrl = `https://maxprofit.uz/search?q=${encodeURIComponent(cleanTerm)}`;
  
  // URL 2: Kategoriya sahifalari
  const categoryMap: Record<string, string> = {
    'konditsioner': '/katalog/konditsionerlar',
    'noutbuk': '/katalog/noutbuklar',
    'televizor': '/katalog/televizorlar',
    'muzlatgich': '/katalog/muzlatgichlar',
    'kir_yuvish': '/katalog/kir-yuvish-mashinalari',
    'elektr_choynak': '/katalog/choynaklar',
  };

  const urlsToTry = [searchUrl];
  if (categoryMap[catKey]) {
    urlsToTry.push(`https://maxprofit.uz${categoryMap[catKey]}`);
  }

  for (const url of urlsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3200);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'uz,ru;q=0.9',
          'Cache-Control': 'no-cache',
        },
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const html = await res.text();
      const results: SerpProductItem[] = [];
      const seenTitles = new Set<string>();

      // A. Natijalar sonini aniqlash (Results count)
      const headM = html.match(/Результатов:\s*<span>(\d+)<\/span>/i);
      const totalResultsCount = headM ? parseInt(headM[1], 10) : 0;

      // B. Eng arzon narx banneri (Best Banner with Crown)
      let bestBanner: BestBannerData | null = null;
      const bbM = html.match(/<div class="best-banner"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
      if (bbM) {
        const bbHtml = bbM[0];
        const bImg = bbHtml.match(/<img[^>]+src=["']([^"']+)["']/);
        const bTitle = bbHtml.match(/<div class="n">([^<]+)<\/div>/);
        const bStore = bbHtml.match(/<div class="best-store">([\s\S]*?)<\/div>/);
        const bPrice = bbHtml.match(/<div class="p">([\s\S]*?)<\/div>/);
        const bLink = bbHtml.match(/href=["']([^"']+)["']/);

        let cleanLink = bLink ? bLink[1].replace(/&amp;/g, '&') : '';
        if (cleanLink.startsWith('/')) cleanLink = 'https://maxprofit.uz' + cleanLink;

        bestBanner = {
          title: bTitle ? bTitle[1].trim() : '',
          image: bImg ? (bImg[1].startsWith('//') ? 'https:' + bImg[1] : bImg[1].startsWith('/') ? 'https://maxprofit.uz' + bImg[1] : bImg[1]) : '',
          store: bStore ? bStore[1].replace(/<[^>]+>/g, '').trim() : '',
          price: bPrice ? bPrice[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '',
          link: cleanLink
        };
      }

      // C. Narxlar dinamikasi va tahlili (Price Insight & History)
      let priceInsight: PriceInsightData | null = null;
      const piM = html.match(/<section class="pinsight"[^>]*>([\s\S]*?)<\/section>/);
      if (piM) {
        const pi = piM[1];
        const levelM = pi.match(/<span class="pi-level([^"]*)">([^<]+)<\/span>/);
        const subM = pi.match(/<span class="pi-sub">([^<]+)<\/span>/);
        const chartM = pi.match(/data-pts=(['"])(.*?)\1/);
        let chartPts: Array<[string, string, number, number]> = [];
        if (chartM) {
          try {
            chartPts = JSON.parse(chartM[2].replace(/&quot;/g, '"'));
          } catch {}
        }
        const facts: Array<{ label: string; value: string; sub?: string }> = [];
        const factMatches = pi.match(/<div class="pf">([\s\S]*?)<\/div>/g) || [];
        for (const f of factMatches) {
          const lM = f.match(/<span>([^<]+)<\/span>/);
          const vM = f.match(/<b>([\s\S]*?)<\/b>/);
          const smM = f.match(/<small>([^<]+)<\/small>/);
          facts.push({
            label: lM ? lM[1].trim() : '',
            value: vM ? vM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '',
            sub: smM ? smM[1].trim() : ''
          });
        }
        const noteM = pi.match(/<p class="pi-note">([\s\S]*?)<\/p>/);
        priceInsight = {
          level: levelM ? levelM[2].trim() : '📈 Narxlar solishtirildi',
          sub: subM ? subM[1].trim() : '· 30 kunlik',
          chart_points: chartPts,
          facts,
          note: noteM ? noteM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
        };
      }

      // 1. Qidiruv natijalarini parslash (<article class="rrow" ...>)
      const articles = html.match(/<article class="rrow"[\s\S]*?<\/article>/g) || [];
      for (const art of articles) {
        // Rasm
        const imgM = art.match(/<img[^>]+src=['"]([^'"]+)['"]/);
        let img = imgM ? imgM[1] : '';
        if (img.startsWith('//')) img = 'https:' + img;
        else if (img.startsWith('/')) img = 'https://maxprofit.uz' + img;

        // Mahsulot nomi
        const titleM = art.match(/<h3 class="rname">([^<]+)<\/h3>/);
        const title = titleM ? titleM[1].replace(/&quot;/g, '"').trim() : '';
        if (!title || seenTitles.has(title.toLowerCase())) continue;

        // Do'kon
        const storeM = art.match(/<span class="badge-store"[^>]*>([\s\S]*?)<\/span>/);
        let store = storeM ? storeM[1].replace(/<[^>]+>/g, '').trim() : 'Rasmiy do‘kon';
        if (!store) store = 'Rasmiy do‘kon';

        // Do'kon logotipi
        const slogoM = art.match(/<img class="slogo"[^>]+src=['"]([^'"]+)['"]/);
        let storeLogo = slogoM ? slogoM[1] : '';
        if (storeLogo.startsWith('/')) storeLogo = 'https://maxprofit.uz' + storeLogo;

        // Narx
        const priceM = art.match(/data-price="(\d+)"/);
        const priceNum = priceM ? parseInt(priceM[1], 10) : 0;
        if (!priceNum || priceNum < 1000) continue;

        // Eski narx
        const oldM = art.match(/<span class="old">([^<]+)<\/span>/);
        const oldPriceStr = oldM ? oldM[1].replace(/\s+/g, ' ').trim() : '';

        // Chegirma
        const discM = art.match(/data-discount="(\d+)"/);
        const discount = discM ? parseInt(discM[1], 10) : 0;

        // Havola (Direct merchant link yoki MaxProfit redirect)
        const urlM = art.match(/data-url="([^'"]+)"/);
        let directUrl = urlM ? urlM[1] : '';
        const goM = art.match(/href=['"](\/go\?u=[^'"]+)['"]/);
        let link = directUrl || (goM ? 'https://maxprofit.uz' + goM[1].replace(/&amp;/g, '&') : `https://maxprofit.uz/search?q=${encodeURIComponent(title)}`);

        // Muddatli to'lov (Installment)
        const instM = art.match(/<div class="inst">([^<]+(?:<span[^>]*>[^<]+<\/span>)*)<\/div>/);
        const installment = instM ? instM[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';

        // Yetkazib berish (Delivery)
        const delivM = art.match(/<span>🚚\s*([^<]+)<\/span>/);
        const delivery = delivM ? delivM[1].trim() : 'Yetkazib berish mavjud';

        // Do'kon ma'lumotlarini aniqlash
        let storeDisplayName = store;
        let storeBadge = discount > 0 ? `-${discount}% Chegirma` : 'Rasmiy kafolat';
        for (const [dom, meta] of Object.entries(ALLOWED_ECOMMERCE_STORES)) {
          if (store.toLowerCase().includes(dom.replace(/\.uz|\.com/g, '')) || store.toLowerCase().includes(meta.name.toLowerCase())) {
            storeDisplayName = meta.name;
            if (discount <= 0) storeBadge = meta.badge;
            break;
          }
        }

        seenTitles.add(title.toLowerCase());

        results.push({
          id: generateUniqueId(),
          title: title.slice(0, 95),
          price: `${priceNum.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m`,
          priceNumber: priceNum,
          oldPrice: oldPriceStr ? `${oldPriceStr} so‘m` : undefined,
          oldPriceNumber: oldPriceStr ? parseInt(oldPriceStr.replace(/\D/g, ''), 10) : undefined,
          discount: discount > 0 ? discount : undefined,
          source: storeDisplayName,
          storeBadge: storeBadge,
          storeLogo,
          link,
          directUrl: directUrl || link,
          thumbnail: img,
          images: [img],
          snippet: `${storeDisplayName} do‘konida rasmiy kafolat bilan mavjud. ${delivery}.`,
          region: targetRegion,
          keySpecs: extractKeySpecs(title, '', catKey),
          warranty: catKey === 'konditsioner' ? '3 yil kompressor kafolati' : '12 oy rasmiy kafolat',
          deliveryInfo: `${targetRegion} bo‘ylab yetkazish (${storeDisplayName})`,
          installment: installment || undefined,
          monthlyKwh: energy.monthlyKwh,
          monthlyCostUzs: energy.monthlyCostUzs,
          roiVerdict: regInsight,
          badges: discount > 0 ? [`-${discount}% Chegirma`, 'Eng sara narx', 'Rasmiy kafolat'] : ['Eng sara narx', 'Rasmiy kafolat', 'Tezkor yetkazish'],
          isBestPrice: results.length === 0,
        });
      }

      // 2. Kategoriya sahifalari (<a class="pcard" ...>) agar rrow bo'sh bo'lsa
      if (results.length === 0) {
        const pcards = html.match(/<a class="pcard"[\s\S]*?<\/a>/g) || [];
        for (const pc of pcards) {
          const imgM = pc.match(/<img[^>]+src=['"]([^'"]+)['"]/);
          let img = imgM ? imgM[1] : '';
          if (img.startsWith('//')) img = 'https:' + img;
          else if (img.startsWith('/')) img = 'https://maxprofit.uz' + img;

          const titleM = pc.match(/<div class="pc-title">([^<]+)<\/div>/);
          const title = titleM ? titleM[1].trim() : '';
          if (!title || seenTitles.has(title.toLowerCase())) continue;

          const priceM = pc.match(/<div class="pc-price">([\s\S]*?)<\/div>/);
          const priceStr = priceM ? priceM[1].replace(/<[^>]+>/g, '').trim() : '';
          const priceDigits = priceStr.replace(/[^\d]/g, '');
          const priceNum = priceDigits ? parseInt(priceDigits, 10) : 0;
          if (!priceNum) continue;

          const linkM = pc.match(/href="([^"]+)"/);
          const slug = linkM ? linkM[1] : '';

          seenTitles.add(title.toLowerCase());

          results.push({
            id: generateUniqueId(),
            title: title.slice(0, 95),
            price: `${priceNum.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m`,
            priceNumber: priceNum,
            source: 'Iqtisodchi Hamkor Do‘konlari',
            storeBadge: 'Eng yaxshi narx',
            link: slug ? `https://maxprofit.uz${slug}` : `https://maxprofit.uz/search?q=${encodeURIComponent(title)}`,
            directUrl: slug ? `https://maxprofit.uz${slug}` : undefined,
            thumbnail: img,
            images: [img],
            snippet: `Bir nechta yirik rasmiy do‘konlar narxlari taqqoslandi. Rasmiy kafolat bilan.`,
            region: targetRegion,
            keySpecs: extractKeySpecs(title, '', catKey),
            warranty: catKey === 'konditsioner' ? '3 yil kompressor kafolati' : '12 oy rasmiy kafolat',
            deliveryInfo: `${targetRegion} bo‘ylab 24 soatda yetkazish`,
            monthlyKwh: energy.monthlyKwh,
            monthlyCostUzs: energy.monthlyCostUzs,
            roiVerdict: regInsight,
            badges: ['Eng sara narx', 'Do‘konlar taqqoslandi', 'Rasmiy kafolat'],
          });
        }
      }

      if (results.length > 0) {
        results.sort((a, b) => (a.priceNumber || 0) - (b.priceNumber || 0));
        const finalResults = results.slice(0, 24);
        (finalResults as any).priceInsight = priceInsight;
        (finalResults as any).bestBanner = bestBanner;
        (finalResults as any).totalResultsCount = totalResultsCount || results.length;

        // ⚡ Keshga yozish (15 daqiqa saqlanadi - keyingi so'rovlar 0-1ms!)
        searchMemoryCache.set(cacheKey, {
          data: finalResults,
          expiresAt: Date.now() + 15 * 60 * 1000
        });

        return finalResults;
      }
    } catch (err) {
      console.warn('[Iqtisodchi Search error]:', err);
    }
  }

  return [];
}

function normalizeUzText(s: string): string {
  return (s || '')
    .replace(/&lsquo;|&rsquo;|&#039;|&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/['‘’ʻ`]/g, "'")
    .toLowerCase()
    .trim();
}

function stemUzToken(tok: string): string {
  if (tok.length > 4 && tok.endsWith('lari')) return tok.slice(0, -4);
  if (tok.length > 4 && tok.endsWith('lar')) return tok.slice(0, -3);
  if (tok.length > 4 && (tok.endsWith('si') || tok.endsWith('ni') || tok.endsWith('ga') || tok.endsWith('da'))) return tok.slice(0, -2);
  if (tok.length > 4 && tok.endsWith('i')) return tok.slice(0, -1);
  return tok;
}

/**
 * 🔍 Sarlavha qidiruv so'ziga mosligini tekshirish (o'zbekcha apostrof, qo'shimcha va aksessuarlarni aqlli tahlil)
 */
function isRelevantDirectMatch(title: string, query: string, catKey: string): boolean {
  const t = normalizeUzText(title);
  const q = normalizeUzText(query);
  const rawTokens = q.split(/\s+/).filter(w => w.length >= 2);
  if (rawTokens.length === 0) return true;

  // Umumiy sifat/aniqlovchi so'zlarni majburiy ro'yxatdan chiqarish (asosiy tovar so'zi qolsa)
  const optionalModifiers = new Set(["qo'l", "erkaklar", "ayollar", "bolalar", "qishki", "yozgi", "uchun", "arzon", "yangi", "original", "sifatli"]);
  const coreTokens = rawTokens.filter(w => !optionalModifiers.has(w));
  const checkTokens = (coreTokens.length > 0 ? coreTokens : rawTokens).map(stemUzToken);

  const hasMatch = checkTokens.every(tok => t.includes(tok));
  if (!hasMatch) return false;

  // Soat qidirganda akkumulyator (A/soat) yoki blender/kesgichlarni chiqarmaslik
  if (checkTokens.some(tok => tok === 'soat' || tok === 'watch')) {
    if (/\b(a\/soat|akkumulyator|blender|kesgich|plitka)\b/i.test(t)) return false;
  }

  // Telefon / Noutbuk / Televizor qidirganda chexol/oyna/pultlarni chiqarmaslik
  const isDeviceCat = catKey === 'telefon' || catKey === 'noutbuk' || catKey === 'televizor';
  const userWantsAccessory = /\b(chexol|g'ilof|oyna|steklo|pult|kabel|zaryadka|sumka|kronshteyn)\b/i.test(q);
  if (isDeviceCat && !userWantsAccessory) {
    if (/\b(chexol|g'ilof|himoya oynasi|steklo|pult|kronshteyn|shisha|plyonka|кабель|чехол|стекло)\b/i.test(t)) {
      return false;
    }
  }
  return true;
}

/**
 * ⚡ Olcha.uz Tezkor To'g'ridan-to'g'ri API Qidiruvi (~400ms)
 */
async function searchOlchaDirect(query: string, catKey: string, targetRegion: string): Promise<SerpProductItem[]> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3000);
    const url = `https://api.olcha.uz/api/v2/products?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
    });
    clearTimeout(tid);
    if (!res.ok) return [];

    const data = await res.json();
    const rawList: any[] = data?.data?.products || [];
    const results: SerpProductItem[] = [];

    for (const p of rawList.slice(0, 15)) {
      const title = (p.name_oz || p.name_uz || p.name_ru || p.name || '').trim();
      const priceNum = parseInt(String(p.total_price || p.price || '0').replace(/\D/g, ''), 10);
      if (!title || !priceNum || priceNum < 1000) continue;
      if (!isRelevantDirectMatch(title, query, catKey)) continue;

      const oldPriceNum = parseInt(String(p.old_price || '0').replace(/\D/g, ''), 10);
      const img = p.main_image || p.image || '';
      if (!img) continue;

      const productUrl = p.slug
        ? `https://olcha.uz/oz/product/${p.slug}`
        : `https://olcha.uz/oz/search?q=${encodeURIComponent(title)}`;

      results.push({
        id: generateUniqueId(),
        title: title.slice(0, 95),
        price: `${priceNum.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m`,
        priceNumber: priceNum,
        oldPrice: oldPriceNum > priceNum ? `${oldPriceNum.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m` : undefined,
        oldPriceNumber: oldPriceNum > priceNum ? oldPriceNum : undefined,
        discount: oldPriceNum > priceNum ? Math.round(((oldPriceNum - priceNum) / oldPriceNum) * 100) : undefined,
        source: 'Olcha',
        storeBadge: 'Rasmiy kafolat',
        link: productUrl,
        directUrl: productUrl,
        thumbnail: img,
        images: [img],
        snippet: `Olcha do‘konida rasmiy kafolat bilan mavjud. ${targetRegion} bo‘ylab yetkazib beriladi.`,
        region: targetRegion,
        keySpecs: extractKeySpecs(title, '', catKey),
        warranty: '12 oy rasmiy kafolat',
        deliveryInfo: `${targetRegion} bo‘ylab yetkazish (Olcha)`,
        badges: ['Rasmiy kafolat', 'Tezkor yetkazish'],
      });
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * ⚡ Asaxiy.uz Tezkor To'g'ridan-to'g'ri Qidiruvi (~900ms)
 */
async function searchAsaxiyDirect(query: string, catKey: string, targetRegion: string): Promise<SerpProductItem[]> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 3200);
    const url = `https://asaxiy.uz/product?key=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36' },
    });
    clearTimeout(tid);
    if (!res.ok) return [];

    const html = await res.text();
    const cards = html.split('product__item d-flex flex-column justify-content-between').slice(1, 13);
    const results: SerpProductItem[] = [];

    for (const c of cards) {
      const titleM = c.match(/product__item__info-title[^>]*>([\s\S]*?)<\/span>/);
      const rawTitle = (titleM ? titleM[1].replace(/<[^>]+>/g, '') : '').trim();
      const title = rawTitle.replace(/&lsquo;|&rsquo;|&#039;/gi, '‘').replace(/&quot;/gi, '"').replace(/&amp;/gi, '&');
      if (!title) continue;
      if (!isRelevantDirectMatch(title, query, catKey)) continue;

      const priceM = c.match(/product__item-price[^>]*>([\s\S]*?)<\/span>/);
      const priceStr = priceM ? priceM[1].replace(/<[^>]+>/g, '').trim() : '';
      const priceNum = parseInt(priceStr.replace(/\D/g, ''), 10);
      if (!priceNum || priceNum < 1000) continue;

      // Real product image (skip heart/compare/cart svg icons)
      const imgM =
        c.match(/itemprop="image"[\s\S]*?src="(https?:\/\/[^"]+)"/) ||
        c.match(/src="(https?:\/\/cdn\.asaxiy\.uz\/asaxiy-content\/product\/[^"]+)"/) ||
        c.match(/data-fallback="(https?:\/\/assets\.asaxiy\.uz\/product\/[^"]+)"/);
      const img = imgM ? imgM[1] : '';
      if (!img) continue;

      const hrefM = c.match(/href="([^"]*\/product\/[^"]+)"/);
      const productUrl = hrefM
        ? (hrefM[1].startsWith('http') ? hrefM[1] : `https://asaxiy.uz${hrefM[1]}`)
        : `https://asaxiy.uz/product?key=${encodeURIComponent(title)}`;

      results.push({
        id: generateUniqueId(),
        title: title.slice(0, 95),
        price: `${priceNum.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m`,
        priceNumber: priceNum,
        source: 'Asaxiy',
        storeBadge: 'Yetkazib berish',
        link: productUrl,
        directUrl: productUrl,
        thumbnail: img,
        images: [img],
        snippet: `Asaxiy internet do‘konida mavjud. ${targetRegion} bo‘ylab yetkazib beriladi.`,
        region: targetRegion,
        keySpecs: extractKeySpecs(title, '', catKey),
        warranty: '12 oy rasmiy kafolat',
        deliveryInfo: `${targetRegion} bo‘ylab yetkazish (Asaxiy)`,
        badges: ['Yetkazib berish', 'Rasmiy kafolat'],
      });
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * 🏪 Mahalliy Sotuvchilar Bazasi (Telegram Bot orqali ro'yxatdan o'tgan sotuvchilar)
 */
async function searchLocalSellerDb(query: string, catKey: string, targetRegion: string): Promise<SerpProductItem[]> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const dbPath = path.join(process.cwd(), 'data', 'techbozor_db.json');
    if (!fs.existsSync(dbPath)) return [];

    const raw = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    const products: any[] = Array.isArray(raw.products) ? raw.products : [];
    const sellers: any[] = Array.isArray(raw.sellers) ? raw.sellers : [];
    const tokens = query.toLowerCase().split(/\s+/).filter(t => t.length >= 2);
    if (tokens.length === 0) return [];

    const results: SerpProductItem[] = [];
    for (const p of products) {
      const text = `${p.name || p.title || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase();
      if (!tokens.some(t => text.includes(t))) continue;

      const seller = sellers.find(s => s.id === p.sellerId);
      const priceNum = Number(p.price || 0);
      if (!priceNum || priceNum < 1000) continue;

      results.push({
        id: p.id || generateUniqueId(),
        title: (p.name || p.title || '').slice(0, 95),
        price: `${priceNum.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m`,
        priceNumber: priceNum,
        source: seller?.shopName || seller?.name || 'Hamkor Sotuvchi',
        storeBadge: 'Hamkor do‘kon',
        link: seller?.phone ? `tel:${seller.phone}` : '#seller',
        thumbnail: p.image || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80',
        images: p.image ? [p.image] : [],
        snippet: p.description || `${seller?.region || targetRegion} bo‘ylab tezkor yetkazib berish.`,
        region: seller?.region || targetRegion,
        keySpecs: extractKeySpecs(p.name || p.title || '', p.description, catKey),
        warranty: 'Sotuvchi kafolati',
        deliveryInfo: `${seller?.region || targetRegion} bo‘ylab yetkazish`,
        badges: ['Hamkor sotuvchi', 'Tezkor yetkazish'],
      });
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Qidiruv yordamchisi (Parallel Multi-Store Engine + 15m Memory Cache + SerpAPI Fallback)
 */
export async function searchLocalProducts(
  query: string,
  category?: string,
  region?: string
): Promise<SerpProductItem[]> {
  const cleanSearchTerm = stripRegionFromQuery(
    query.replace(/\(.*?\)/g, '').replace(/site:[\w.]+/gi, '').trim()
  );
  if (!cleanSearchTerm) return [];

  const targetRegion = region || 'Toshkent';
  const catKey = detectCategoryKey(cleanSearchTerm, category);
  const fullCacheKey = `local_v2__${cleanSearchTerm.toLowerCase()}__${targetRegion.toLowerCase()}`;

  // ⚡ 0ms Memory Cache
  const cached = searchMemoryCache.get(fullCacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 1-QADAM: MaxProfit + Olcha + Asaxiy + LocalSellerDB PARALLEL ravishda (~0.7 - 1.5s)
  const [mpRes, olchaRes, asaxiyRes, sellerRes] = await Promise.allSettled([
    searchMaxProfit(cleanSearchTerm, category, targetRegion),
    searchOlchaDirect(cleanSearchTerm, catKey, targetRegion),
    searchAsaxiyDirect(cleanSearchTerm, catKey, targetRegion),
    searchLocalSellerDb(cleanSearchTerm, catKey, targetRegion),
  ]);

  const mpItems = mpRes.status === 'fulfilled' ? mpRes.value : [];
  const olchaItems = olchaRes.status === 'fulfilled' ? olchaRes.value : [];
  const asaxiyItems = asaxiyRes.status === 'fulfilled' ? asaxiyRes.value : [];
  const sellerItems = sellerRes.status === 'fulfilled' ? sellerRes.value : [];

  let combined: SerpProductItem[] = [];
  const seen = new Set<string>();
  const addItems = (list: SerpProductItem[]) => {
    for (const item of list) {
      const k = `${item.title.toLowerCase()}__${item.source.toLowerCase()}`;
      if (!seen.has(k)) {
        seen.add(k);
        combined.push(item);
      }
    }
  };

  addItems(sellerItems);
  addItems(mpItems);
  addItems(olchaItems);
  addItems(asaxiyItems);

  // 2-QADAM: Agar tezkor parallel manbalardan 3 tadan kam topilsa YOKI faqat 1 ta do'kondan chiqsa,
  // boshqa do'konlarni ham qo'shish uchun SerpAPI (Uzum, Yandex Market, Texnomart, Olcha, ...) ni ishga tushiramiz
  const uniqueStores = new Set(combined.map(i => i.source)).size;
  if (combined.length < 3 || uniqueStores < 2) {
    const isDish = isDishwareQuery(cleanSearchTerm, category) || catKey === 'chinni_idishlar' || catKey === 'oshxona_anjomlari';
    let expandedQuery = cleanSearchTerm;
    if (!expandedQuery.toLowerCase().includes('.uz') && !expandedQuery.toLowerCase().includes('site:')) {
      let domains: string[] = [];
      if (isDish || catKey === 'oshxona_anjomlari') {
        domains = ['uzum.uz', 'olcha.uz', 'asaxiy.uz', 'texnomart.uz', 'home24.uz'];
      } else if (catKey === 'apparel' || catKey === 'kurtka') {
        domains = ['uzum.uz', 'market.yandex.uz', 'terrapro.uz', 'sportmaster.uz', 'extremal-shop.uz', 'olcha.uz'];
      } else if (catKey === 'materials') {
        domains = ['uzum.uz', 'stroycenter.uz', 'dombrabotnik.uz', 'mebel.uz', 'home24.uz', 'karcher.uz'];
      } else if (catKey === 'auto') {
        domains = ['uzum.uz', 'autotuning.uz', 'shina.uz', 'avtoelon.uz'];
      } else {
        domains = ['uzum.uz', 'market.yandex.uz', 'texnomart.uz', 'mediapark.uz', 'ishonch.uz', 'olcha.uz', 'asaxiy.uz', 'alifshop.uz'];
      }
      const sitesPart = domains.join(' OR ');
      expandedQuery = `${cleanSearchTerm} (${sitesPart})`;
    }

    const serpProducts = await fetchAndEnrichStores(expandedQuery, category, targetRegion, cleanSearchTerm);
    addItems(serpProducts);
  }

  if (combined.length > 0) {
    // Do'konlar bo'yicha aralashtirish (Round-Robin): bitta do'kon mahsulotlari ketma-ket tiqilib qolmasligi uchun
    const byStore = new Map<string, SerpProductItem[]>();
    for (const item of combined) {
      const st = item.source || 'Boshqa';
      if (!byStore.has(st)) byStore.set(st, []);
      byStore.get(st)!.push(item);
    }
    for (const list of Array.from(byStore.values())) {
      list.sort((a, b) => (a.priceNumber || 999999999) - (b.priceNumber || 999999999));
    }
    const queues = Array.from(byStore.values()).sort(
      (a, b) => (a[0]?.priceNumber || 999999999) - (b[0]?.priceNumber || 999999999)
    );
    const mixed: SerpProductItem[] = [];
    let round = 0;
    while (mixed.length < 24) {
      let added = false;
      for (const q of queues) {
        if (round < q.length && mixed.length < 24) {
          mixed.push(q[round]);
          added = true;
        }
      }
      if (!added) break;
      round++;
    }
    combined = mixed;

    // Agar MaxProfit metadata bo'lsa saqlab qolish
    if ((mpItems as any).priceInsight) (combined as any).priceInsight = (mpItems as any).priceInsight;
    if ((mpItems as any).bestBanner) (combined as any).bestBanner = (mpItems as any).bestBanner;
    (combined as any).totalResultsCount = (mpItems as any).totalResultsCount || combined.length;

    searchMemoryCache.set(fullCacheKey, {
      data: combined,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });
  }

  return combined;
}
