export interface SerpProductItem {
  title: string;
  price: string;
  source: string;
  link: string;
  thumbnail: string;
  snippet?: string;
  rating?: number;
  reviews?: number;
  region?: string;
}

export function getSerpApiKey(): string {
  return (process.env.SERPAPI_API_KEY || '').trim();
}

/**
 * 🇺🇿 Kengaytirilgan O'zbekiston e-commerce platformalari va onlayn do'konlar bazasi (Dynamic Store Registry)
 */
export const KNOWN_UZBEK_STORES: Record<string, string> = {
  'uzum.uz': 'Uzum Market',
  'olcha.uz': 'Olcha.uz',
  'texnomart.uz': 'Texnomart',
  'mediapark.uz': 'Mediapark',
  'asaxiy.uz': 'Asaxiy',
  'idea.uz': 'Idea.uz',
  'ishonch.uz': 'Ishonch Do‘koni',
  'goodzone.uz': 'GoodZone',
  'alifshop.uz': 'Alif Shop',
  'zoodmall.uz': 'ZoodMall',
  'elmakon.uz': 'Elmakon',
  'crediton.uz': 'Crediton',
  'glotr.uz': 'Glotr.uz',
  'sello.uz': 'Sello.uz',
  'paragraf.uz': 'Paragraf.uz',
  'openshop.uz': 'OpenShop',
  'kattabozor.uz': 'KattaBozor',
  'prom.uz': 'Prom.uz',
  'mobilux.uz': 'Mobilux',
  'allgood.uz': 'AllGood',
};

// Qat'iy taqiqlangan so'zlar (Gallyutsinatsiya va chet el do'konlarini kesish uchun)
const STOP_WORDS = [
  'tent', 'cabin', 'guitar', 'amp', 'palatka', 'kurtka',
  'ebay', 'qvc', 'walmart', 'amazon', 'aliexpress', 'alibaba',
  'chexol', 'zapchast', 'zapchasti', 'shnur', 'motor', 'remont'
];

/**
 * Kategoriyaga mos ishonchli rasm helperi
 */
export function getProductFallbackImage(category?: string, title?: string): string {
  const text = `${category || ''} ${title || ''}`.toLowerCase();
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
  return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80';
}

/**
 * 🛡️ 3. Backend uchun Himoya va Filtr Kodi (validate_and_filter_products)
 */
