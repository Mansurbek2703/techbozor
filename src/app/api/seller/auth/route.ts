import { NextResponse } from 'next/server';
import { getSellerByLogin, createSeller, getSellers } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      const { login, password } = body;
      if (!login || !password) {
        return NextResponse.json({ success: false, error: 'Login va parol kiritilishi shart' }, { status: 400 });
      }

      const seller = getSellerByLogin(login);
      if (!seller) {
        return NextResponse.json({ success: false, error: 'Bunday sotuvchi topilmadi' }, { status: 401 });
      }

      if (seller.isBlocked) {
        return NextResponse.json({ success: false, error: 'Sizning akkauntingiz administrator tomonidan bloklangan' }, { status: 403 });
      }

      if (seller.password && seller.password !== password) {
        return NextResponse.json({ success: false, error: 'Parol noto‘g‘ri' }, { status: 401 });
      }

      // Hide password
      const { password: _, ...sellerData } = seller;
      return NextResponse.json({
        success: true,
        data: sellerData,
        message: 'Tizimga muvaffaqiyatli kirdingiz',
      });
    }

    if (action === 'register') {
      const { login, password, shopName, ownerName, phone, sellerType, regions, categories } = body;

      if (!login || !password || !shopName || !phone || !regions || regions.length === 0) {
        return NextResponse.json({ success: false, error: 'Barcha majburiy maydonlarni to‘ldiring' }, { status: 400 });
      }

      if (regions.length > 3) {
        return NextResponse.json({ success: false, error: 'Sotuvchi ko‘pi bilan 3 ta viloyatni tanlashi mumkin' }, { status: 400 });
      }

      const existing = getSellerByLogin(login);
      if (existing) {
        return NextResponse.json({ success: false, error: 'Ushbu login band, boshqa login tanlang' }, { status: 409 });
      }

      const newSeller = createSeller({
        login,
        password,
        shopName,
        ownerName: ownerName || shopName,
        phone,
        sellerType: sellerType || 'business',
        regions,
        categories: categories || ['tv', 'fridge', 'washing', 'ac', 'vacuum', 'stove', 'microwave'],
      });

      const { password: _, ...sellerData } = newSeller;
      return NextResponse.json({
        success: true,
        data: sellerData,
        message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz! Tizimga xush kelibsiz.',
      });
    }

    return NextResponse.json({ success: false, error: 'Noto‘g‘ri amal' }, { status: 400 });
  } catch (error) {
    console.error('Seller auth error:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
