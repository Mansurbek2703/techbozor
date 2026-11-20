/**
 * ⚡ IQTISODCHI TELEGRAM BOT & MINI APP CONTROLLER (v21.0)
 * Bot: @arzonoling_bot
 * Token: 9148816120:AAFVvLOTnSHZMUTa9Y_F5aNl7p7DywHzb8k
 * WebApp URL: https://savdo.mcode.uz
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BOT_TOKEN = '9148816120:AAFVvLOTnSHZMUTa9Y_F5aNl7p7DywHzb8k';
const WEBAPP_URL = 'https://savdo.mcode.uz';
const DB_PATH = path.join(__dirname, 'data', 'techbozor_db.json');

// Sessions for FSM registration
const sessions = new Map();

function sendTelegramApi(method, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ ok: false, error: e.message });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

function getDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return { sellers: [], requests: [], offers: [], products: [] };
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return { sellers: [], requests: [], offers: [], products: [] };
  }
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing DB:', err);
  }
}

const UZ_REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand',
  'Farg‘ona',
  'Andijon',
  'Namangan',
  'Buxoro',
  'Xorazm',
  'Qashqadaryo',
  'Surxondaryo',
  'Jizzax',
  'Sirdaryo',
  'Navoiy',
  'Qoraqalpog‘iston'
];

async function setupBotMenu() {
  try {
    await sendTelegramApi('setChatMenuButton', {
      menu_button: {
        type: 'web_app',
        text: '🛍️ Iqtisodchi',
        web_app: { url: WEBAPP_URL }
      }
    });
    console.log('[Bot] Menu button configured successfully with WebApp URL.');
  } catch (e) {
    console.error('[Bot] Failed to set menu button:', e);
  }
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const contact = msg.contact;

  const session = sessions.get(chatId) || { step: 'IDLE' };

  // 1. /start command
  if (text.startsWith('/start')) {
    sessions.set(chatId, { step: 'IDLE' });

    const welcomeText = 
      `👋 <b>Assalomu alaykum, ${msg.from.first_name || 'Hurmatli mijoz'}!</b>\n\n` +
      `<b>«Iqtisodchi»</b> — O‘zbekiston onlayn do‘konlaridagi real narxlar, arzon muqobillar va intellektual xarid tizimining rasmiy botiga xush kelibsiz!\n\n` +
      `✨ <b>Imkoniyatlar:</b>\n` +
      `• Uzum, Texnomart, Olcha, Idea do‘konlaridagi narxlarni taqqoslash\n` +
      `• Har bir tovar uchun eng arzon muqobillarini (alternativlarini) topish\n` +
      `• Texnik tasnif va modellarni yonma-yon solishtirish\n` +
      `• <b>Sotuvchilar uchun:</b> Bot orqali oson ro‘yxatdan o‘tib, mahsulotlaringizni sotish!\n\n` +
      `Quyidagi tugmalardan birini tanlang:`;

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: welcomeText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🛍️ Bozorga kirish (Mini App)', web_app: { url: WEBAPP_URL } }
          ],
          [
            { text: '👔 Sotuvchi sifatida ro‘yxatdan o‘tish', callback_data: 'reg_seller_start' }
          ],
          [
            { text: '👑 Admin boshqaruv paneli', web_app: { url: `${WEBAPP_URL}/admin` } }
          ]
        ]
      }
    });
    return;
  }

  // 2. Registration Step 1: Owner Name
  if (session.step === 'AWAITING_NAME') {
    if (!text || text.length < 3) {
      await sendTelegramApi('sendMessage', {
        chat_id: chatId,
        text: '⚠️ Iltimos, haqiqiy ism va familiyangizni to‘liq yozing (Masalan: Alisher Valiyev):'
      });
      return;
    }
    session.ownerName = text.trim();
    session.step = 'AWAITING_SHOP';
    sessions.set(chatId, session);

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: `✅ Rahmat, <b>${session.ownerName}</b>!\n\n2️⃣ Endi <b>Do‘koningiz yoki brendingiz nomini</b> kiriting (Masalan: <i>SmartTex Tashkent</i>):`,
      parse_mode: 'HTML'
    });
    return;
  }

  // 3. Registration Step 2: Shop Name
  if (session.step === 'AWAITING_SHOP') {
    if (!text || text.length < 2) {
      await sendTelegramApi('sendMessage', {
        chat_id: chatId,
        text: '⚠️ Do‘kon nomini kiriting:'
      });
      return;
    }
    session.shopName = text.trim();
    session.step = 'AWAITING_PHONE';
    sessions.set(chatId, session);

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: `3️⃣ Telefon raqamingizni tasdiqlash uchun pastdagi <b>«📱 Telefon raqamni yuborish»</b> tugmasini bosing:`,
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          [{ text: '📱 Telefon raqamni yuborish', request_contact: true }]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
    return;
  }

  // 4. Registration Step 3: Phone Number
  if (session.step === 'AWAITING_PHONE') {
    let phone = '';
    if (contact && contact.phone_number) {
      phone = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;
    } else if (text && /^\+?998\d{9}$/.test(text.replace(/\s+/g, ''))) {
      phone = text.replace(/\s+/g, '');
      if (!phone.startsWith('+')) phone = `+${phone}`;
    }

    if (!phone) {
      await sendTelegramApi('sendMessage', {
        chat_id: chatId,
        text: '⚠️ Iltimos, pastdagi «📱 Telefon raqamni yuborish» tugmasini bosing yoki telefon raqamingizni +998901234567 formatida yozing.'
      });
      return;
    }

    session.phone = phone;
    session.step = 'AWAITING_REGION';
    sessions.set(chatId, session);

    // Remove phone keyboard and present regions inline
    const regionButtons = [];
    for (let i = 0; i < UZ_REGIONS.length; i += 2) {
      const row = [{ text: `📍 ${UZ_REGIONS[i]}`, callback_data: `reg_reg_${i}` }];
      if (i + 1 < UZ_REGIONS.length) {
        row.push({ text: `📍 ${UZ_REGIONS[i + 1]}`, callback_data: `reg_reg_${i + 1}` });
      }
      regionButtons.push(row);
    }

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: `✅ Telefon raqamingiz tasdiqlandi: <b>${session.phone}</b>\n\n4️⃣ Asosiy xizmat ko‘rsatish hududingizni (viloyatni) tanlang:`,
      parse_mode: 'HTML',
      reply_markup: {
        remove_keyboard: true
      }
    });

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: 'Hududingizni tanlang:',
      reply_markup: {
        inline_keyboard: regionButtons
      }
    });
    return;
  }
}

async function handleCallback(cb) {
  const chatId = cb.message.chat.id;
  const messageId = cb.message.message_id;
  const data = cb.data;

  // Acknowledge callback
  await sendTelegramApi('answerCallbackQuery', { callback_query_id: cb.id });

  let session = sessions.get(chatId) || { step: 'IDLE' };

  if (data === 'reg_seller_start') {
    session = { step: 'AWAITING_NAME' };
    sessions.set(chatId, session);

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: `📋 <b>Iqtisodchi Platformasida Sotuvchi sifatida ro‘yxatdan o‘tish</b>\n\n` +
            `1️⃣ Iltimos, to‘liq <b>ism va familiyangizni</b> kiriting:`,
      parse_mode: 'HTML'
    });
    return;
  }

  if (data.startsWith('reg_reg_')) {
    const idx = parseInt(data.replace('reg_reg_', ''), 10);
    const chosenRegion = UZ_REGIONS[idx] || 'Toshkent shahri';
    session.region = chosenRegion;
    session.step = 'AWAITING_DELIVERY';
    sessions.set(chatId, session);

    const confirmText = 
      `5️⃣ <b>Yetkazib berish va kafolat majburiyati:</b>\n\n` +
      `Siz xarid qilingan tovarlarni <b>${chosenRegion}</b> bo‘yicha o‘z vaqtida (24-48 soat ichida) xaridorga yetkazib berishni hamda ishlab chiqaruvchining rasmiy kafolatini ta’minlashni o‘z zimmangizga olasizmi?`;

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: confirmText,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Ha, barcha majburiyatni olaman', callback_data: 'reg_confirm_final' }],
          [{ text: '❌ Bekor qilish', callback_data: 'reg_cancel' }]
        ]
      }
    });
    return;
  }

  if (data === 'reg_cancel') {
    sessions.delete(chatId);
    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: '❌ Ro‘yxatdan o‘tish bekor qilindi. Istalgan vaqtda qayta boshlashingiz mumkin.'
    });
    return;
  }

  if (data === 'reg_confirm_final') {
    session.deliveryAgreed = true;
    const db = getDatabase();

    const sellerId = `SEL-TG-${Date.now().toString().slice(-5)}`;
    const newSeller = {
      id: sellerId,
      telegramId: cb.from.id,
      telegramUsername: cb.from.username || '',
      login: (session.shopName || 'seller').toLowerCase().replace(/\s+/g, '_') + '_' + sellerId.slice(-3),
      shopName: session.shopName || 'Do‘kon',
      ownerName: session.ownerName || cb.from.first_name || 'Sotuvchi',
      phone: session.phone || '',
      sellerType: 'business',
      regions: [session.region || 'Toshkent shahri'],
      categories: ['tv', 'fridge', 'washing', 'ac', 'phone', 'laptop'],
      deliveryAgreed: true,
      isVerified: true,
      isBlocked: false,
      rating: 5.0,
      createdAt: new Date().toISOString(),
    };

    if (!db.sellers) db.sellers = [];
    db.sellers.unshift(newSeller);
    saveDatabase(db);
    sessions.delete(chatId);

    const successMsg = 
      `🎉 <b>TABRIKLAYMIZ! RO‘YXATDAN O‘TDINGIZ!</b>\n\n` +
      `Do‘koningiz nomi: <b>${newSeller.shopName}</b>\n` +
      `Mas’ul shaxs: <b>${newSeller.ownerName}</b>\n` +
      `Telefon: <b>${newSeller.phone}</b>\n` +
      `Xizmat hududi: <b>${newSeller.regions[0]}</b>\n` +
      `Yetkazib berish: <b>✅ Tasdiqlangan</b>\n` +
      `Sotuvchi ID: <code>${newSeller.id}</code>\n\n` +
      `Siz tizimda to‘liq faollashtirildingiz! Endi Iqtisodchi Mini App orqali mijozlar buyurtmalarini qabul qilishingiz va do‘koningizni boshqarishingiz mumkin:`;

    await sendTelegramApi('sendMessage', {
      chat_id: chatId,
      text: successMsg,
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '📦 Sotuvchi Kabinetiga Kirish', web_app: { url: `${WEBAPP_URL}/seller/dashboard` } }],
          [{ text: '🛍️ Umumiy Bozorga Kirish', web_app: { url: WEBAPP_URL } }]
        ]
      }
    });
    return;
  }
}

// Long polling loop
let lastUpdateId = 0;

async function pollUpdates() {
  while (true) {
    try {
      const res = await sendTelegramApi('getUpdates', {
        offset: lastUpdateId + 1,
        timeout: 20
      });

      if (res && res.ok && Array.isArray(res.result)) {
        for (const update of res.result) {
          lastUpdateId = update.update_id;
          if (update.message) {
            await handleMessage(update.message).catch(console.error);
          } else if (update.callback_query) {
            await handleCallback(update.callback_query).catch(console.error);
          }
        }
      }
    } catch (err) {
      console.error('[Bot polling error]:', err.message);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

console.log('🚀 [Iqtisodchi Bot] Initializing @arzonoling_bot...');
setupBotMenu().then(() => {
  console.log('⚡ [Iqtisodchi Bot] Long-polling loop started...');
  pollUpdates();
});
