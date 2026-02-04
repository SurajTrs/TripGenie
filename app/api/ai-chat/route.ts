import { NextRequest, NextResponse } from 'next/server';
import { chatWithAI, ConversationMessage } from '../../../lib/aiAssistant';

/**
 * AI Chat API - Intelligent conversation with TravixAI assistant
 * Powered by OpenAI GPT-4 or Claude
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory, provider } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Message is required and must be a string',
      }, { status: 400 });
    }

    console.log('💬 AI Chat request:', message.substring(0, 50) + '...');

    // Process with AI
    const aiResponse = await chatWithAI(
      message,
      conversationHistory || [],
      provider || 'auto'
    );

    if (!aiResponse.success) {
      return NextResponse.json({
        success: false,
        error: aiResponse.error || 'AI processing failed',
      }, { status: 500 });
    }

    // Check if we should trigger a search based on intent
    const shouldSearch =
      aiResponse.intent.intent.startsWith('search_') &&
      aiResponse.intent.confidence > 0.7 &&
      !aiResponse.intent.requiresMoreInfo &&
      hasRequiredFields(aiResponse.intent);

    let searchResults = null;

    if (shouldSearch) {
      console.log('🔍 Triggering automatic search based on intent...');
      searchResults = await performSearch(aiResponse.intent);
    }

    return NextResponse.json({
      success: true,
      message: aiResponse.intent.response,
      intent: aiResponse.intent,
      conversationHistory: aiResponse.conversationContext,
      searchResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ AI Chat error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process AI chat',
    }, { status: 500 });
  }
}

/**
 * Check if intent has required fields for search
 */
function hasRequiredFields(intent: any): boolean {
  const { entities, intent: intentType } = intent;

  if (intentType === 'search_flight') {
    return !!(entities.origin && entities.destination && entities.departureDate);
  } else if (intentType === 'search_hotel') {
    return !!(entities.destination && entities.checkInDate && entities.checkOutDate);
  } else if (intentType === 'search_train') {
    return !!(entities.origin && entities.destination && entities.departureDate);
  } else if (intentType === 'search_bus') {
    return !!(entities.origin && entities.destination && entities.departureDate);
  }

  return false;
}

/**
 * Perform search based on extracted intent
 */
async function performSearch(intent: any) {
  try {
    const { entities, intent: intentType } = intent;

    let searchType = '';
    let searchParams: any = {};

    switch (intentType) {
      case 'search_flight':
        searchType = 'flights';
        searchParams = {
          origin: convertToIATA(entities.origin),
          destination: convertToIATA(entities.destination),
          departureDate: entities.departureDate,
          returnDate: entities.returnDate,
          adults: entities.passengers || 1,
          travelClass: entities.travelClass?.toUpperCase() || 'ECONOMY',
        };
        break;

      case 'search_hotel':
        searchType = 'hotels';
        searchParams = {
          cityCode: convertToIATA(entities.destination),
          checkInDate: entities.checkInDate,
          checkOutDate: entities.checkOutDate,
          adults: entities.passengers || 2,
          rooms: entities.rooms || 1,
        };
        break;

      case 'search_train':
        searchType = 'trains';
        searchParams = {
          from: entities.origin,
          to: entities.destination,
          date: entities.departureDate,
          class: entities.travelClass?.toUpperCase() || '3AC',
        };
        break;

      case 'search_bus':
        searchType = 'buses';
        searchParams = {
          from: entities.origin,
          to: entities.destination,
          date: entities.departureDate,
          passengers: entities.passengers || 1,
        };
        break;

      default:
        return null;
    }

    // Call search API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/real-time-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchType,
        params: searchParams,
      }),
    });

    if (!response.ok) {
      console.error('Search API error:', response.statusText);
      return null;
    }

    const searchData = await response.json();
    console.log(`✅ Auto-search completed: ${searchData.count} results`);

    return searchData;
  } catch (error: any) {
    console.error('❌ Auto-search error:', error);
    return null;
  }
}

/**
 * Convert city names to IATA codes
 */
function convertToIATA(cityName: string): string {
  const iataMap: Record<string, string> = {
    'delhi': 'DEL',
    'mumbai': 'BOM',
    'bangalore': 'BLR',
    'bengaluru': 'BLR',
    'kolkata': 'CCU',
    'chennai': 'MAA',
    'hyderabad': 'HYD',
    'pune': 'PNQ',
    'ahmedabad': 'AMD',
    'jaipur': 'JAI',
    'goa': 'GOI',
    'kochi': 'COK',
    'cochin': 'COK',
    'thiruvananthapuram': 'TRV',
    'trivandrum': 'TRV',
    'chandigarh': 'IXC',
    'lucknow': 'LKO',
    'patna': 'PAT',
    'bhubaneswar': 'BBI',
    'indore': 'IDR',
    'coimbatore': 'CJB',
    'vadodara': 'BDQ',
    'nagpur': 'NAG',
    'varanasi': 'VNS',
    'srinagar': 'SXR',
    'amritsar': 'ATQ',
    'port blair': 'IXZ',
    'london': 'LON',
    'new york': 'NYC',
    'dubai': 'DXB',
    'singapore': 'SIN',
    'bangkok': 'BKK',
  };

  const normalized = cityName.toLowerCase().trim();

  // If already an IATA code, return as-is
  if (normalized.length === 3 && normalized === normalized.toUpperCase()) {
    return normalized;
  }

  return iataMap[normalized] || cityName.toUpperCase().substring(0, 3);
}

/**
 * GET endpoint for API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'TravixAI AI Chat API',
    version: '1.0.0',
    description: 'Intelligent conversation with AI-powered travel assistant',
    features: [
      'Natural language understanding',
      'Intent extraction (search, book, modify, cancel)',
      'Entity recognition (dates, locations, passengers)',
      'Automatic search triggering',
      'Multi-turn conversations',
      'Context awareness',
    ],
    providers: {
      openai: 'GPT-4 Turbo with function calling',
      claude: 'Claude 3 Opus for advanced reasoning',
      auto: 'Automatically selects best available provider',
    },
    usage: {
      POST: {
        body: {
          message: 'User message',
          conversationHistory: 'Array of previous messages (optional)',
          provider: 'openai | claude | auto (optional, default: auto)',
        },
        example: {
          message: 'I want to fly from Delhi to Mumbai next Friday',
          conversationHistory: [],
          provider: 'auto',
        },
      },
    },
    endpoints: {
      chat: 'POST /api/ai-chat',
      search: 'POST /api/real-time-search',
      booking: 'POST /api/real-time-booking',
    },
    status: 'Production Ready',
  });
}
