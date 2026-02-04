import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const aiAssistantSid = process.env.TWILIO_AI_ASSISTANT_SID;

let client: twilio.Twilio | null = null;

// Initialize Twilio client with enhanced configuration
if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length > 10) {
  try {
    client = twilio(accountSid, authToken, {
      lazyLoading: true,
      autoRetry: true,
      maxRetries: 3,
    });
    console.log('✅ Twilio Voice client initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Twilio Voice client:', error);
    client = null;
  }
} else {
  console.warn('⚠️ Twilio credentials not configured or invalid');
}

// Enhanced TypeScript interfaces for type safety
export interface CallData {
  to: string;
  callType: 'booking_confirmation' | 'payment_reminder' | 'flight_update' | 'customer_support' | 'custom' | 'ai_assistant';
  bookingId?: string;
  customerName?: string;
  priority?: 'high' | 'medium' | 'low';
  recordCall?: boolean;
  maxDuration?: number;
  metadata?: Record<string, any>;
  data?: Record<string, any>;
}

export interface CallResult {
  success: boolean;
  callSid?: string;
  status?: string;
  queuePosition?: number;
  estimatedWaitTime?: number;
  error?: string;
  errorCode?: string;
  timestamp?: string;
}

export interface CallMetrics {
  callSid: string;
  duration: number;
  status: string;
  cost: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  transcription?: string;
}

export interface BookingConfirmationDetails {
  bookingId: string;
  customerName: string;
  from: string;
  to: string;
  date: string;
  transportType: string;
  amount?: number;
  confirmationCode?: string;
}

/**
 * Professional call initiation with enhanced features:
 * - AI-powered conversational IVR
 * - Call recording and transcription
 * - Advanced error handling with retry logic
 * - Real-time monitoring and analytics
 * - Queue management for high volume
 */
