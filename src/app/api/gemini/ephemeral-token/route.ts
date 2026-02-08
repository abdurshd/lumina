import { NextResponse } from 'next/server';

export async function POST() {
  // For the Live API, we use an ephemeral token approach
  // In a hackathon context, we pass the API key directly for simplicity
  // In production, you'd use a service account to generate short-lived tokens
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
  }

  return NextResponse.json({ apiKey });
}
