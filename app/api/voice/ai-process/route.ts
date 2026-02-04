import { NextRequest, NextResponse } from 'next/server';

/**
 * AI Voice Processing Endpoint
 * Handles speech input from callers and processes booking requests using AI
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract Twilio voice parameters
    const speechResult = formData.get('SpeechResult') as string;
    const confidence = formData.get('Confidence') as string;
    const callSid = formData.get('CallSid') as string;
    const digits = formData.get('Digits') as string;

    console.log('🎤 AI Voice Input:', {
      callSid,
      speechResult,
      confidence: parseFloat(confidence || '0'),
      digits
    });

    // Handle DTMF input (star key to transfer to human agent)
    if (digits === '*') {
      return handleTransferToAgent(callSid);
    }

    // Process speech input with AI
    if (speechResult) {
      return await processAIBookingRequest(speechResult, callSid, parseFloat(confidence || '0'));
    }

    // No input received
    return generateNoInputResponse();

  } catch (error: any) {
    console.error('❌ AI processing error:', error);
    return generateErrorResponse();
  }
}

/**
 * Process booking request using AI (OpenAI/Claude)
 */
async function processAIBookingRequest(
  speechInput: string,
  callSid: string,
  confidence: number
): Promise<NextResponse> {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // Low confidence - ask for clarification
  if (confidence < 0.7) {
    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      "I'm sorry, I didn't quite catch that. Could you please repeat your travel requirements?"
    );

    twiml.gather({
      input: ['speech'],
      action: '/api/voice/ai-process',
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'phone_call',
      enhanced: true,
      language: 'en-IN'
    });

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' }
    });
  }

  // TODO: Integrate with OpenAI/Claude for natural language processing
  // For now, use basic keyword detection
  const lowerInput = speechInput.toLowerCase();

  // Detect booking intent
  if (lowerInput.includes('book') || lowerInput.includes('flight') || lowerInput.includes('train')) {
    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      `Great! I understood that you want to book travel. To help you better, I'll connect you with our booking specialist who can access real-time availability and prices.`
    );

    twiml.pause({ length: 1 });

    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      'Alternatively, you can visit our website or mobile app for instant booking with live prices and availability. We are transferring you now.'
    );

    // Transfer to customer support queue
    twiml.dial({
      action: '/api/voice/dial-status',
      method: 'POST'
    }).queue('booking-support');

  } else if (lowerInput.includes('cancel') || lowerInput.includes('refund')) {
    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      'I understand you need help with a cancellation or refund. Please have your booking reference number ready. Connecting you to our support team.'
    );

    twiml.dial({
      action: '/api/voice/dial-status',
      method: 'POST'
    }).queue('support');

  } else if (lowerInput.includes('status') || lowerInput.includes('check')) {
    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      'To check your booking status, please press 1 for flight status, 2 for train status, or 3 for hotel reservation status.'
    );

    twiml.gather({
      numDigits: 1,
      action: '/api/voice/handle-status-check',
      method: 'POST',
      timeout: 10
    });

  } else {
    // Generic response
    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      'Thank you for calling TravixAI. For the best experience, please visit our website at trip genie dot com or download our mobile app. Our AI assistant there can help you book instantly with real-time pricing.'
    );

    twiml.pause({ length: 1 });

    twiml.say(
      {
        voice: 'Polly.Aditi',
        language: 'en-IN'
      },
      'Would you like me to send you a download link via SMS? Press 1 for yes, or 2 to speak with an agent.'
    );

    twiml.gather({
      numDigits: 1,
      action: '/api/voice/handle-input',
      method: 'POST',
      timeout: 10
    });
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  });
}

/**
 * Transfer call to human agent
 */
function handleTransferToAgent(callSid: string): NextResponse {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say(
    {
      voice: 'Polly.Aditi',
      language: 'en-IN'
    },
    'Connecting you to our customer support team. Please stay on the line.'
  );

  // Play hold music while connecting
  twiml.play('http://com.twilio.sounds.music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.mp3');

  // Dial customer support (configure your support number)
  const supportNumber = process.env.CUSTOMER_SUPPORT_PHONE_NUMBER;
  if (supportNumber) {
    twiml.dial({
      action: '/api/voice/dial-status',
      method: 'POST',
      timeout: 30
    }, supportNumber);
  } else {
    // If no support number, queue the call
    twiml.dial().queue('customer-support');
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  });
}

/**
 * Handle no input scenario
 */
function generateNoInputResponse(): NextResponse {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say(
    {
      voice: 'Polly.Aditi',
      language: 'en-IN'
    },
    "I didn't receive any input. For assistance, please call us back or visit our website. Thank you for calling TravixAI. Goodbye!"
  );

  twiml.hangup();

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  });
}

/**
 * Handle errors gracefully
 */
function generateErrorResponse(): NextResponse {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say(
    {
      voice: 'Polly.Aditi',
      language: 'en-IN'
    },
    "We're experiencing technical difficulties. Please try again later or visit our website at trip genie dot com. Thank you!"
  );

  twiml.hangup();

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' }
  });
}

/**
 * GET endpoint for testing
 */
export async function GET() {
  return NextResponse.json({
    status: 'AI Voice Processing endpoint is active',
    features: [
      'Speech recognition',
      'Natural language processing',
      'Intent detection',
      'Agent transfer',
      'Multi-language support'
    ],
    timestamp: new Date().toISOString()
  });
}
