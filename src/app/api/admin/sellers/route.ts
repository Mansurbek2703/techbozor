import { NextResponse } from 'next/server';
import { getSellers, toggleSellerBlock } from '@/lib/storage';

export async function GET() {
  try {
    const sellers = getSellers().map(s => {
      const { password, ...safeSeller } = s;
      return safeSeller;
    });
    return NextResponse.json({ success: true, data: sellers });
  } catch (error) {
    console.error('Error fetching admin sellers:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { sellerId } = body;

    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'sellerId kiritilishi shart' }, { status: 400 });
    }

    const ok = toggleSellerBlock(sellerId);
    return NextResponse.json({ success: ok, message: ok ? 'Sotuvchi holati o‘zgartirildi' : 'Sotuvchi topilmadi' });
  } catch (error) {
    console.error('Error updating seller status:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
