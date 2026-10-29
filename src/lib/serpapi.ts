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

/**
 * SerpAPI orqali mahsulotlarni, toza rasmlari (thumbnail), narxlari,
 * do'kon manbasi va xarid linklari bilan tortib oluvchi asosiy funksiya.
 */
export async function fetchProductsWithImages(searchQuery: string, limit: number = 4): Promise<SerpProductItem[]> {
  const apiKey = getSerpApiKey();
  if (!apiKey) {
    console.warn('[SerpAPI] API kalit topilmadi');
    return [];
  }

  const cleanQuery = searchQuery.trim();
  const products: SerpProductItem[] = [];

  // 1-urinish: Google Shopping (gl=us, hl=uz or en)
  try {
    const shoppingUrl = new URL('https://serpapi.com/search.json');
    shoppingUrl.searchParams.set('engine', 'google_shopping');
    shoppingUrl.searchParams.set('q', cleanQuery);
    shoppingUrl.searchParams.set('gl', 'us');
    shoppingUrl.searchParams.set('hl', 'uz');
    shoppingUrl.searchParams.set('api_key', apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const res = await fetch(shoppingUrl.toString(), {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const shoppingResults = data.shopping_results || [];

      for (const item of shoppingResults.slice(0, limit)) {
        const link = item.product_link || item.link || (item.serpapi_product_api ? `https://www.google.com/search?q=${encodeURIComponent(item.title || cleanQuery)}` : '#');
        const thumbnail = item.thumbnail || item.serpapi_thumbnail || '';
        if (item.title) {
          products.push({
            title: item.title,
            price: item.price || (item.extracted_price ? `${item.extracted_price} $` : 'Narxi ko‘rsatilmagan'),
            source: item.source || 'Internet do‘kon',
            link: link,
            thumbnail: thumbnail,
            rating: item.rating,
            reviews: item.reviews,
            snippet: item.snippet,
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[SerpAPI Shopping error]:', err?.message || err);
  }

  // Agar shopping natijalari yetarli bo'lsa darhol qaytaramiz
  if (products.length >= 2) {
    return products.slice(0, limit);
  }

  // 2-urinish: Google Search (Organic & Inline Shopping) O'zbekiston do'konlari bilan
  try {
    const searchUrl = new URL('https://serpapi.com/search.json');
    searchUrl.searchParams.set('engine', 'google');
    searchUrl.searchParams.set('q', cleanQuery);
    searchUrl.searchParams.set('hl', 'uz');
    searchUrl.searchParams.set('api_key', apiKey);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

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
        if (products.length >= limit) break;
        if (item.title && !products.some(p => p.title.toLowerCase() === item.title.toLowerCase())) {
          products.push({
            title: item.title,
            price: item.price || 'Narxi ko‘rsatilmagan',
            source: item.source || 'Google Shopping',
            link: item.link || item.product_link || '#',
            thumbnail: item.thumbnail || '',
          });
        }
      }

      // Agar hali ham kam bo'lsa, organic natijalardan boyitish
      const organic = data.organic_results || [];
      for (const item of organic) {
        if (products.length >= limit) break;
        const thumb = item.thumbnail || item.rich_snippet?.top?.extensions?.[0] || '';
        let extractedPrice = 'Bozor narxida';
        if (item.snippet) {
          const priceMatch = item.snippet.match(/(\d+[\d\s.,]*\s*(?:so[‘']?m|сум|\$|usd))/i);
          if (priceMatch) extractedPrice = priceMatch[1];
        }

        // Hostname / source
        let sourceName = 'Online Market';
        try {
          if (item.link) {
            const parsedUrl = new URL(item.link);
            sourceName = parsedUrl.hostname.replace(/^www\./, '');
          }
        } catch {
          // ignore
        }

        products.push({
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
    console.warn('[SerpAPI Organic fallback error]:', err?.message || err);
  }

  return products.slice(0, limit);
}
