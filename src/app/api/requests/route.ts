import { NextResponse } from 'next/server';
import { getRequests, createRequest } from '@/lib/storage';
import { notifySellersAboutNewRequest } from '@/lib/sms';

export async function GET(request: Request) {
  try {
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

    if (!body.buyerName || !body.buyerPhone || !body.category || !body.description || !body.budget || !body.region) {
      return NextResponse.json({ 
        success: false, 
        error: 'Majburiy maydonlar to‘liq to‘ldirilmadi' 
      }, { status: 400 });
    }

    const newReq = createRequest({
      buyerName: body.buyerName,
      buyerPhone: body.buyerPhone,
      category: body.category,
      description: body.description,
      budget: Number(body.budget),
      region: body.region,
      district: body.district || '',
      specifications: body.specifications || {},
      durationDays: Number(body.durationDays) || 7,
      smsConsent: body.smsConsent !== false,
      aiExtracted: body.aiExtracted,
    });

    // Mos sotuvchilarga SMS xabarnoma yuborish
    const notificationResult = await notifySellersAboutNewRequest(newReq);

    return NextResponse.json({ 
      success: true, 
      data: newReq,
      notifiedSellers: notificationResult.sellers,
      notifiedCount: notificationResult.notifiedCount,
      message: 'Talab muvaffaqiyatli joylashtirildi va mos sotuvchilarga SMS yuborildi!'
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ success: false, error: 'Talabni saqlashda xatolik yuz berdi' }, { status: 500 });
  }
}
