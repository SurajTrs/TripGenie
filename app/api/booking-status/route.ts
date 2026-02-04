import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId');

  if (!bookingId) {
    return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
  }

  return NextResponse.json({
    bookingId,
    status: 'confirmed',
    details: {
      transport: { status: 'confirmed', pnr: 'ABC123' },
      hotel: { status: 'confirmed', confirmationCode: 'HTL456' },
      payment: { status: 'completed', amount: 15000 }
    },
    timestamp: new Date().toISOString()
  });
}
