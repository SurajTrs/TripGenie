/**
 * AI Assistant Integration for TravixAI
 * Powered by OpenAI GPT-4 or Claude API
 * Natural language understanding for travel bookings
 */

import OpenAI from 'openai';
import { chatWithGemini } from './gemini';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Claude API configuration (alternative)
const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface BookingIntent {
  intent: 'search_flight' | 'search_hotel' | 'search_train' | 'search_bus' | 'book' | 'modify' | 'cancel' | 'inquiry' | 'chitchat';
  confidence: number;
  entities: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    passengers?: number;
    travelClass?: string;
    hotelName?: string;
    checkInDate?: string;
    checkOutDate?: string;
    rooms?: number;
    transportType?: 'flight' | 'train' | 'bus' | 'hotel';
    budget?: string;
    preferences?: string[];
  };
  response: string;
  suggestions?: string[];
  requiresMoreInfo?: boolean;
  missingFields?: string[];
}

export interface AIResponse {
  success: boolean;
  intent: BookingIntent;
  conversationContext: ConversationMessage[];
  error?: string;
}

// ============================================================================
// SYSTEM PROMPT - Defines AI Assistant Personality & Capabilities
// ============================================================================

const SYSTEM_PROMPT = `You are TravixAI, an expert AI travel booking assistant. Your role is to help users search and book flights, hotels, trains, and buses with a professional, friendly, and helpful attitude.

**Your Capabilities:**
1. Search for flights, hotels, trains, and buses
2. Understand natural language travel queries
3. Extract booking details (dates, locations, passengers, preferences)
4. Provide recommendations based on user preferences
5. Handle booking modifications and cancellations
6. Answer travel-related questions

**Important Guidelines:**
1. Always be polite, professional, and concise
2. Ask clarifying questions for missing information (one at a time)
3. Provide options when available
4. Use Indian context (INR currency, Indian cities, IRCTC for trains)
5. Format dates as YYYY-MM-DD for system processing
6. Extract IATA codes for airports (DEL for Delhi, BOM for Mumbai, etc.)
7. If user asks about something you can't help with, politely redirect

**Response Format:**
- Provide clear, actionable responses
- Use bullet points for options
- Keep responses under 150 words
- Always suggest next steps

**Examples:**
User: "I want to go to Goa next week"
Response: "Great! I can help you book a trip to Goa. To find the best options, I need a few details:
• Which city are you traveling from?
• How many passengers?
• Do you prefer flight, train, or bus?
• Are you also looking for hotel accommodation?"

User: "Flight from Delhi to Mumbai on December 25"
Response: "Perfect! I'll search for flights from Delhi to Mumbai on December 25th.
• How many passengers are traveling?
• Do you need a return flight? If yes, what date?
• Which class do you prefer? (Economy, Business, First)

Once you provide these details, I'll show you the best available options with live pricing."`;

// ============================================================================
// OPENAI GPT-4 IMPLEMENTATION
// ============================================================================

