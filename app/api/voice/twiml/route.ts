import { NextRequest, NextResponse } from 'next/server';
import { generateTwiML } from '../../../../lib/voiceCall';

/**
 * TwiML endpoint that Twilio calls to get voice instructions
 * This endpoint generates the voice script for different call types
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const callType = req.nextUrl.searchParams.get('type') || 'custom';
    const bookingId = req.nextUrl.searchParams.get('bookingId');

    // Get additional data from query params
    const data: Record<string, any> = {
      bookingId,
      customerName: req.nextUrl.searchParams.get('customerName'),
      from: req.nextUrl.searchParams.get('from'),
      to: req.nextUrl.searchParams.get('to'),
      date: req.nextUrl.searchParams.get('date'),
      transportType: req.nextUrl.searchParams.get('transportType'),
      amount: req.nextUrl.searchParams.get('amount'),
      message: req.nextUrl.searchParams.get('message')
    };

    // TODO: If you have a database, fetch booking details here
    // const bookingDetails = await getBookingById(bookingId);

    const twiml = generateTwiML(callType, data);

    console.log('Generated TwiML for call type:', callType);

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  } catch (error: any) {
    console.error('TwiML generation error:', error);

    // Fallback TwiML in case of error
    const fallbackTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-IN">Hello from TravixAI. We're experiencing technical difficulties. Please try again later.</Say>
</Response>`;

    return new NextResponse(fallbackTwiml, {
      headers: {
        'Content-Type': 'text/xml'
      }
    });
  }
}

/**
 * GET endpoint for testing TwiML generation
 */
export async function GET(req: NextRequest) {
  const callType = req.nextUrl.searchParams.get('type') || 'custom';
  const bookingId = req.nextUrl.searchParams.get('bookingId');

  const data: Record<string, any> = {
    bookingId,
    customerName: req.nextUrl.searchParams.get('customerName') || 'John Doe',
    from: req.nextUrl.searchParams.get('from') || 'Mumbai',
    to: req.nextUrl.searchParams.get('to') || 'Delhi',
    date: req.nextUrl.searchParams.get('date') || '2024-12-25',
    transportType: req.nextUrl.searchParams.get('transportType') || 'Flight',
    amount: req.nextUrl.searchParams.get('amount') || '10000',
    message: req.nextUrl.searchParams.get('message') || 'Test message'
  };

  const twiml = generateTwiML(callType, data);

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml'
    }
  });
}
