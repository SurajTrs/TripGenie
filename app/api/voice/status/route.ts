import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook to receive call status updates from Twilio
 * This tracks the lifecycle of voice calls
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const duration = formData.get('CallDuration') as string;
    const timestamp = formData.get('Timestamp') as string;

    console.log('Call Status Update:', {
      callSid,
      callStatus,
      from,
      to,
      duration,
      timestamp
    });

    // TODO: Store call status in database
    // await updateCallStatus(callSid, {
    //   status: callStatus,
    //   duration: duration ? parseInt(duration) : null,
    //   timestamp: new Date(timestamp)
    // });

    // Handle specific call statuses
    switch (callStatus) {
      case 'initiated':
        console.log(`Call ${callSid} initiated to ${to}`);
        break;

      case 'ringing':
        console.log(`Call ${callSid} is ringing`);
        break;

      case 'in-progress':
        console.log(`Call ${callSid} answered`);
        break;

      case 'completed':
        console.log(`Call ${callSid} completed. Duration: ${duration}s`);
        break;

      case 'busy':
        console.log(`Call ${callSid} - User busy`);
        break;

      case 'no-answer':
        console.log(`Call ${callSid} - No answer`);
        break;

      case 'canceled':
        console.log(`Call ${callSid} - Canceled`);
        break;

      case 'failed':
        console.log(`Call ${callSid} - Failed`);
        break;

      default:
        console.log(`Call ${callSid} - Unknown status: ${callStatus}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Call status webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for webhook verification
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'Voice status webhook is active',
    timestamp: new Date().toISOString()
  });
}
