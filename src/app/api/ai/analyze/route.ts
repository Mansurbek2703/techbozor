import { NextResponse } from 'next/server';
import { parseUserPrompt } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Iltimos, mahsulot haqida tavsif yozing' 
      }, { status: 400 });
    }

    const analyzed = parseUserPrompt(prompt);

    return NextResponse.json({
      success: true,
      data: analyzed,
    });
  } catch (error) {
    console.error('AI analyze error:', error);
    return NextResponse.json({ success: false, error: 'AI tahlilida xatolik' }, { status: 500 });
  }
}
