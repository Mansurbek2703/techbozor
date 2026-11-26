import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '@/lib/admin-auth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9148816120:AAFVvLOTnSHZMUTa9Y_F5aNl7p7DywHzb8k';
const DB_PATH = path.join(process.cwd(), 'data', 'techbozor_db.json');

export async function POST(request: Request) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const body = await request.json();
    const { requestId, offerPrice, message, productUrl, adminPhone } = body;

    if (!requestId || !offerPrice) {
      return NextResponse.json({ success: false, error: 'requestId va yangi narx kiritilishi shart' }, { status: 400 });
    }

    const db = fs.existsSync(DB_PATH)
      ? JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
      : { requests: [], offers: [] };

    const reqIndex = (db.requests || []).findIndex((r: any) => r.id === requestId);
    if (reqIndex === -1) {
      return NextResponse.json({ success: false, error: 'Talab topilmadi' }, { status: 404 });
    }

    const targetReq = db.requests[reqIndex];
    const cleanPrice = Number(String(offerPrice).replace(/\D/g, '')) || 0;
    const formattedPrice = cleanPrice > 0 ? `${cleanPrice.toLocaleString('uz-UZ').replace(/,/g, ' ')} so‘m` : String(offerPrice);

    // Taklifni saqlash
    if (!Array.isArray(db.offers)) db.offers = [];
    const newOffer = {
      id: `OFF-${Math.floor(1000 + Math.random() * 9000)}`,
      requestId,
      sellerId: 'ADMIN',
      sellerName: 'Bosh Admin (Iqtisodchi)',
      sellerShopName: 'Iqtisodchi Maxsus Taklif',
      sellerPhone: adminPhone || '+998901234567',
      sellerRegion: targetReq.region || 'Toshkent shahri',
      productName: targetReq.productTitle || targetReq.description,
      brand: '',
      model: '',
      price: cleanPrice,
      condition: 'new',
      description: message || `Siz so‘ragan mahsulot uchun eng arzon maxsus taklif: ${formattedPrice}`,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    db.offers.unshift(newOffer);
    db.requests[reqIndex].status = 'fulfilled';
    db.requests[reqIndex].adminOfferNote = `${formattedPrice} — ${message || 'Yuborildi'}`;

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

    // Mijozga Telegram Bot orqali xabar yuborish
    let telegramSent = false;
    if (targetReq.telegramUserId) {
      const tgText =
        `🎉 <b>Sizning arzon narx talabingiz bo‘yicha YANGI TAKLIF!</b>\n\n` +
        `📦 <b>Mahsulot:</b> ${targetReq.productTitle || targetReq.description}\n` +
        (targetReq.currentPrice ? `📉 <b>Avvalgi narx:</b> ${targetReq.currentPrice}\n` : '') +
        `🔥 <b>Bizning taklif narximiz:</b> <b>${formattedPrice}</b>\n` +
        (message ? `💬 <b>Izoh:</b> ${message}\n` : '') +
        (adminPhone ? `📞 <b>Aloqa:</b> ${adminPhone}\n` : '') +
        (productUrl ? `🔗 <a href="${productUrl}">Havola orqali ko‘rish</a>\n` : '') +
        `\n<i>Buyurtmani tasdiqlash uchun yuqoridagi raqamga qo‘ng‘iroq qiling yoki botga javob yozing!</i>`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetReq.telegramUserId,
            text: tgText,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        });
        const tgData = await tgRes.json();
        telegramSent = Boolean(tgData?.ok);
      } catch (e) {
        console.warn('[Telegram send-offer error]:', e);
      }
    }

    return NextResponse.json({
      success: true,
      offer: newOffer,
      telegramSent,
      message: telegramSent
        ? 'Taklif saqlandi va mijozga Telegram bot orqali yuborildi!'
        : 'Taklif saqlandi (mijoz Telegram ID bo‘lmagani uchun telefon orqali bog‘lanishingiz mumkin).',
    });
  } catch (error: any) {
    console.error('[admin send-offer error]:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Server xatoligi' }, { status: 500 });
  }
}
