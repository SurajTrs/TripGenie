import { NextRequest, NextResponse } from 'next/server';
import {
  initiateCall,
  makeBookingConfirmationCall,
  makePaymentReminderCall,
  makeFlightUpdateCall,
  makeCustomCall
} from '../../../../lib/voiceCall';

/**
 * API endpoint to initiate voice calls
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { callType, phoneNumber, data } = body;

    // Validate required fields
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!callType) {
      return NextResponse.json(
        { error: 'Call type is required' },
        { status: 400 }
      );
    }

    // Validate phone number format (should be in E.164 format: +1234567890)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format (e.g., +919876543210)' },
        { status: 400 }
      );
    }

    let result;

    // Route to appropriate call function based on type
    switch (callType) {
      case 'booking_confirmation':
        if (!data?.bookingId || !data?.customerName) {
          return NextResponse.json(
            { error: 'Booking details are required for booking confirmation calls' },
            { status: 400 }
          );
        }
        result = await makeBookingConfirmationCall(phoneNumber, {
          bookingId: data.bookingId,
          customerName: data.customerName,
          from: data.from || 'N/A',
          to: data.to || 'N/A',
          date: data.date || 'N/A',
          transportType: data.transportType || 'transport'
        });
        break;

      case 'payment_reminder':
        if (!data?.bookingId || !data?.amount) {
          return NextResponse.json(
            { error: 'Booking ID and amount are required for payment reminder calls' },
            { status: 400 }
          );
        }
        result = await makePaymentReminderCall(phoneNumber, data.bookingId, data.amount);
        break;

      case 'flight_update':
        if (!data?.bookingId || !data?.message) {
          return NextResponse.json(
            { error: 'Booking ID and message are required for flight update calls' },
            { status: 400 }
          );
        }
        result = await makeFlightUpdateCall(phoneNumber, data.bookingId, data.message);
        break;

      case 'custom':
        if (!data?.message) {
          return NextResponse.json(
            { error: 'Message is required for custom calls' },
            { status: 400 }
          );
        }
        result = await makeCustomCall(phoneNumber, data.message);
        break;

      default:
        return NextResponse.json(
          { error: `Unknown call type: ${callType}` },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Call initiated successfully',
        callSid: result.callSid,
        status: result.status
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to initiate call' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Call initiation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if voice service is available
 */
export async function GET(req: NextRequest) {
  const hasConfig = !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  return NextResponse.json({
    available: hasConfig,
    message: hasConfig
      ? 'Voice call service is configured and ready'
      : 'Voice call service is not configured. Please add TWILIO_PHONE_NUMBER to your environment variables.',
    timestamp: new Date().toISOString()
  });
}
