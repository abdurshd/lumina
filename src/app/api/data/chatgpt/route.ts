import { NextRequest, NextResponse } from 'next/server';
import { parseChatGPTExport } from '@/lib/data/chatgpt';

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const data = parseChatGPTExport(content);
    return NextResponse.json({ data, tokenCount: data.length / 4 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse ChatGPT export';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
