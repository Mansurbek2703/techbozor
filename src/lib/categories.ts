import { CategoryInfo, CategoryKey } from "@/types";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'tv',
    name: 'Televizor',
    iconName: 'Tv',
    description: 'Smart TV, 4K UHD, OLED, QLED televizorlar',
    filters: [
      {
        id: 'diagonal',
        label: 'Ekran diagonali',
        type: 'select',
        options: ['Hammasi', '32"', '43"', '50"', '55"', '65"', '75"', '85"+'],
      },
      {
        id: 'smartTv',
        label: 'Smart TV',
        type: 'select',
        options: ['Hammasi', 'Mavjud (Android/Google TV/Tizen)', 'Kerak emas'],
      },
      {
        id: 'screenType',
        label: 'Ekran turi',
        type: 'select',
        options: ['Hammasi', 'LED / LCD', 'QLED', 'OLED', 'Mini-LED'],
      },
      {
        id: 'resolution',
        label: 'Aniqlik (Resolution)',
        type: 'select',
        options: ['Hammasi', '4K UHD (3840x2160)', 'Full HD (1080p)', 'HD (720p)', '8K'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Samsung', 'LG', 'Artel', 'Shivaki', 'Xiaomi', 'TCL', 'Sony'],
      },
    ],
  },
  {
    id: 'fridge',
    name: 'Sovutkich',
    iconName: 'Refrigerator',
    description: 'NoFrost, ikki kamerali va Side-by-Side sovutkichlar',
    filters: [
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'No Frost (Muzlamas)', 'De Frost / Statik', 'Side-by-Side (Katta)'],
      },
      {
        id: 'volume',
        label: 'Umumiy hajmi',
        type: 'select',
        options: ['Hammasi', '200-250 litr', '260-350 litr', '360-500 litr', '500+ litr'],
      },
      {
        id: 'energyClass',
        label: 'Energiya samaradorligi',
        type: 'select',
        options: ['Hammasi', 'A+++', 'A++', 'A+', 'A'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Artel', 'Samsung', 'LG', 'Beko', 'Hofmann', 'Bosch', 'Shivaki'],
      },
    ],
  },
  {
    id: 'washing',
    name: 'Kir yuvish mashinasi',
    iconName: 'Shirt',
    description: 'Avtomat, Inverter motor va quritgichli mashinalar',
    filters: [
      {
        id: 'capacity',
        label: 'Sig‘im (kg)',
        type: 'select',
        options: ['Hammasi', '6 kg', '7 kg', '8 kg', '9 kg', '10.5+ kg'],
      },
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'Frontal avtomat', 'Vertikal yuklash', 'Yarim avtomat'],
      },
      {
        id: 'motor',
        label: 'Dvigatel turi',
        type: 'select',
        options: ['Hammasi', 'Inverter Direct Drive (Jimgina)', 'Standart'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'LG', 'Samsung', 'Artel', 'Bosch', 'Beko', 'Haier'],
      },
    ],
  },
  {
    id: 'ac',
    name: 'Konditsioner',
    iconName: 'Wind',
    description: 'Inverter, qish-yoz rejimli split tizimlar',
    filters: [
      {
        id: 'capacity',
        label: 'Quvvati va Maydon',
        type: 'select',
        options: ['Hammasi', '09 BTU (20-25 m²)', '12 BTU (30-35 m²)', '18 BTU (45-55 m²)', '24 BTU (65-75 m²)'],
      },
      {
        id: 'inverter',
        label: 'Inverter kompressor',
        type: 'select',
        options: ['Hammasi', 'Ha (Tejamkor va jim)', 'Yo‘q (On/Off oddiy)'],
      },
      {
        id: 'winterMode',
        label: 'Qishki isitish',
        type: 'select',
        options: ['Hammasi', '-15°C gacha', '-25°C gacha (Qishda ham)', 'Standart'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Artel', 'Shivaki', 'Midea', 'Gree', 'Aux', 'Samsung', 'LG'],
      },
    ],
  },
  {
    id: 'vacuum',
    name: 'Changyutkich',
    iconName: 'Sparkles',
    description: 'Konteynerli, qopli, simsiz va robot changyutkichlar',
    filters: [
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'Konteynerli (Siklon)', 'Simsiz vertikal (Akkumulyatorli)', 'Robot changyutkich', 'Qopli (Klassik)'],
      },
      {
        id: 'power',
        label: 'So‘rish quvvati',
        type: 'select',
        options: ['Hammasi', '350-400 Vt', '420-450 Vt', '500+ Vt'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Samsung', 'Philips', 'Artel', 'Xiaomi', 'Dyson', 'Bosch'],
      },
    ],
  },
  {
    id: 'stove',
    name: 'Gaz va elektr plita',
    iconName: 'Flame',
    description: 'Gaz, elektr va kombinatsiyalangan oshxona plitalari',
    filters: [
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'To‘liq gaz plita', 'Kombinatsiyalangan (Gaz + Elektr)', 'Elektr plita / Induksion'],
      },
      {
        id: 'burners',
        label: 'Konforkalar soni',
        type: 'select',
        options: ['Hammasi', '4 konforka (Standart)', '5 konforka (Katta wok)', '2-3 konforka'],
      },
      {
        id: 'oven',
        label: 'Duxovka turi',
        type: 'select',
        options: ['Hammasi', 'Elektr duxovka (Konveksiya)', 'Gaz duxovka'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Artel', 'Shivaki', 'Gefest', 'Beko', 'Hofmann'],
      },
    ],
  },
  {
    id: 'microwave',
    name: 'Mikroto‘lqinli pech',
    iconName: 'Utensils',
    description: 'Solo, Grilli va Konveksiyali mikroto‘lqinli pechlar',
    filters: [
      {
        id: 'volume',
        label: 'Hajmi',
        type: 'select',
        options: ['Hammasi', '20 litr', '23 litr', '25+ litr'],
      },
      {
        id: 'type',
        label: 'Funksiyasi',
        type: 'select',
        options: ['Hammasi', 'Solo (Isitish va eritish)', 'Grill bilan', 'Konveksiya (Pishiriqlar)'],
      },
      {
        id: 'control',
        label: 'Boshqaruv',
        type: 'select',
        options: ['Hammasi', 'Sensor / Elektron', 'Mexanik (Aylanma)'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Samsung', 'LG', 'Artel', 'Midea', 'Panasonic'],
      },
    ],
  },
];

export function getCategoryById(id: CategoryKey | string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
