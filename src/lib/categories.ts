import { CategoryInfo, CategoryKey } from "@/types";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'tv',
    name: 'Televizor',
    iconName: 'Tv',
    description: 'Smart TV, 4K UHD, OLED, QLED',
    filters: [
      {
        id: 'diagonal',
        label: 'Diagonali',
        type: 'select',
        options: ['Hammasi', '32"', '43"', '50"', '55"', '65"', '75"', '85"+'],
      },
      {
        id: 'smartTv',
        label: 'Smart TV',
        type: 'select',
        options: ['Hammasi', 'Android / Google TV', 'Samsung Tizen', 'LG webOS', 'Smart shart emas'],
      },
      {
        id: 'screenType',
        label: 'Ekran',
        type: 'select',
        options: ['Hammasi', '4K UHD', 'Full HD', 'QLED', 'OLED'],
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
    description: 'NoFrost, ikki kamerali va Side-by-Side',
    filters: [
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'No Frost (Muzlamas)', 'Ikki kamerali De-Frost', 'Side-by-Side (Katta)', 'Mini sovutkich'],
      },
      {
        id: 'volume',
        label: 'Hajmi',
        type: 'select',
        options: ['Hammasi', '200-260 litr', '270-360 litr', '370-500 litr', '500+ litr'],
      },
      {
        id: 'compressor',
        label: 'Kompressor',
        type: 'select',
        options: ['Hammasi', 'Inverter (10 yil kafolat)', 'Standart'],
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
    name: 'Kir yuvish',
    iconName: 'Shirt',
    description: 'Avtomat, Inverter va quritgichli',
    filters: [
      {
        id: 'capacity',
        label: 'Sig‘imi',
        type: 'select',
        options: ['Hammasi', '6 kg', '7 kg', '8 kg', '9-10 kg', '10.5+ kg'],
      },
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'Frontal avtomat', 'Bug‘da yuvish (Steam)', 'Quritgichli (2-in-1)', 'Yarim avtomat'],
      },
      {
        id: 'motor',
        label: 'Dvigatel',
        type: 'select',
        options: ['Hammasi', 'Inverter Direct Drive', 'Standart motor'],
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
    description: 'Inverter, qish-yoz split tizimlar',
    filters: [
      {
        id: 'capacity',
        label: 'Maydoni',
        type: 'select',
        options: ['Hammasi', '09 BTU (20-25 m²)', '12 BTU (30-35 m²)', '18 BTU (45-55 m²)', '24 BTU (65-75 m²)', 'Kolonna (100+ m²)'],
      },
      {
        id: 'inverter',
        label: 'Kompressor',
        type: 'select',
        options: ['Hammasi', 'Inverter A++ (Tejamkor)', 'Oddiy On/Off'],
      },
      {
        id: 'winterMode',
        label: 'Qishki rejim',
        type: 'select',
        options: ['Hammasi', '-15°C gacha isitish', '-25°C gacha (Qishda ham)', 'Standart'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Artel', 'Shivaki', 'Midea', 'Gree', 'Aux', 'Samsung'],
      },
    ],
  },
  {
    id: 'vacuum',
    name: 'Changyutkich',
    iconName: 'Sparkles',
    description: 'Simsiz, robot va konteynerli',
    filters: [
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'Simsiz vertikal (Akkumulyatorli)', 'Robot changyutkich', 'Konteynerli siklon (Qopsiz)', 'Yuvuvchi / Suv filtrli'],
      },
      {
        id: 'power',
        label: 'So‘rish quvvati',
        type: 'select',
        options: ['Hammasi', '350-400 Vt', '420-450 Vt', '500+ Vt (Kuchli)'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Samsung', 'Philips', 'Xiaomi', 'Artel', 'Dyson', 'Bosch'],
      },
    ],
  },
  {
    id: 'stove',
    name: 'Plita & Duxovka',
    iconName: 'Flame',
    description: 'Gaz, elektr va induksion plitalar',
    filters: [
      {
        id: 'type',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'Kombinatsiyalangan (Gaz+Elektr)', 'Gaz plita', 'Elektr / Induksion panel', 'Vstraivayemaya duxovka'],
      },
      {
        id: 'burners',
        label: 'Konforkalar',
        type: 'select',
        options: ['Hammasi', '4 konforka', '5 konforka (WOK)', '2-3 konforka'],
      },
      {
        id: 'oven',
        label: 'Duxovkasi',
        type: 'select',
        options: ['Hammasi', 'Elektr konveksiya bilan', 'Gaz duxovka'],
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
    name: 'Mikroto‘lqinli',
    iconName: 'Utensils',
    description: 'Mikroto‘lqinli va mini-pechlar',
    filters: [
      {
        id: 'type',
        label: 'Vazifasi',
        type: 'select',
        options: ['Hammasi', 'Solo (Isitish va eritish)', 'Grill bilan', 'Konveksiyali', 'Mini-pech elektr duxovka'],
      },
      {
        id: 'volume',
        label: 'Hajmi',
        type: 'select',
        options: ['Hammasi', '20-23 litr', '25-30 litr', '35+ litr'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Samsung', 'LG', 'Artel', 'Midea', 'Panasonic'],
      },
    ],
  },
  {
    id: 'phone',
    name: 'Smartfon & Gadjetlar',
    iconName: 'Smartphone',
    description: 'Smartfonlar, planshet va aksessuarlar',
    filters: [
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Apple iPhone', 'Samsung', 'Xiaomi / Redmi', 'Honor', 'Tecno', 'Infinix', 'Boshqa'],
      },
      {
        id: 'storage',
        label: 'Xotirasi',
        type: 'select',
        options: ['Hammasi', '64 GB', '128 GB', '256 GB', '512 GB', '1 TB'],
      },
      {
        id: 'condition',
        label: 'Holati',
        type: 'select',
        options: ['Hammasi', 'Yangi (Qadoqda)', 'Ideal holatda', 'Ishlatilgan (b/u)'],
      },
    ],
  },
  {
    id: 'laptop',
    name: 'Noutbuk & Kompyuter',
    iconName: 'Laptop',
    description: 'O‘qish, ish va o‘yin noutbuklari',
    filters: [
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Lenovo', 'HP', 'Asus', 'Acer', 'Apple MacBook', 'Dell'],
      },
      {
        id: 'cpu',
        label: 'Protsessor',
        type: 'select',
        options: ['Hammasi', 'Intel Core i3', 'Intel Core i5', 'Intel Core i7 / i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M-series'],
      },
      {
        id: 'purpose',
        label: 'Yo‘nalishi',
        type: 'select',
        options: ['Hammasi', 'Ofis & O‘qish', 'Gaming (Kuchli o‘yin)', 'Grafika & Dasturlash', 'Ultrabuk'],
      },
    ],
  },
  {
    id: 'auto',
    name: 'Avto ehtiyot qismlar',
    iconName: 'Package',
    description: 'Akkumulyator, moylar, shina va detallar',
    filters: [
      {
        id: 'carModel',
        label: 'Avtomobil',
        type: 'select',
        options: ['Hammasi', 'Cobalt', 'Gentra / Lacetti', 'Nexia 3', 'Tracker / Onix', 'Malibu', 'Damas / Labo', 'BYD / Chery', 'Boshqa'],
      },
      {
        id: 'partType',
        label: 'Qism turi',
        type: 'select',
        options: ['Hammasi', 'Akkumulyator', 'Moy & Filtrlar', 'Shinalar & Disklar', 'Tormoz tizimi', 'Xodovoy & Podveska', 'Elektronika'],
      },
      {
        id: 'condition',
        label: 'Holati',
        type: 'select',
        options: ['Hammasi', 'Yangi original', 'Yangi dublikat', 'Ideal ishlatilgan'],
      },
    ],
  },
  {
    id: 'build',
    name: 'Qurilish & Ta’mirlash',
    iconName: 'Layers',
    description: 'Santexnika, elektr, bo‘yoq va qoplama',
    filters: [
      {
        id: 'subType',
        label: 'Mahsulot turi',
        type: 'select',
        options: ['Hammasi', 'Santexnika & Quvurlar', 'Elektr & Kabellar', 'Kafel & Qoplamalar', 'Bo‘yoq & Suvoq', 'Tom va fasad', 'Metall prokat'],
      },
      {
        id: 'origin',
        label: 'Ishlab chiqaruvchi',
        type: 'select',
        options: ['Hammasi', 'Mahalliy (O‘zbekiston)', 'Rossiya', 'Turkiya', 'Xitoy', 'Yevropa'],
      },
    ],
  },
  {
    id: 'furniture',
    name: 'Mebel & Jihozlar',
    iconName: 'Layers',
    description: 'Oshxona, yotoqxona va ofis mebellari',
    filters: [
      {
        id: 'category',
        label: 'Turi',
        type: 'select',
        options: ['Hammasi', 'Yumshoq mebel (Divan-kreslo)', 'Oshxona garnituri', 'Yotoqxona mebeli', 'Stol & Stullar', 'Ofis mebeli'],
      },
      {
        id: 'material',
        label: 'Materiali',
        type: 'select',
        options: ['Hammasi', 'Laminat (DSP/MDF)', 'Tabiiy yog‘och', 'Metall karkas', 'Mato & Terisi'],
      },
    ],
  },
  {
    id: 'clothes',
    name: 'Kiyim & Poyabzal',
    iconName: 'Shirt',
    description: 'Erkaklar, ayollar va bolalar kiyimlari',
    filters: [
      {
        id: 'target',
        label: 'Kim uchun',
        type: 'select',
        options: ['Hammasi', 'Erkaklar uchun', 'Ayollar uchun', 'Bolalar uchun', 'Uniseks'],
      },
      {
        id: 'season',
        label: 'Mavsum',
        type: 'select',
        options: ['Hammasi', 'Bahor-Yoz', 'Kuz-Qish', 'Barcha mavsumiy'],
      },
    ],
  },
  {
    id: 'tools',
    name: 'Asbob-uskunalar',
    iconName: 'Zap',
    description: 'Drel, bolgarka, payvandlash, generator',
    filters: [
      {
        id: 'toolType',
        label: 'Asbob turi',
        type: 'select',
        options: ['Hammasi', 'Elektr asboblar (Drel, Perforator)', 'Akkumulyatorli asboblar', 'Payvandlash apparatlari (Svarka)', 'Generatorlar', 'Qo‘l asboblari'],
      },
      {
        id: 'brand',
        label: 'Brend',
        type: 'select',
        options: ['Hammasi', 'Bosch', 'DeWalt', 'Makita', 'Crown', 'Ingco', 'Total'],
      },
    ],
  },
  {
    id: 'other',
    name: 'Boshqa barcha tovarlar',
    iconName: 'Package',
    description: 'Istalgan turdagi tovar va mahsulotlar',
    filters: [
      {
        id: 'condition',
        label: 'Holati',
        type: 'select',
        options: ['Hammasi', 'Yangi', 'Ishlatilgan (Ideal)', 'Ishlatilgan (O‘rtacha)'],
      },
      {
        id: 'delivery',
        label: 'Yetkazib berish',
        type: 'select',
        options: ['Hammasi', 'Yetkazib berish mavjud', 'Olib ketish (Samovivoz)'],
      },
    ],
  },
];

export function getCategoryById(id: CategoryKey | string): CategoryInfo | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
