import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function getOpenAIApiKey(): string {
  return (process.env.OPENAI_API_KEY || '').trim();
}

function getGeminiApiKeys(): string[] {
  const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '';
  return keysStr
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 5);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = (body.message || body.prompt || '').trim();
    const history = Array.isArray(body.history) ? body.history : [];
    const region = body.region || 'Toshkent shahri';
    const activeQuery = body.activeQuery || '';

    if (!userMessage) {
      return NextResponse.json({
        success: false,
        error: 'Iltimos, xabaringizni yozing.'
      }, { status: 400 });
    }

    const systemPrompt = 
`Siz "Iqtisodchi" platformasining o'ta aqlli, erkin va kuchli sun'iy intellekt maslahatchisisiz (GPT-4o-mini).

ASOSIY QOIDALAR VA QOBILIYATLAR:
1. ERKIN VA MUTLAQ BILIMDON AI: Siz umumiy kuchli GPT modelisiz. Har qanday savolga (salomlashish, "sen kimsan", falsafiy, ilmiy, hisob-kitob, solishtirish yoki erkin muloqot) ochiq, samimiy va erkin javob bering. Hech qachon "mahsulot topilmadi" yoki "savol bo'yicha tovar yo'q" deb qotib qolmang!
2. O'ZBEKISTON BOZORI EKSPERTI: O'zbekistonning barcha rasmiy do'konlari (Uzum, Texnomart, Olcha, Idea, Asaxiy, Mediapark, BeeMarket), narxlar, chegirmalar, muddatli to'lov (Alif, Anor, Zoodpay) va rasmiy kafolat shartlarini chuqur bilasiz.
3. HUDUDIY KONTEKST: Foydalanuvchining hozirgi tanlangan hududi: "${region}". Agar mavzu yetkazib berish yoki do'konlarga tegishli bo'lsa, ushbu hududga mos rasmiy yetkazib berish (24-48 soat) va servis shartlarini inobatga oling.
${activeQuery ? `4. JORIY QIDIRUV MAVZUSI: Foydalanuvchi hozirda "${activeQuery}" mahsuloti bo'yicha qidiruvda turibdi. Agar savol shu mahsulotga oid bo'lsa, xolis va iqtisodiy jihatdan foydali maslahat bering.` : ''}
5. TIL VA USLUB: Javoblarni chiroyli o'zbek tilida (lotin alifbosida), qisqa paragraflar, emojilar va aniq faktlar bilan yozing. Doim do'stona va professional bo'ling.`;

    const openAiKey = getOpenAIApiKey();

    // 1-USUL: OpenAI GPT-4o-mini orqali javob olish (Eng yuqori aql va erkinlik)
    if (openAiKey) {
      try {
        const messages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt }
        ];

        // Format history
        history.slice(-8).forEach((item: any) => {
          const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
          if (item.content && typeof item.content === 'string') {
            messages.push({ role, content: item.content });
          }
        });

        messages.push({ role: 'user', content: userMessage });

        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages,
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (openAiRes.ok) {
          const aiJson = await openAiRes.json();
          const reply = aiJson.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return NextResponse.json({
              success: true,
              reply,
              provider: 'gpt-4o-mini'
            });
          }
        } else {
          console.warn('[OpenAI Chat failed, switching to Gemini]:', await openAiRes.text());
        }
      } catch (err) {
        console.warn('[OpenAI Chat error]:', err);
      }
    }

    // 2-USUL: Gemini API zaxirasi
    const geminiKeys = getGeminiApiKeys();
    for (const gKey of geminiKeys) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${gKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nFoydalanuvchi xabari: ${userMessage}` }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            }
          })
        });

        if (geminiRes.ok) {
          const gJson = await geminiRes.json();
          const gReply = gJson.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (gReply) {
            return NextResponse.json({
              success: true,
              reply: gReply,
              provider: 'gemini-flash'
            });
          }
        }
      } catch (gErr) {
        console.warn('[Gemini fallback error]:', gErr);
      }
    }

    // Fallback natural response
    return NextResponse.json({
      success: true,
      reply: `Assalomu alaykum! Men **Iqtisodchi AI** — intellektual xarid maslahatchisiman. Sizga O‘zbekiston onlayn do‘konlaridagi (Uzum, Texnomart, Olcha va h.k.) eng arzon narxlar, mahsulotlar taqqoslovi va ${region} bo‘yicha yetkazib berish shartlari bo‘yicha har qanday savolingizga yordam berishdan mamnunman! Sizni qaysi mahsulot yoki narx qiziqtirmoqda?`
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Xatolik yuz berdi: ' + (error?.message || '')
    }, { status: 500 });
  }
}
