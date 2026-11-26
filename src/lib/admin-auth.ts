import crypto from 'crypto';

export const ADMIN_TELEGRAM_IDS = ['7937766765', '1202082857'];

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9148816120:AAFVvLOTnSHZMUTa9Y_F5aNl7p7DywHzb8k';

export interface AdminAuthResult {
  ok: boolean;
  adminId?: string;
  firstName?: string;
  username?: string;
  error?: string;
}

export function verifySignedAdminToken(token: string): AdminAuthResult {
  if (!token || typeof token !== 'string') {
    return { ok: false, error: 'Admin token mavjud emas.' };
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { ok: false, error: 'Admin token formati noto‘g‘ri.' };
    }
    const [adminId, expStr, sig] = parts;
    if (!ADMIN_TELEGRAM_IDS.includes(String(adminId))) {
      return { ok: false, error: `Kirish taqiqlangan! Sizning ID (${adminId}) adminlar ro‘yxatida yo‘q.` };
    }
    const exp = Number(expStr);
    if (!exp || Date.now() > exp) {
      return { ok: false, error: 'Admin sessiyasi muddati tugagan. Botda /start bosing.' };
    }
    const expectedSig = crypto
      .createHmac('sha256', BOT_TOKEN)
      .update(`${adminId}.${expStr}`)
      .digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { ok: false, error: 'Admin token imzosi haqiqiy emas!' };
    }

    return {
      ok: true,
      adminId: String(adminId),
      firstName: 'Admin',
      username: '',
    };
  } catch {
    return { ok: false, error: 'Admin token tekshiruvida xatolik.' };
  }
}

export function verifyTelegramWebAppInitData(initData: string): AdminAuthResult {
  if (!initData || typeof initData !== 'string') {
    return { ok: false, error: 'Telegram autentifikatsiyasi topilmadi. Faqat @arzonoling_bot orqali kiring.' };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return { ok: false, error: 'Telegram imzosi (hash) mavjud emas.' };
    }

    const pairs: string[] = [];
    params.forEach((value, key) => {
      if (key !== 'hash') {
        pairs.push(`${key}=${value}`);
      }
    });
    pairs.sort();
    const dataCheckString = pairs.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const hashBuf = Buffer.from(hash, 'hex');
    const calcBuf = Buffer.from(calculatedHash, 'hex');
    if (hashBuf.length !== calcBuf.length || !crypto.timingSafeEqual(hashBuf, calcBuf)) {
      return { ok: false, error: 'Telegram imzosi haqiqiy emas!' };
    }

    const userRaw = params.get('user');
    if (!userRaw) {
      return { ok: false, error: 'Telegram foydalanuvchi maʼlumoti topilmadi.' };
    }

    const user = JSON.parse(userRaw);
    const userId = String(user?.id || '');
    if (!ADMIN_TELEGRAM_IDS.includes(userId)) {
      return { ok: false, error: `Kirish taqiqlangan! Sizning ID (${userId}) adminlar ro‘yxatida yo‘q.` };
    }

    return {
      ok: true,
      adminId: userId,
      firstName: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Admin',
      username: user.username || '',
    };
  } catch (err: any) {
    return { ok: false, error: 'Telegram tekshiruvida xatolik: ' + (err?.message || '') };
  }
}

export function verifyAdminRequest(request: Request): AdminAuthResult {
  const initData = request.headers.get('x-telegram-init-data') || '';
  if (initData) {
    return verifyTelegramWebAppInitData(initData);
  }
  const adminToken = request.headers.get('x-admin-token') || '';
  if (adminToken) {
    return verifySignedAdminToken(adminToken);
  }
  return { ok: false, error: 'Telegram autentifikatsiyasi topilmadi. Faqat @arzonoling_bot orqali kiring.' };
}
