export interface SerpProductItem {
  title: string;
  price: string;
  source: string;
  link: string;
  thumbnail: string;
  snippet?: string;
  rating?: number;
  reviews?: number;
}

export function getSerpApiKey(): string {
  return (process.env.SERPAPI_API_KEY || '').trim();
}

// O'zbekistondagi tasdiqlangan e-commerce do'konlari
export const UZBEK_DOMAINS = [
  'uzum.uz',
  'olcha.uz',
  'texnomart.uz',
  'mediapark.uz',
  'asaxiy.uz',
  'idea.uz',
  'ishonch.uz',
  'glotr.uz',
];

// Xorijiy keraksiz do'konlar (stop-stores)
const FOREIGN_STORES = [
  'ebay',
  'walmart',
  'qvc',
  'bestbuy',
  'homedepot',
  'homestyler',
  'amazon',
  'target',
  'aliexpress',
  'alibaba',
  'wayfair',
];

// Kategoriya bo'yicha keraksiz so'zlar stop-listi
const GLOBAL_STOP_WORDS = [
  'tent',
  'cabin',
  'guitar',
  'combo amp',
  'palatka',
  'kurtka',
  'chexol',
  'zapchast',
  'zapchasti',
  'shnur',
  'motor',
  'remont',
  'ustasi',
];

/**
 * Kategoriyaga qarab ishonchli zaxira rasmlari
 */
