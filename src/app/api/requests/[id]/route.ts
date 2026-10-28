import { NextResponse } from 'next/server';
import { getRequestById, updateRequestStatus, getOffersByRequestId } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const reqItem = getRequestById(id);

    if (!reqItem) {
      return NextResponse.json({ success: false, error: 'Talab topilmadi' }, { status: 404 });
    }

    const offers = getOffersByRequestId(id);

    return NextResponse.json({
      success: true,
      data: {
        request: reqItem,
        offers: offers,
      },
    });
  } catch (error) {
    console.error('Error fetching request detail:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'closed', 'expired', 'fulfilled'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Noto‘g‘ri holat (status)' }, { status: 400 });
    }

    const ok = updateRequestStatus(id, status);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Talab topilmadi' }, { status: 404 });
    }

    const updated = getRequestById(id);
    return NextResponse.json({ success: true, data: updated, message: 'Talab holati yangilandi' });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json({ success: false, error: 'Server xatoligi' }, { status: 500 });
  }
}
