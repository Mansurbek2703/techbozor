import { NextResponse } from 'next/server';
import { verifyTelegramWebAppInitData, verifySignedAdminToken } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData || request.headers.get('x-telegram-init-data') || '';
    const tgAuth = body.tgAuth || request.headers.get('x-admin-token') || '';

    const check = initData
      ? verifyTelegramWebAppInitData(initData)
      : verifySignedAdminToken(tgAuth);

    if (!check.ok) {
      return NextResponse.json({
        authorized: false,
        error: check.error,
      }, { status: 403 });
    }

    return NextResponse.json({
      authorized: true,
      admin: {
        id: check.adminId,
        firstName: check.firstName,
        username: check.username,
      },
    });
  } catch {
    return NextResponse.json({ authorized: false, error: 'Tekshiruvda xatolik' }, { status: 500 });
  }
}
