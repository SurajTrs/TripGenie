import { NextRequest, NextResponse } from 'next/server';

/**
 * Handle DTMF input from voice calls
 * Processes user menu selections and routes accordingly
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const digits = formData.get('Digits') as string;
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;

    console.log('📞 DTMF Input:', { callSid, digits, from });

    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    // Route based on user input
    switch (digits) {
      case '1':
        // Transfer to customer support
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'Connecting you to our customer support team. Please hold.'
        );

        twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');

        // Queue the call for support team
        twiml.dial({
          action: '/api/voice/dial-status',
          method: 'POST'
        }).queue({
          name: 'customer-support',
          url: '/api/voice/queue-wait'
        });
        break;

      case '2':
        // Send SMS with booking details
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'We are sending your booking details and confirmation to your registered mobile number via SMS. You should receive it within a few moments.'
        );

        // TODO: Trigger SMS sending via Twilio SMS API
        await sendBookingDetailsSMS(from);

        twiml.pause({ length: 1 });

        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'Is there anything else I can help you with? Press 1 to speak with support, or simply hang up. Thank you for choosing TravixAI!'
        );
        break;

      case '3':
        // Reschedule booking
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'To reschedule your booking, you will need to speak with one of our travel consultants who can check real-time availability. Connecting you now.'
        );

        twiml.dial({
          action: '/api/voice/dial-status',
          method: 'POST'
        }).queue('booking-support');
        break;

      case '9':
        // Repeat menu
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'Let me repeat the options. Press 1 to speak with customer support, press 2 to receive booking details via SMS, or press 3 to reschedule your booking.'
        );

        twiml.gather({
          numDigits: 1,
          action: '/api/voice/handle-input',
          method: 'POST',
          timeout: 10
        });
        break;

      case '0':
        // Main menu
        twiml.redirect('/api/voice/twiml?type=customer_support');
        break;

      default:
        // Invalid input
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'Sorry, that is not a valid option. Please try again.'
        );

        twiml.pause({ length: 1 });

        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'Press 1 for customer support, press 2 for SMS with booking details, or press 3 to reschedule. Press 9 to hear these options again.'
        );

        twiml.gather({
          numDigits: 1,
          action: '/api/voice/handle-input',
          method: 'POST',
          timeout: 10
        });

        // If still no input, thank and end call
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          'Thank you for calling TravixAI. Goodbye!'
        );

        twiml.hangup();
        break;
    }

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    });

  } catch (error: any) {
    console.error('❌ Error handling input:', error);

    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const twiml = new VoiceResponse();

    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      'We are experiencing technical difficulties. Please try again later. Thank you!'
    );

    twiml.hangup();

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}

/**
 * Send booking details via SMS
 */
async function sendBookingDetailsSMS(phoneNumber: string): Promise<void> {
  try {
    // TODO: Implement Twilio SMS sending
    console.log('📱 Sending SMS to:', phoneNumber);

    // Example implementation:
    // const twilio = require('twilio');
    // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //   body: 'Your TravixAI booking details...',
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
  } catch (error) {
    console.error('⚠️ Failed to send SMS:', error);
  }
}

/**
 * GET endpoint for testing
 */
export async function GET() {
  return NextResponse.json({
    status: 'Voice input handler is active',
    supportedOptions: {
      '1': 'Transfer to customer support',
      '2': 'Send booking details via SMS',
      '3': 'Reschedule booking',
      '9': 'Repeat menu options',
      '0': 'Return to main menu'
    },
    timestamp: new Date().toISOString()
  });
}
