import { NextResponse } from 'next/server';
import { verifyTelegramWebAppInitData } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const initData = body.initData || request.headers.get('x-telegram-init-data') || '';
    const check = verifyTelegramWebAppInitData(initData);

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