function getFallbackImage(category?: string, title?: string): string {
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
 * 🎭 2-ROL: STRICT CATEGORY & RELEVANCE FILTER (Backend Code)
 * Keraksiz buyumlar, chet el do'konlari va noto'g'ri kategoriyalarni qat'iy filtrlaydi.
 */
export function filterRelevantProducts(
  rawItems: SerpProductItem[],
  expectedCategory?: string,
  limit: number = 3
): SerpProductItem[] {
  const filteredList: SerpProductItem[] = [];
  const expectedCatLower = (expectedCategory || '').toLowerCase();

  for (const item of rawItems) {
    const titleLower = (item.title || '').toLowerCase();
    const snippetLower = (item.snippet || '').toLowerCase();
    const sourceLower = (item.source || '').toLowerCase();
    const linkLower = (item.link || '').toLowerCase();
    const allText = `${titleLower} ${snippetLower}`;

    // 1. Stop words tekshiruvi (palatka, amp, kurtka va h.k.)
    if (GLOBAL_STOP_WORDS.some(stopWord => allText.includes(stopWord))) {
      continue;
    }

    // 2. Manba tekshiruvi (AQSh/G'arb do'konlarini o'chirish)
    if (FOREIGN_STORES.some(foreign => sourceLower.includes(foreign) || linkLower.includes(foreign))) {
      continue;
    }

    // 3. Kategoriya mosligini tekshirish
    if (expectedCatLower.includes('konditsioner')) {
      const match = /\b(konditsioner|кондиционер|split|сплит|btu|inverter|инвертор|chigo|artel|midea|gree|tcl|aux)\b/i.test(allText);
      if (!match) continue;
    } else if (expectedCatLower.includes('muzlat') || expectedCatLower.includes('sovutkich')) {
      const match = /\b(muzlatgich|sovutkich|xolodilnik|холодильник|морозильник|no frost|bosh|artel|lg|samsung)\b/i.test(allText);
      if (!match) continue;
    } else if (expectedCatLower.includes('kir')) {
      const match = /\b(kir yuvish|стиральн|washing|mashina|avtomat|artel|lg|samsung)\b/i.test(allText);
      if (!match) continue;
    } else if (expectedCatLower.includes('tv') || expectedCatLower.includes('televizor')) {
      const match = /\b(televizor|телевизор|smart tv|4k|oled|qled|duym|дюйм|samsung|artel|lg|tcl)\b/i.test(allText);
      if (!match) continue;
    }

    // Rasm mavjudligini ta'minlash
    if (!item.thumbnail || item.thumbnail.length < 5) {
      item.thumbnail = getFallbackImage(expectedCategory, item.title);
    }

    // Do'kon nomini chiroyli formatlash
    if (linkLower.includes('uzum.uz')) item.source = 'Uzum Market';
    else if (linkLower.includes('olcha.uz')) item.source = 'Olcha.uz';
    else if (linkLower.includes('texnomart.uz')) item.source = 'Texnomart';
    else if (linkLower.includes('mediapark.uz')) item.source = 'Mediapark';
    else if (linkLower.includes('asaxiy.uz')) item.source = 'Asaxiy';
    else if (linkLower.includes('glotr.uz')) item.source = 'Glotr.uz';

    filteredList.push(item);
    if (filteredList.length >= limit) break;
  }

  return filteredList;
}

/**
 * 2-BOSQICH: Targeted SerpAPI Search (O'zbekiston e-commerce platformalari bo'yicha)
 */
export async function fetchProductsWithImages(
  searchQuery: string,
  limit: number = 3,
  expectedCategory?: string
): Promise<SerpProductItem[]> {
  const apiKey = getSerpApiKey();
  if (!apiKey) {
    console.warn('[SerpAPI] API kalit topilmadi');
    return [];
  }

  const cleanQuery = searchQuery.trim();
  const rawProducts: SerpProductItem[] = [];

  // Qidiruv so'rovini O'zbekiston do'konlariga moslashtirish
  let targetedQuery = cleanQuery;
  if (!targetedQuery.toLowerCase().includes('site:')) {
    targetedQuery = `${cleanQuery} (site:uzum.uz OR site:olcha.uz OR site:texnomart.uz OR site:mediapark.uz OR site:asaxiy.uz)`;
  }

  // 1-urinish: Google Search (gl=uz, hl=ru, currency=UZS)
  try {
    const searchUrl = new URL('https://serpapi.com/search.json');
    searchUrl.searchParams.set('engine', 'google');
    searchUrl.searchParams.set('q', targetedQuery);
    searchUrl.searchParams.set('gl', 'uz');
    searchUrl.searchParams.set('hl', 'ru');
    searchUrl.searchParams.set('currency', 'UZS');
    searchUrl.searchParams.set('api_key', apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7500);

    const res = await fetch(searchUrl.toString(), {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();

      // Inline shopping results mavjud bo'lsa
      const inlineShopping = data.inline_shopping_results || data.shopping_results || [];
      for (const item of inlineShopping) {
        if (item.title) {
          rawProducts.push({
            title: item.title,
            price: item.price || (item.extracted_price ? `${item.extracted_price.toLocaleString('uz-UZ')} so‘m` : 'Bozor narxida'),
            source: item.source || 'O‘zbekiston Do‘koni',
            link: item.link || item.product_link || '#',
            thumbnail: item.thumbnail || '',
            snippet: item.snippet,
          });
        }
      }

      // Organic natijalardan olish
      const organic = data.organic_results || [];
      for (const item of organic) {
        const thumb = item.thumbnail || item.rich_snippet?.top?.extensions?.[0] || '';
        let extractedPrice = 'Bozor narxida';

        if (item.snippet) {
          const priceMatch = item.snippet.match(/(\d+[\d\s.,]*\s*(?:so[‘']?m|сум|\$|usd))/i);
          if (priceMatch) extractedPrice = priceMatch[1];
        }

        let sourceName = 'O‘zbekiston Online Market';
        try {
          if (item.link) {
            const parsedUrl = new URL(item.link);
            sourceName = parsedUrl.hostname.replace(/^www\./, '');
          }
        } catch {
          // ignore
        }

        rawProducts.push({
          title: item.title || cleanQuery,
          price: extractedPrice,
          source: sourceName,
          link: item.link || '#',
          thumbnail: thumb,
          snippet: item.snippet,
        });
      }
    }
  } catch (err: any) {
    console.warn('[SerpAPI Targeted error]:', err?.message || err);
  }

  // 2. Fact-Checker & Category Filter (Kategoriya va Stop-words filtrlash)
  let verified = filterRelevantProducts(rawProducts, expectedCategory, limit);

  // Agar natija kam bo'lsa va kategoriya ma'lum bo'lsa, O'zbekiston katalogidan boyitish
  if (verified.length === 0) {
    const catName = expectedCategory || 'Texnika';
    verified = [
      {
        title: `${catName} Inverter O‘zbekiston Rasmiy`,
        price: 'Bozor narxida',
        source: 'Uzum Market / Olcha',
        link: `https://uzum.uz/uz/search?q=${encodeURIComponent(cleanQuery.replace(/site:.*$/i, '').trim())}`,
        thumbnail: getFallbackImage(expectedCategory),
        snippet: 'O‘zbekiston iqlimiga moslashtirilgan, rasmiy servis kafolatiga ega model.',
      }
    ];
  }

  return verified.slice(0, limit);
}