export async function chatWithOpenAI(
  userMessage: string,
  conversationHistory: ConversationMessage[] = []
): Promise<AIResponse> {
  if (!openai) {
    return {
      success: false,
      intent: {
        intent: 'chitchat',
        confidence: 0,
        entities: {},
        response: 'AI service is not configured. Please add OPENAI_API_KEY to your environment.',
        requiresMoreInfo: false,
      },
      conversationContext: [],
      error: 'OpenAI API key not configured',
    };
  }

  try {
    console.log('🤖 Processing with OpenAI GPT-4...');

    // Build conversation context
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API with function calling for intent extraction
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // or 'gpt-4' or 'gpt-3.5-turbo'
      messages: messages,
      functions: [
        {
          name: 'extract_booking_intent',
          description: 'Extract travel booking intent and entities from user message',
          parameters: {
            type: 'object',
            properties: {
              intent: {
                type: 'string',
                enum: ['search_flight', 'search_hotel', 'search_train', 'search_bus', 'book', 'modify', 'cancel', 'inquiry', 'chitchat'],
                description: 'The primary intent of the user message',
              },
              confidence: {
                type: 'number',
                description: 'Confidence score between 0 and 1',
              },
              entities: {
                type: 'object',
                properties: {
                  origin: { type: 'string', description: 'Origin city or IATA code' },
                  destination: { type: 'string', description: 'Destination city or IATA code' },
                  departureDate: { type: 'string', description: 'Departure date in YYYY-MM-DD format' },
                  returnDate: { type: 'string', description: 'Return date in YYYY-MM-DD format' },
                  passengers: { type: 'number', description: 'Number of passengers' },
                  travelClass: { type: 'string', description: 'Travel class (economy, business, first)' },
                  transportType: { type: 'string', enum: ['flight', 'train', 'bus', 'hotel'] },
                  checkInDate: { type: 'string', description: 'Hotel check-in date' },
                  checkOutDate: { type: 'string', description: 'Hotel check-out date' },
                  rooms: { type: 'number', description: 'Number of hotel rooms' },
                  budget: { type: 'string', description: 'Budget preference (luxury, mid-range, budget)' },
                  preferences: { type: 'array', items: { type: 'string' }, description: 'User preferences' },
                },
              },
              requiresMoreInfo: {
                type: 'boolean',
                description: 'Whether more information is needed from user',
              },
              missingFields: {
                type: 'array',
                items: { type: 'string' },
                description: 'List of missing required fields',
              },
            },
            required: ['intent', 'confidence', 'entities'],
          },
        },
      ],
      function_call: { name: 'extract_booking_intent' },
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseMessage = completion.choices[0].message;
    const functionCall = responseMessage.function_call;

    let intent: BookingIntent;

    if (functionCall && functionCall.arguments) {
      const parsedIntent = JSON.parse(functionCall.arguments);

      // Get natural language response
      const naturalResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          ...messages,
          { role: 'assistant', content: functionCall.arguments },
        ],
        temperature: 0.8,
        max_tokens: 300,
      });

      intent = {
        ...parsedIntent,
        response: naturalResponse.choices[0].message.content || 'I can help you with that!',
      };
    } else {
      intent = {
        intent: 'chitchat',
        confidence: 0.5,
        entities: {},
        response: responseMessage.content || 'I can help you book your travel. What are you looking for?',
        requiresMoreInfo: false,
      };
    }

    // Update conversation history
    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage, timestamp: new Date() },
      { role: 'assistant' as const, content: intent.response, timestamp: new Date() },
    ];

    console.log('✅ OpenAI processing complete:', intent.intent);

    return {
      success: true,
      intent,
      conversationContext: updatedHistory,
    };
  } catch (error: any) {
    console.error('❌ OpenAI error:', error);
    return {
      success: false,
      intent: {
        intent: 'chitchat',
        confidence: 0,
        entities: {},
        response: 'I apologize, but I encountered an error processing your request. Please try again.',
        requiresMoreInfo: false,
      },
      conversationContext: conversationHistory,
      error: error.message,
    };
  }
}

// ============================================================================
// CLAUDE API IMPLEMENTATION (Alternative)
// ============================================================================

export async function chatWithClaude(
  userMessage: string,
  conversationHistory: ConversationMessage[] = []
): Promise<AIResponse> {
  if (!CLAUDE_API_KEY) {
    return {
      success: false,
      intent: {
        intent: 'chitchat',
        confidence: 0,
        entities: {},
        response: 'AI service is not configured. Please add ANTHROPIC_API_KEY to your environment.',
        requiresMoreInfo: false,
      },
      conversationContext: [],
      error: 'Claude API key not configured',
    };
  }

  try {
    console.log('🤖 Processing with Claude...');

    // Build conversation for Claude
    const messages = conversationHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    messages.push({
      role: 'user',
      content: userMessage,
    });

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229', // or claude-3-sonnet-20240229
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    // Extract intent using pattern matching (simpler than OpenAI's function calling)
    const intent = extractIntentFromResponse(assistantMessage, userMessage);

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: userMessage, timestamp: new Date() },
      { role: 'assistant' as const, content: assistantMessage, timestamp: new Date() },
    ];

    console.log('✅ Claude processing complete');

    return {
      success: true,
      intent: {
        ...intent,
        response: assistantMessage,
      },
      conversationContext: updatedHistory,
    };
  } catch (error: any) {
    console.error('❌ Claude error:', error);
    return {
      success: false,
      intent: {
        intent: 'chitchat',
        confidence: 0,
        entities: {},
        response: 'I apologize, but I encountered an error. Please try again.',
        requiresMoreInfo: false,
      },
      conversationContext: conversationHistory,
      error: error.message,
    };
  }
}

// ============================================================================
// FALLBACK: RULE-BASED INTENT EXTRACTION
// ============================================================================

