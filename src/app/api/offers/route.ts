import { NextResponse } from 'next/server';
import { createOffer, getRequestById, updateOfferStatus } from '@/lib/storage';
import { notifyBuyerAboutNewOffer } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.requestId || !body.sellerId || !body.productName || !body.price) {
      return NextResponse.json({ success: false, error: 'Taklif ma’lumotlari to‘liq emas' }, { status: 400 });
    }

    const reqItem = getRequestById(body.requestId);
    if (!reqItem) {
      return NextResponse.json({ success: false, error: 'Bunday talab topilmadi' }, { status: 404 });
    }

    if (reqItem.status !== 'active') {
      return NextResponse.json({ 
        success: false, 
        error: 'Ushbu talabning muddati tugagan yoki yopilgan. Yangi taklif yuborib bo‘lmaydi.' 
      }, { status: 400 });
    }

    const newOffer = createOffer({
      requestId: body.requestId,
      sellerId: body.sellerId,
      sellerName: body.sellerName || 'Sotuvchi',
      sellerShopName: body.sellerShopName || 'Do‘kon',
      sellerPhone: body.sellerPhone || '+998901234567',
      sellerRegion: body.sellerRegion || reqItem.region,
      productName: body.productName,
      brand: body.brand || 'Boshqa',
      model: body.model || '',
      price: Number(body.price),
      condition: body.condition || 'new',
      description: body.description || '',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
    });

    // Xaridorga SMS xabarnoma yuborish
    await notifyBuyerAboutNewOffer(newOffer, reqItem);

    return NextResponse.json({
      success: true,
      data: newOffer,
      message: 'Taklifingiz muvaffaqiyatli yuborildi va xaridorga SMS jo‘natildi!',
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { offerId, status } = body;

    if (!offerId || !status) {
      return NextResponse.json({ success: false, error: 'ID va status kiritilishi shart' }, { status: 400 });
    }

    const ok = updateOfferStatus(offerId, status);
    return NextResponse.json({ success: ok, message: 'Taklif holati yangilandi' });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
