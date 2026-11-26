import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getRequests, createRequest, deleteRequestById } from '@/lib/storage';
import { notifySellersAboutNewRequest } from '@/lib/sms';
import { verifyAdminRequest } from '@/lib/admin-auth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9148816120:AAFVvLOTnSHZMUTa9Y_F5aNl7p7DywHzb8k';
const DB_PATH = path.join(process.cwd(), 'data', 'techbozor_db.json');

async function notifyAdminsTelegram(req: any) {
  try {
    const db = fs.existsSync(DB_PATH)
      ? JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
      : {};
    const adminIds: string[] = Array.from(
      new Set([
        '7937766765',
        '1202082857',
        ...(Array.isArray(db.adminChatIds) ? db.adminChatIds.map(String) : []),
        ...(process.env.ADMIN_TELEGRAM_ID ? [String(process.env.ADMIN_TELEGRAM_ID)] : []),
      ])
    );

    // Agar Telegram user telefon raqami bo'lsa, bazaga saqlab qo'yamiz (avtomatik to'ldirish uchun)
    if (req.telegramUserId && req.buyerPhone) {
      if (!db.tgUsers) db.tgUsers = {};
      db.tgUsers[String(req.telegramUserId)] = {
        ...(db.tgUsers[String(req.telegramUserId)] || {}),
        tgId: String(req.telegramUserId),
        phone: req.buyerPhone,
        username: req.telegramUsername || '',
        firstName: req.buyerName || '',
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
    }

    if (adminIds.length === 0) return;

    const text =
      `🔥 <b>YANGI ARZON NARX TALABI (${req.id})!</b>\n\n` +
      `📦 <b>Tovar:</b> ${req.productTitle || req.description}\n` +
      (req.currentStore ? `🏪 <b>Joriy do‘kon:</b> ${req.currentStore}\n` : '') +
      (req.currentPrice ? `💰 <b>Joriy narx:</b> ${req.currentPrice}\n` : '') +
      `📍 <b>Hudud:</b> ${req.region}\n` +
      `👤 <b>Mijoz:</b> ${req.buyerName}${req.telegramUsername ? ` (@${req.telegramUsername})` : ''}\n` +
      `📞 <b>Tel:</b> ${req.buyerPhone}\n\n` +
      `👉 <a href="https://savdo.mcode.uz/admin">Admin panelda taklif yuborish</a>`;

    await Promise.allSettled(
      adminIds.map((chatId) =>
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        })
      )
    );
  } catch (e) {
    console.warn('[notifyAdminsTelegram error]:', e);
  }
}

export async function GET(request: Request) {
  try {
    // Faqat Adminlar xaridorlarning "Yanada arzonroq" talablarini ko'ra oladi
    const auth = verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const status = searchParams.get('status');

    let requests = getRequests();

    if (category && category !== 'all') {
      requests = requests.filter(r => r.category === category);
    }
    if (region && region !== 'all') {
      requests = requests.filter(r => r.region === region);
    }
    if (status && status !== 'all') {
      requests = requests.filter(r => r.status === status);
    }

    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.buyerPhone || (!body.description && !body.productTitle)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telefon raqami va mahsulot nomi kiritilishi shart' 
      }, { status: 400 });
    }

    const newReq = createRequest({
      buyerName: body.buyerName || 'Telegram Mijoz',
      buyerPhone: body.buyerPhone,
      category: body.category || 'other',
      description: body.description || `${body.productTitle} — eng arzon taklif so‘rovi`,
      budget: Number(String(body.budget || body.currentPrice || '0').replace(/\D/g, '')) || 0,
      region: body.region || 'Toshkent shahri',
      district: body.district || '',
      specifications: body.specifications || {},
      durationDays: Number(body.durationDays) || 7,
      smsConsent: body.smsConsent !== false,
      telegramUserId: body.telegramUserId ? String(body.telegramUserId) : undefined,
      telegramUsername: body.telegramUsername || undefined,
      productTitle: body.productTitle || undefined,
      currentPrice: body.currentPrice || undefined,
      currentStore: body.currentStore || undefined,
      productUrl: body.productUrl || undefined,
      aiExtracted: body.aiExtracted,
    });

    // Adminlarga Telegram orqali xabar berish, sotuvchilarga SMS va xaridorga 24 soatlik bildirishnoma
    const buyerNotifyPromise = newReq.telegramUserId
      ? fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: newReq.telegramUserId,
            text: `✅ <b>Talabingiz (${newReq.id}) qabul qilindi!</b>\n\n📦 <b>Mahsulot:</b> ${newReq.productTitle || newReq.description}\n⏳ <b>24 soat davomida sizga javob yoziladi!</b>`,
            parse_mode: 'HTML',
          }),
        }).catch(() => null)
      : Promise.resolve(null);

    const [notificationResult] = await Promise.all([
      notifySellersAboutNewRequest(newReq),
      notifyAdminsTelegram(newReq),
      buyerNotifyPromise,
    ]);

    return NextResponse.json({ 
      success: true, 
      data: newReq,
      notifiedSellers: notificationResult.sellers,
      notifiedCount: notificationResult.notifiedCount,
      message: 'Talabingiz qabul qilindi! 24 soat davomida sizga Telegram bot orqali yoki qo‘ng‘iroq qilib javob yoziladi.'
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ success: false, error: 'Talabni saqlashda xatolik yuz berdi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id talab qilinadi' }, { status: 400 });
    }
    const ok = deleteRequestById(id);
    return NextResponse.json({ success: ok, message: ok ? 'Talab o‘chirildi' : 'Talab topilmadi' });
  } catch {
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
