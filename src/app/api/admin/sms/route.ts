import { NextResponse } from 'next/server';
import { getSMSLogs } from '@/lib/storage';
import { verifyAdminRequest } from '@/lib/admin-auth';

export async function GET(request: Request) {
  try {
    const auth = verifyAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 403 });
    }
    const logs = getSMSLogs();
    const totalSpent = logs.reduce((sum, item) => sum + (item.costSoM || 65), 0);
    return NextResponse.json({ 
      success: true, 
      data: {
        logs,
        totalCount: logs.length,
        totalSpentSoM: totalSpent,
        pricePerSms: 65,
      }
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
