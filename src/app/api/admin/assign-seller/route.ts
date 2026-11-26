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
    const { requestId, sellerId, note } = body;
    if (!requestId || !sellerId) {
      return NextResponse.json({ success: false, error: 'requestId va sellerId talab qilinadi' }, { status: 400 });
    }

    const db = fs.existsSync(DB_PATH)
      ? JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
      : { requests: [], sellers: [] };

    const reqIndex = (db.requests || []).findIndex((r: any) => r.id === requestId);
    const seller = (db.sellers || []).find((s: any) => s.id === sellerId);

    if (reqIndex === -1 || !seller) {
      return NextResponse.json({ success: false, error: 'Talab yoki sotuvchi topilmadi' }, { status: 404 });
    }

    const targetReq = db.requests[reqIndex];
    db.requests[reqIndex].assignedSellerId = seller.id;
    db.requests[reqIndex].assignedSellerName = seller.shopName;
    db.requests[reqIndex].adminOfferNote = `Sotuvchiga biriktirildi: ${seller.shopName}${note ? ` (${note})` : ''}`;
    db.requests[reqIndex].status = 'fulfilled';

    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

    let telegramSent = false;
    if (seller.telegramId) {
      const msgText =
        `🤝 <b>ADMIN SIZGA YANGI XARIDOR TALABINI BIRIKTIRDI!</b>\n\n` +
        `📦 <b>Mahsulot:</b> ${targetReq.productTitle || targetReq.description}\n` +
        (targetReq.currentPrice ? `💰 <b>Bozordagi narx:</b> ${targetReq.currentPrice}\n` : '') +
        `📍 <b>Yetkazish hududi:</b> ${targetReq.region}\n` +
        `👤 <b>Xaridor:</b> ${targetReq.buyerName}${targetReq.telegramUsername ? ` (@${targetReq.telegramUsername})` : ''}\n` +
        `📞 <b>Xaridor telefoni:</b> ${targetReq.buyerPhone}\n` +
        (note ? `📝 <b>Admin izohi:</b> ${note}\n` : '') +
        `\n<i>Shartga muvofiq uygacha yetkazib berish bilan eng qulay narxni taklif qiling!</i>`;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: seller.telegramId,
            text: msgText,
            parse_mode: 'HTML',
          }),
        });
        const tgData = await tgRes.json();
        telegramSent = Boolean(tgData?.ok);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      telegramSent,
      message: telegramSent
        ? `Talab «${seller.shopName}» sotuvchisiga biriktirildi va Telegram bot orqali yuborildi!`
        : `Talab «${seller.shopName}» sotuvchisiga biriktirildi (sotuvchi telefoni: ${seller.phone}).`,
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Server xatoligi' }, { status: 500 });
  }
}
