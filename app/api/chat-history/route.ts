import { NextRequest, NextResponse } from 'next/server';

const chatSessions = new Map();

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const history = chatSessions.get(sessionId) || [];
  return NextResponse.json({ history });
}

export async function POST(req: NextRequest) {
  const { sessionId, message } = await req.json();

  if (!sessionId || !message) {
    return NextResponse.json({ error: 'Session ID and message required' }, { status: 400 });
  }

  const history = chatSessions.get(sessionId) || [];
  history.push(message);
  chatSessions.set(sessionId, history);

  return NextResponse.json({ success: true });
}
