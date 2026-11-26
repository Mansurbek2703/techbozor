import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/storage';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const stats = getAdminStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