function extractIntentFromResponse(response: string, userMessage: string): Omit<BookingIntent, 'response'> {
  const lowerMessage = userMessage.toLowerCase();
  const entities: BookingIntent['entities'] = {};

  // Detect intent
  let intent: BookingIntent['intent'] = 'chitchat';
  let confidence = 0.5;

  if (lowerMessage.match(/\b(flight|fly|plane|airline)\b/)) {
    intent = 'search_flight';
    confidence = 0.8;
    entities.transportType = 'flight';
  } else if (lowerMessage.match(/\b(hotel|accommodation|stay|room)\b/)) {
    intent = 'search_hotel';
    confidence = 0.8;
    entities.transportType = 'hotel';
  } else if (lowerMessage.match(/\b(train|railway)\b/)) {
    intent = 'search_train';
    confidence = 0.8;
    entities.transportType = 'train';
  } else if (lowerMessage.match(/\b(bus|coach)\b/)) {
    intent = 'search_bus';
    confidence = 0.8;
    entities.transportType = 'bus';
  } else if (lowerMessage.match(/\b(book|reserve|confirm)\b/)) {
    intent = 'book';
    confidence = 0.7;
  } else if (lowerMessage.match(/\b(cancel|refund)\b/)) {
    intent = 'cancel';
    confidence = 0.7;
  } else if (lowerMessage.match(/\b(modify|change|reschedule)\b/)) {
    intent = 'modify';
    confidence = 0.7;
  }

  // Extract entities using regex patterns
  const datePattern = /(\d{4}-\d{2}-\d{2})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g;
  const dates = userMessage.match(datePattern);
  if (dates && dates.length > 0) {
    entities.departureDate = dates[0];
    if (dates.length > 1) {
      entities.returnDate = dates[1];
    }
  }

  // Extract passenger count
  const passengerMatch = userMessage.match(/(\d+)\s*(passenger|people|person|adult|pax)/i);
  if (passengerMatch) {
    entities.passengers = parseInt(passengerMatch[1]);
  }

  // Check if more info is needed
  const requiresMoreInfo = response.includes('?') || response.includes('need') || response.includes('provide');
  const missingFields: string[] = [];

  if (intent !== 'chitchat' && !entities.origin) missingFields.push('origin');
  if (intent !== 'chitchat' && !entities.destination) missingFields.push('destination');
  if (intent.includes('search') && !entities.departureDate) missingFields.push('departureDate');

  return {
    intent,
    confidence,
    entities,
    requiresMoreInfo,
    missingFields: missingFields.length > 0 ? missingFields : undefined,
  };
}

// ============================================================================
// UNIFIED CHAT FUNCTION - Auto-selects best available AI
// ============================================================================

export async function chatWithAI(
  userMessage: string,
  conversationHistory: ConversationMessage[] = [],
  preferredProvider: 'openai' | 'claude' | 'gemini' | 'auto' = 'auto'
): Promise<AIResponse> {
  // Auto-select based on available API keys
  if (preferredProvider === 'auto') {
    if (GEMINI_API_KEY) {
      try {
        const geminiResponse = await chatWithGemini(userMessage, conversationHistory);
        const intent = extractIntentFromResponse(geminiResponse.response, userMessage);
        return {
          success: true,
          intent: { ...intent, response: geminiResponse.response },
          conversationContext: geminiResponse.conversationContext,
        };
      } catch (error: any) {
        console.error('Gemini failed, trying fallback:', error);
      }
    }
    if (openai) {
      return chatWithOpenAI(userMessage, conversationHistory);
    } else if (CLAUDE_API_KEY) {
      return chatWithClaude(userMessage, conversationHistory);
    } else {
      return {
        success: false,
        intent: {
          intent: 'chitchat',
          confidence: 0,
          entities: {},
          response: 'Please configure GEMINI_API_KEY, OPENAI_API_KEY or ANTHROPIC_API_KEY to use the AI assistant.',
          requiresMoreInfo: false,
        },
        conversationContext: [],
        error: 'No AI provider configured',
      };
    }
  }

  // Use specified provider
  if (preferredProvider === 'gemini') {
    const geminiResponse = await chatWithGemini(userMessage, conversationHistory);
    const intent = extractIntentFromResponse(geminiResponse.response, userMessage);
    return {
      success: true,
      intent: { ...intent, response: geminiResponse.response },
      conversationContext: geminiResponse.conversationContext,
    };
  } else if (preferredProvider === 'openai') {
    return chatWithOpenAI(userMessage, conversationHistory);
  } else {
    return chatWithClaude(userMessage, conversationHistory);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export default {
  chatWithAI,
  chatWithOpenAI,
  chatWithClaude,
};
