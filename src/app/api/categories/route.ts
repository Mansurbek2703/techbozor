import { NextResponse } from 'next/server';
import { getStoredCategories, addCategory, deleteCategory } from '@/lib/storage';

export async function GET() {
  try {
    const categories = getStoredCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, iconName, description, filters } = body;

    if (!id || !name) {
      return NextResponse.json({ success: false, error: 'Kategoriya ID va Nomi talab qilinadi' }, { status: 400 });
    }

    const newCat = addCategory({
      id,
      name,
      iconName: iconName || 'SlidersHorizontal',
      description: description || '',
      filters: filters || [],
    });

    return NextResponse.json({ success: true, data: newCat, message: 'Yangi kategoriya qo‘shildi' });
  } catch (error) {
    console.error('Error adding category:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Kategoriya ID kerak' }, { status: 400 });
    }

    const ok = deleteCategory(id);
    return NextResponse.json({ success: ok, message: ok ? 'Kategoriya o‘chirildi' : 'Topilmadi' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
