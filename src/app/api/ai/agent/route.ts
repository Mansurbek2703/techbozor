import { NextResponse } from 'next/server';
import { runEcommerceAgent } from '@/lib/ecommerce-agent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message || body.prompt;
    const history = body.history || [];

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Iltimos, xabaringizni kiriting',
      }, { status: 400 });
    }

    const agentResult = await runEcommerceAgent(message, history);

    return NextResponse.json({
      success: true,
      data: agentResult,
    });
  } catch (error: any) {
    console.error('AI E-Commerce Agent error:', error);
    return NextResponse.json({
      success: false,
      error: 'AI agent bilan bog‘lanishda xatolik yuz berdi: ' + (error?.message || ''),
    }, { status: 500 });
  }
}
