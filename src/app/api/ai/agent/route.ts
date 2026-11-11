import { NextResponse } from 'next/server';
import { runEcommerceAgent } from '@/lib/ecommerce-agent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message || body.prompt;
    const history = body.history || [];
    const region = body.region || undefined;
    const budget = body.budget || undefined;
    const feature = body.feature || undefined;
    const turn_count = typeof body.turn_count === 'number' ? body.turn_count : 1;
    const clarification_payload = body.clarification_payload || undefined;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Iltimos, xabaringizni kiriting',
      }, { status: 400 });
    }

    const agentResult = await runEcommerceAgent(message, history, {
      region,
      budget,
      feature,
      turn_count,
      clarification_payload,
    });

    return NextResponse.json({
      success: true,
      status: agentResult.status,
      message: agentResult.ai_reply || agentResult.replyMessage || agentResult.message,
      dynamic_chips: agentResult.dynamic_chips || agentResult.smartChips?.map(c => c.label) || [],
      extracted_data: agentResult.extracted_data || {
        category: agentResult.category_key || 'other',
        product_name: agentResult.cleanQuery || message,
        location: agentResult.normalized_params?.region || region || null,
        is_electronic: agentResult.is_electronic ?? false,
        attributes: {}
      },
      ui_mode: agentResult.ui_mode,
      ai_reply: agentResult.ai_reply,
      products: agentResult.products,
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
