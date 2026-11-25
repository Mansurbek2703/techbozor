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
`Siz "Iqtisodchi" platformasining o'ta aqlli, erkin va jonli internet qidiruviga ega sun'iy intellekt maslahatchisisiz (GPT-4o-mini + Live Web Search).

ASOSIY QOIDALAR VA QOBILIYATLAR:
1. ERKIN VA BILIMDON AI: Har qanday savolga (salomlashish, "sen kimsan", taqqoslash, maslahat, hisob-kitob) ochiq va samimiy javob bering.
2. AQLLI ANIQLASHTIRISH (CLARIFICATION): Agar foydalanuvchi umumiy xarid istagini bildirsa (masalan: "men qo'lqop sotib olmoqchiman", "noutbuk olmoqchiman"), avval aniq va tartibli aniqlashtiruvchi savollar bering (masalan: 1. Turi / maqsadi, 2. Kim uchun / o'lchami, 3. Budjet).
3. JONLI INTERNET QIDIRUVI (WEB SEARCH): Foydalanuvchi parametrlar bersa yoki aniq mahsulot/narx/link so'rasa, ALBATTA web_search vositasi orqali O'zbekiston do'konlaridan (uzum.uz, market.yandex.uz, olcha.uz, asaxiy.uz, texnomart.uz, terrapro.uz, extremal-shop.uz va b.) haqiqiy, amaldagi mahsulotlarni toping!
   - Har bir topilgan mahsulot uchun: aniq nomi, haqiqiy narxi (so'mda), 2-3 ta asosiy xususiyati va bosiladigan Markdown havolasi [Do'kon nomi – xarid qilish](URL) ni bering.
   - Yakunda o'z xolis tavsiyangizni (Mening tavsiyam) qo'shing.
4. HUDUDIY KONTEKST: Foydalanuvchining tanlangan hududi: "${region}". Yetkazib berish shartlarida shu hududni inobatga oling.
${activeQuery ? `5. JORIY QIDIRUV MAVZUSI: Foydalanuvchi hozirda "${activeQuery}" bo'yicha qidiruvda turibdi.` : ''}
6. TIL VA USLUB: Javoblarni chiroyli o'zbek tilida (lotin alifbosida), tartibli ro'yxatlar bilan yozing. Hech qachon yolg'on yoki o'ylab topilgan narx/link bermang!`;

    const openAiKey = getOpenAIApiKey();

    // 1-USUL: OpenAI Responses API + Live Web Search (ChatGPT darajasidagi jonli O'zbekiston qidiruvi)
    if (openAiKey) {
      try {
        const inputMessages: Array<{ role: string; content: string }> = [
          { role: 'developer', content: systemPrompt }
        ];

        history.slice(-8).forEach((item: any) => {
          const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
          if (item.content && typeof item.content === 'string') {
            inputMessages.push({ role, content: item.content });
          }
        });

        inputMessages.push({ role: 'user', content: userMessage });

        const respRes = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            tools: [
              {
                type: 'web_search_preview',
                user_location: {
                  type: 'approximate',
                  country: 'UZ',
                  city: region.replace(/\s*(shahri|viloyati)/gi, '').trim() || 'Tashkent',
                },
              },
            ],
            input: inputMessages,
          }),
        });

        if (respRes.ok) {
          const respJson = await respRes.json();
          const outputArr: any[] = Array.isArray(respJson.output) ? respJson.output : [];
          const replyText = outputArr
            .filter((o) => o.type === 'message')
            .flatMap((o) => o.content || [])
            .filter((c) => c.type === 'output_text' && c.text)
            .map((c) => c.text)
            .join('\n')
            .trim();

          if (replyText) {
            return NextResponse.json({
              success: true,
              reply: replyText,
              provider: 'gpt-4o-mini-web-search'
            });
          }
        } else {
          console.warn('[OpenAI Responses failed, trying chat/completions]:', await respRes.text());
        }

        // Zaxira: standart chat/completions
        const messages: Array<{ role: string; content: string }> = [
          { role: 'system', content: systemPrompt }
        ];
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
            max_tokens: 900,
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