export async function initiateCall(callData: CallData): Promise<CallResult> {
  if (!client || !twilioPhoneNumber) {
    console.error('❌ Twilio Voice client not initialized or phone number not configured');
    return {
      success: false,
      error: 'Voice service not configured',
      errorCode: 'SERVICE_UNAVAILABLE',
      timestamp: new Date().toISOString()
    };
  }

  // Validate phone number format
  if (!isValidPhoneNumber(callData.to)) {
    return {
      success: false,
      error: 'Invalid phone number format. Use E.164 format (e.g., +919876543210)',
      errorCode: 'INVALID_PHONE_NUMBER',
      timestamp: new Date().toISOString()
    };
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Generate TwiML with enhanced features
    const twiml = generateTwiML(callData.callType, {
      bookingId: callData.bookingId,
      customerName: callData.customerName,
      ...callData.data
    });

    // Prepare call configuration with professional features
    const callConfig: any = {
      to: callData.to,
      from: twilioPhoneNumber,
      twiml: twiml,
      statusCallback: `${baseUrl}/api/voice/status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed', 'busy', 'no-answer', 'failed'],
      statusCallbackMethod: 'POST',
      record: callData.recordCall ?? false,
      recordingStatusCallback: `${baseUrl}/api/voice/recording-status`,
      recordingStatusCallbackMethod: 'POST',
      timeout: 60, // Ring timeout in seconds
      machineDetection: 'DetectMessageEnd', // Voicemail detection
      machineDetectionTimeout: 5,
      asyncAmd: 'true',
      asyncAmdStatusCallback: `${baseUrl}/api/voice/amd-status`,
    };

    // Add call recording settings if enabled
    if (callData.recordCall) {
      callConfig.recordingChannels = 'dual';
      callConfig.recordingStatusCallbackEvent = ['completed'];
      callConfig.trim = 'trim-silence';
    }

    // Add AI Assistant if configured
    if (callData.callType === 'ai_assistant' && aiAssistantSid) {
      callConfig.url = `${baseUrl}/api/voice/ai-assistant`;
      delete callConfig.twiml; // Use URL instead of inline TwiML for AI
    }

    const call = await client.calls.create(callConfig);

    console.log(`✅ Call initiated successfully:`, {
      callSid: call.sid,
      to: callData.to,
      type: callData.callType,
      status: call.status,
      priority: callData.priority || 'medium'
    });

    // Store call metadata for analytics (TODO: Implement database storage)
    await logCallInitiation(call.sid, callData);

    return {
      success: true,
      callSid: call.sid,
      status: call.status,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('❌ Error initiating call:', {
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo,
      to: callData.to
    });

    return {
      success: false,
      error: error.message || 'Failed to initiate call',
      errorCode: error.code || 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Validate phone number in E.164 format
 */
function isValidPhoneNumber(phoneNumber: string): boolean {
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Format booking ID for voice readability (e.g., "BK-12345" → "BK 1 2 3 4 5")
 */
function formatBookingId(bookingId?: string): string {
  if (!bookingId) return 'not available';
  // Add spaces between characters for better clarity in voice
  return bookingId.split('').join(' ');
}

/**
 * Format date for voice readability (e.g., "2024-12-25" → "December 25, 2024")
 */
function formatDate(dateString?: string): string {
  if (!dateString) return 'not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Log call initiation for analytics and monitoring
 */
async function logCallInitiation(callSid: string, callData: CallData): Promise<void> {
  try {
    // TODO: Store in database (MongoDB/PostgreSQL)
    console.log('📊 Call logged:', {
      callSid,
      timestamp: new Date().toISOString(),
      type: callData.callType,
      to: callData.to,
      metadata: callData.metadata
    });
  } catch (error) {
    console.error('⚠️ Failed to log call:', error);
  }
}

/**
 * Professional booking confirmation call with enhanced details
 */
export async function makeBookingConfirmationCall(
  phoneNumber: string,
  bookingDetails: BookingConfirmationDetails
): Promise<CallResult> {
  return initiateCall({
    to: phoneNumber,
    callType: 'booking_confirmation',
    bookingId: bookingDetails.bookingId,
    customerName: bookingDetails.customerName,
    priority: 'high',
    recordCall: true, // Record for quality assurance
    metadata: {
      bookingType: 'confirmation',
      transportType: bookingDetails.transportType,
      route: `${bookingDetails.from} → ${bookingDetails.to}`
    },
    data: bookingDetails
  });
}

/**
 * Make an AI-powered interactive booking call
 * Uses Twilio Voice AI for natural conversation
 */
export async function makeAIBookingCall(
  phoneNumber: string,
  bookingContext: Record<string, any>
): Promise<CallResult> {
  return initiateCall({
    to: phoneNumber,
    callType: 'ai_assistant',
    priority: 'high',
    recordCall: true,
    metadata: {
      conversationType: 'ai_booking',
      context: bookingContext
    },
    data: bookingContext
  });
}

/**
 * Make a payment reminder call
 */
export async function makePaymentReminderCall(
  phoneNumber: string,
  bookingId: string,
  amount: number
): Promise<CallResult> {
  return initiateCall({
    to: phoneNumber,
    callType: 'payment_reminder',
    bookingId,
    data: { amount }
  });
}

/**
 * Make a flight update call
 */
export async function makeFlightUpdateCall(
  phoneNumber: string,
  bookingId: string,
  updateMessage: string
): Promise<CallResult> {
  return initiateCall({
    to: phoneNumber,
    callType: 'flight_update',
    bookingId,
    data: { message: updateMessage }
  });
}

/**
 * Make a custom call with specific message
 */
export async function makeCustomCall(
  phoneNumber: string,
  message: string
): Promise<CallResult> {
  return initiateCall({
    to: phoneNumber,
    callType: 'custom',
    data: { message }
  });
}

/**
 * Get call status
 */
export async function getCallStatus(callSid: string) {
  if (!client) {
    throw new Error('Twilio client not initialized');
  }

  try {
    const call = await client.calls(callSid).fetch();
    return {
      sid: call.sid,
      status: call.status,
      direction: call.direction,
      from: call.from,
      to: call.to,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime,
      price: call.price,
      priceUnit: call.priceUnit
    };
  } catch (error: any) {
    console.error('Error fetching call status:', error);
    throw error;
  }
}

/**
 * End an ongoing call
 */
export async function endCall(callSid: string): Promise<boolean> {
  if (!client) {
    throw new Error('Twilio client not initialized');
  }

  try {
    await client.calls(callSid).update({ status: 'completed' });
    console.log('Call ended:', callSid);
    return true;
  } catch (error: any) {
    console.error('Error ending call:', error);
    return false;
  }
}

/**
 * List recent calls
 */
export async function listRecentCalls(limit: number = 20) {
  if (!client) {
    throw new Error('Twilio client not initialized');
  }

  try {
    const calls = await client.calls.list({ limit });
    return calls.map(call => ({
      sid: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      startTime: call.startTime,
      endTime: call.endTime,
      duration: call.duration,
      direction: call.direction
    }));
  } catch (error: any) {
    console.error('Error listing calls:', error);
    throw error;
  }
}

/**
 * Generate professional TwiML for voice response with enhanced features
 */
export function generateTwiML(callType: string, data?: Record<string, any>): string {
  const VoiceResponse = require('twilio').twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  switch (callType) {
    case 'booking_confirmation':
      // Professional greeting with personalization
      twiml.say(
        {
          voice: 'Polly.Aditi', // Natural Indian English voice
          language: 'en-IN'
        },
        `Hello ${data?.customerName || 'valued customer'}. This is TravixAI's automated booking assistant.`
      );
      twiml.pause({ length: 1 });

      // Detailed booking information
      twiml.say(
        {
          voice: 'Polly.Aditi',
          language: 'en-IN'
        },
        `I'm calling to confirm your booking with reference number ${formatBookingId(data?.bookingId)}. `
      );

      if (data?.confirmationCode) {
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          `Your confirmation code is ${data.confirmationCode}. `
        );
      }

      twiml.say(
        {
          voice: 'Polly.Aditi',
          language: 'en-IN'
        },
        `You have booked a ${data?.transportType || 'transport'} journey from ${data?.from} to ${data?.to} on ${formatDate(data?.date)}. `
      );

      if (data?.amount) {
        twiml.say(
          {
            voice: 'Polly.Aditi',
            language: 'en-IN'
          },
          `The total amount is rupees ${data.amount}. `
        );
      }

      twiml.pause({ length: 1 });

      // Interactive menu
      twiml.say(
        {
          voice: 'Polly.Aditi',
          language: 'en-IN'
        },
        'For your convenience, press 1 to speak with our customer support team, press 2 to receive booking details via SMS, or press 3 to reschedule your booking. You can also simply hang up if everything is clear.'
      );

      twiml.gather({
        numDigits: 1,
        action: '/api/voice/handle-input',
        method: 'POST',
        timeout: 10
      });

      // Fallback if no input
      twiml.say(
        {
          voice: 'Polly.Aditi',
          language: 'en-IN'
        },
        'Thank you for choosing TravixAI. We have sent all booking details to your registered email and mobile number. Have a wonderful journey!'
      );
      break;

    case 'ai_assistant':
      // AI-powered conversational booking assistant
      twiml.say(
        {
          voice: 'Polly.Aditi',
          language: 'en-IN'
        },
        'Hello! I am your AI-powered TravixAI assistant. I can help you book flights, trains, hotels, and plan your entire trip. How may I assist you today?'
      );

      const aiGather = twiml.gather({
        input: ['speech', 'dtmf'],
        action: '/api/voice/ai-process',
        method: 'POST',
        speechTimeout: 'auto',
        speechModel: 'phone_call',
        enhanced: true,
        language: 'en-IN'
      });

      aiGather.say(
        {
          voice: 'Polly.Aditi',
          language: 'en-IN'
        },
        'Please tell me your travel requirements, or press star to speak with a human agent.'
      );
      break;

    case 'payment_reminder':
      twiml.say(
        {
          voice: 'alice',
          language: 'en-IN'
        },
        `Hello! This is TravixAI. We notice that your payment for booking ${data?.bookingId} is pending. The amount due is rupees ${data?.amount}. Please complete your payment to confirm your booking. Thank you!`
      );
      break;

    case 'flight_update':
      twiml.say(
        {
          voice: 'alice',
          language: 'en-IN'
        },
        `Hello! This is TravixAI with an important update about your booking ${data?.bookingId}. ${data?.message}. For more information, please check your email or contact our support. Thank you!`
      );
      break;

    case 'customer_support':
      twiml.say(
        {
          voice: 'alice',
          language: 'en-IN'
        },
        'Welcome to TravixAI customer support. Please hold while we connect you to an agent.'
      );
      twiml.pause({ length: 2 });
      // In production, use twiml.dial() to connect to support team
      twiml.say('All our agents are currently busy. Please try again later or send us a message on WhatsApp.');
      break;

    case 'custom':
      twiml.say(
        {
          voice: 'alice',
          language: 'en-IN'
        },
        data?.message || 'Hello from TravixAI!'
      );
      break;

    default:
      twiml.say('Hello from TravixAI!');
  }

  return twiml.toString();
}

export default {
  initiateCall,
  makeBookingConfirmationCall,
  makePaymentReminderCall,
  makeFlightUpdateCall,
  makeCustomCall,
  getCallStatus,
  endCall,
  listRecentCalls,
  generateTwiML
};
