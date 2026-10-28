import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/storage';

export async function GET() {
  try {
    const stats = getAdminStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
