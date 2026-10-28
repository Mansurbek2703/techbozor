import { NextResponse } from 'next/server';
import { getProductsBySellerId, addProduct, deleteProduct } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId');

    if (!sellerId) {
      return NextResponse.json({ success: false, error: 'sellerId talab qilinadi' }, { status: 400 });
    }

    const products = getProductsBySellerId(sellerId);
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sellerId, category, name, brand, model, price, condition, specifications, imageUrl, region } = body;

    if (!sellerId || !name || !price || !category) {
      return NextResponse.json({ success: false, error: 'Maydonlar to‘liq emas' }, { status: 400 });
    }

    const newProduct = addProduct({
      sellerId,
      category,
      name,
      brand: brand || 'Boshqa',
      model: model || '',
      price: Number(price),
      condition: condition || 'new',
      specifications: specifications || {},
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
      region: region || 'Toshkent shahri',
      inStock: true,
    });

    return NextResponse.json({ success: true, data: newProduct, message: 'Mahsulot muvaffaqiyatli qo‘shildi' });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const sellerId = searchParams.get('sellerId');

    if (!productId || !sellerId) {
      return NextResponse.json({ success: false, error: 'Parametrlar yetarli emas' }, { status: 400 });
    }

    const ok = deleteProduct(productId, sellerId);
    return NextResponse.json({ success: ok, message: ok ? 'Mahsulot o‘chirildi' : 'Mahsulot topilmadi' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
