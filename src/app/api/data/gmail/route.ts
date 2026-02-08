import { NextRequest, NextResponse } from 'next/server';
import { fetchGmailData } from '@/lib/data/gmail';

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    const data = await fetchGmailData(accessToken);
    return NextResponse.json({ data, tokenCount: data.length / 4 });
  } catch (error) {
    console.error('Gmail fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch Gmail data' }, { status: 500 });
  }
}