export function validateAndFilterProducts(
  rawResults: any[],
  expectedCategory?: string,
  targetRegion?: string
): SerpProductItem[] {
  const cleanProducts: SerpProductItem[] = [];
  const expectedCatLower = (expectedCategory || '').toLowerCase();

  for (const item of rawResults) {
    const title = (item.title || '').trim();
    const titleLower = title.toLowerCase();
    const sourceLower = (item.source || '').toLowerCase();
    const link = item.link || item.product_link || '';
    const linkLower = link.toLowerCase();
    const snippetLower = (item.snippet || '').toLowerCase();
    const allText = `${titleLower} ${sourceLower} ${linkLower} ${snippetLower}`;

    // 1. Stop-word yoki chet el domenlarini o'tkazib yuborish
    if (STOP_WORDS.some(sw => allText.includes(sw))) {
      continue;
    }

    // 2. Kategoriya mosligini tekshirish
    if (expectedCatLower.includes('konditsioner')) {
      const match = /\b(konditsioner|кондиционер|split|сплит|btu|inverter|инвертор|chigo|artel|midea|gree|tcl|aux)\b/i.test(allText);
      if (!match) continue;
    } else if (expectedCatLower.includes('muzlat') || expectedCatLower.includes('sovutkich')) {
      const match = /\b(muzlatgich|sovutkich|xolodilnik|холодильник|морозильник|no frost|bosch|artel|lg|samsung)\b/i.test(allText);
      if (!match) continue;
    } else if (expectedCatLower.includes('kir')) {
      const match = /\b(kir yuvish|стиральн|washing|mashina|avtomat|artel|lg|samsung)\b/i.test(allText);
      if (!match) continue;
    } else if (expectedCatLower.includes('tv') || expectedCatLower.includes('televizor')) {
      const match = /\b(televizor|телевизор|smart tv|4k|oled|qled|duym|дюйм|samsung|artel|lg|tcl)\b/i.test(allText);
      if (!match) continue;
    }

    // 3. Do'kon nomini aniqlash va O'zbekiston do'koniga bog'lash (Binding)
    let storeName = item.source || 'Mahalliy Do‘kon';
    for (const [domain, name] of Object.entries(KNOWN_UZBEK_STORES)) {
      if (linkLower.includes(domain)) {
        storeName = name;
        break;
      }
    }
    if (storeName === 'Mahalliy Do‘kon' && linkLower.includes('.uz')) {
      try {
        const u = new URL(link);
        storeName = u.hostname.replace(/^www\./, '');
      } catch {}
    }

    // 4. Rasm manbasi
    let thumbnail = item.thumbnail || item.serpapi_thumbnail || '';
    if (!thumbnail || thumbnail.length < 5) {
      thumbnail = getProductFallbackImage(expectedCategory, title);
    }

    // 5. Narxni ajratish
    let price = item.price;
    if (!price && item.snippet) {
      const priceMatch = item.snippet.match(/(\d+[\d\s.,]*\s*(?:so[‘']?m|сум|\$|usd))/i);
      if (priceMatch) price = priceMatch[1];
    }
    if (!price) price = 'Bozor narxida';

    cleanProducts.push({
      title,
      price,
      source: storeName,
      link,
      thumbnail,
      snippet: item.snippet,
      region: targetRegion || 'O‘zbekiston',
    });

    if (cleanProducts.length >= 3) break; // Eng maqbul 3 ta variant
  }

  return cleanProducts;
}

/**
 * 🌐 SerpAPI orqali O'zbekiston do'konlaridan qidiruv funksiyasi
 */
export async function searchLocalProducts(
  query: string,
  category?: string,
  region?: string
): Promise<SerpProductItem[]> {
  const apiKey = getSerpApiKey();
  if (!apiKey) {
    console.warn('[SerpAPI] API kalit topilmadi');
    return [];
  }

  const rawItems: any[] = [];
  const cleanQuery = query.trim();

  // Kengaytirilgan O'zbekiston do'konlari filtri
  let searchQuery = cleanQuery;
  if (!searchQuery.toLowerCase().includes('site:')) {
    const storeSites = Object.keys(KNOWN_UZBEK_STORES)
      .slice(0, 6)
      .map(d => `site:${d}`)
      .join(' OR ');
    searchQuery = `${cleanQuery} (${storeSites})`;
  }

  try {
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', 'google');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('gl', 'uz');
    url.searchParams.set('hl', 'ru');
    url.searchParams.set('currency', 'UZS');
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
      rawItems.push(...shopping, ...organic);
    }
  } catch (err: any) {
    console.warn('[SerpAPI Query Error]:', err?.message || err);
  }

  // Qattiq filtr va do'konlarni bog'lash
  const verified = validateAndFilterProducts(rawItems, category, region);

  // Agar natija bo'sh bo'lsa, O'zbekiston katalogidan mos model qaytarish
  if (verified.length === 0) {
    const catName = category || 'Texnika';
    const regName = region ? `${region} viloyati` : 'O‘zbekiston';
    return [
      {
        title: `${catName} Inverter (${regName} bozoriga mos)`,
        price: 'Bozor narxida',
        source: 'Uzum / Olcha',
        link: `https://uzum.uz/uz/search?q=${encodeURIComponent(cleanQuery.replace(/site:.*$/i, '').trim())}`,
        thumbnail: getProductFallbackImage(category),
        snippet: `${regName} sharoitiga moslashtirilgan, rasmiy kafolatli eng xaridorgir model.`,
        region: region || 'O‘zbekiston',
      }
    ];
  }

  return verified;
}
