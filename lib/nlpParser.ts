// src/lib/nlpParser.ts
// This file integrates with the Gemini API for natural language processing.

import { ParsedTripDetails } from '../types'; // Import ParsedTripDetails

/**
 * Parses user messages using the Gemini API to extract trip details and intent.
 * @param message The user's input message.
 * @returns A promise that resolves to ParsedTripDetails.
 */
export async function parseTripDetails(message: string): Promise<ParsedTripDetails> {
  // Try Gemini API first, fallback to pattern matching if it fails
  try {
    const result = await parseTripDetailsWithAPI(message);
    // If Gemini returns an error, use pattern matching
    if (result.intent === 'error') {
      console.log('Gemini API failed, using pattern matching fallback');
      return parseWithPatterns(message);
    }
    return result;
  } catch (error) {
    console.log('Gemini API error, using pattern matching fallback:', error);
    return parseWithPatterns(message);
  }
}

function parseWithPatterns(message: string): ParsedTripDetails {
  const msg = message.toLowerCase().trim();
  
  const result: ParsedTripDetails = {
    intent: 'book_trip',
    from: null,
    to: null,
    date: null,
    budget: null,
    mode: null,
    groupSize: null,
    returnTrip: null,
    returnDate: null
  };
  
  // Intent detection
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
    result.intent = 'greet';
    return result;
  }
  
  if (msg.includes('book') && msg.includes('hotel')) {
    result.intent = 'book_hotel';
  }
  
  // City name mapping for common abbreviations
  const cityMap: {[key: string]: string} = {
    'delh': 'Delhi',
    'del': 'Delhi',
    'delhi': 'Delhi',
    'mm': 'Mumbai',
    'mum': 'Mumbai',
    'mumbai': 'Mumbai',
    'bom': 'Mumbai',
    'blr': 'Bangalore',
    'bangalore': 'Bangalore',
    'bengaluru': 'Bangalore',
    'hyd': 'Hyderabad',
    'hyderabad': 'Hyderabad',
    'chennai': 'Chennai',
    'maa': 'Chennai',
    'kolkata': 'Kolkata',
    'ccu': 'Kolkata',
    'goa': 'Goa',
    'pune': 'Pune',
    'jaipur': 'Jaipur'
  };
  
  // Check if message is just a city name (for answering questions)
  const normalizedMsg = msg.replace(/[^a-z]/g, '');
  if (cityMap[normalizedMsg]) {
    result.from = cityMap[normalizedMsg];
  }
  
  // Extract cities from patterns
  const fromMatch = msg.match(/from\s+([a-z]+)/i);
  if (fromMatch && cityMap[fromMatch[1]]) result.from = cityMap[fromMatch[1]];
  
  const toMatch = msg.match(/to\s+([a-z]+)/i);
  if (toMatch && cityMap[toMatch[1]]) result.to = cityMap[toMatch[1]];
  
  // Extract mode - handle invalid modes like "horse"
  if (msg.includes('flight') || msg.includes('fly') || msg.includes('plane')) result.mode = 'Flight';
  else if (msg.includes('train') || msg.includes('railway')) result.mode = 'Train';
  else if (msg.includes('bus') || msg.includes('coach')) result.mode = 'Bus';
  else if (msg.includes('car') || msg.includes('cab') || msg.includes('taxi')) result.mode = 'Car';
  
  // Extract budget
  if (msg.includes('luxury') || msg.includes('premium')) result.budget = 'Luxury';
  else if (msg.includes('medium') || msg.includes('mid')) result.budget = 'Medium';
  else if (msg.includes('budget') || msg.includes('cheap') || msg.includes('economy')) result.budget = 'Budget-friendly';
  
  // Extract date - handle formats like "18aug", "18 aug", "august 18"
  const datePatterns = [
    /\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{4})?/i,
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2}),?\s*(\d{4})?/i,
    /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/,
    /\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/
  ];
  
  for (const pattern of datePatterns) {
    const match = msg.match(pattern);
    if (match) {
      result.date = match[0];
      break;
    }
  }
  
  if (msg.includes('tomorrow')) result.date = 'tomorrow';
  else if (msg.includes('today')) result.date = 'today';
  
  // Extract group size
  const groupMatch = msg.match(/\b(\d+)\s*(people|person|passenger|traveler|pax)?\b/i);
  if (groupMatch) {
    result.groupSize = parseInt(groupMatch[1]);
  }
  
  return result;
}

export async function parseTripDetailsWithAPI(message: string): Promise<ParsedTripDetails> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return parseWithPatterns(message);
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // IMPORTANT: The system prompt is crucial for Gemini's output format.
  // Ensure it strongly enforces JSON output with 'null' for missing fields.
  const systemPrompt = `You are a precise travel information extraction API. Extract the following from user's message:
- from: Origin city (e.g., "New Delhi")
- to: Destination city (e.g., "Mumbai")
- date: Date of travel (e.g., "25th December", "tomorrow", "August 18 2025")
- budget: One of Luxury, Medium, Budget-friendly
- mode: One of Train, Bus, Flight
- groupSize: Number of people (e.g., 1, 2, 5)
- returnTrip: Boolean (true if the user wants a round trip or return journey, false or null if one-way)
- returnDate: Date of return travel (e.g., "30th December", "next week", "August 25 2025")
- intent: Determine the user's primary intent:
  * 'book_trip' - User wants to book transport (flight/train/bus) with phrases like "book", "reserve", "purchase ticket", "yes" (when confirming booking), "book it", "confirm", "proceed"
  * 'book_hotel' - User wants to book accommodation only
  * 'general_query' - User asks for travel advice, recommendations, information, or questions about destinations ("tell me about", "best places", "what to visit", "recommend", "how is", "weather in", "culture of", "food in", "things to do")
  * 'greet' - Simple greetings ("hi", "hello", "hey")
  * 'cancel_trip' - User wants to cancel or restart
  * 'unknown' - Cannot determine intent
- message: An optional, brief confirmation or error message

Return only JSON as per this schema with no markdown or extra text. If a field is not found, set its value to null.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser message: "${message}"` }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          from: { type: "STRING", nullable: true },
          to: { type: "STRING", nullable: true },
          date: { type: "STRING", nullable: true },
          budget: {
            type: "STRING",
            enum: ["Luxury", "Medium", "Budget-friendly"],
            nullable: true,
          },
          mode: {
            type: "STRING",
            enum: ["Train", "Bus", "Flight", "Car"],
            nullable: true,
          },
          groupSize: { type: "NUMBER", nullable: true },
          returnTrip: { type: "BOOLEAN", nullable: true },
          returnDate: { type: "STRING", nullable: true },
          intent: {
            type: "STRING",
            enum: ["book_trip", "book_hotel", "book_car", "display_trip", "cancel_trip", "greet", "general_query", "error", "unknown"]
          },
          message: { type: "STRING", nullable: true },
        },
        required: ["intent"], // Only intent is strictly required by schema
      },
    },
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API failed:", res.status, errText.substring(0, 200));
      
      // If quota exceeded, try Groq API
      if (res.status === 429) {
        console.log('Gemini quota exceeded, trying Groq API');
        try {
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY || '<GROQ_API_KEY>'}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: `${systemPrompt}\n\nUser message: "${message}"` }],
              response_format: { type: 'json_object' },
              temperature: 0.3
            })
          });
          
          if (groqResponse.ok) {
            const data = await groqResponse.json();
            const parsedData = JSON.parse(data.choices[0].message.content);
            console.log('✅ Groq NLP parse successful:', parsedData);
            return parsedData;
          }
        } catch (groqError) {
          console.error('Groq API error:', groqError);
        }
        
        console.log('Using pattern matching fallback');
        return parseWithPatterns(message);
      }
      
      return parseWithPatterns(message);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const rawText = await res.text();
        console.error("Gemini API did not return JSON. Content-Type:", contentType, "Raw body:", rawText);
        // Fallback for non-JSON response from Gemini
        return {
          intent: 'error',
          message: 'NLP service returned an invalid response format.',
          from: null, to: null, date: null, budget: null, mode: null, groupSize: null,
          returnTrip: null, returnDate: null
        };
    }

    const result = await res.json();
    // Gemini 2.0 Flash with responseSchema directly returns the JSON object in 'text' part
    const part = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!part) {
        console.warn("Gemini API returned no text content or candidates.");
        // Return a default 'unknown' intent with a helpful message
        return {
          intent: 'unknown',
          message: 'I could not extract specific information from your message. Can you please rephrase?',
          from: null, to: null, date: null, budget: null, mode: null, groupSize: null,
          returnTrip: null, returnDate: null
        };
    }

    let raw = part.trim();
    // Clean up markdown code block if present (Gemini with responseSchema often omits this, but good to keep)
    if (raw.startsWith('```json')) raw = raw.slice(7, -3).trim();
    else if (raw.startsWith('```')) raw = raw.slice(3, -3).trim();

    // Replace "null" strings with actual null values for JSON parsing, if Gemini outputs them as strings
    const cleanJson = raw.replace(/: "null"/g, ": null");

    let parsedData: ParsedTripDetails;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini's JSON response:", parseError, "Raw:", cleanJson);
      return {
        intent: 'error',
        message: 'NLP service returned malformed JSON. Please try again.',
        from: null, to: null, date: null, budget: null, mode: null, groupSize: null,
        returnTrip: null, returnDate: null
      };
    }


    // Ensure numeric fields are correctly parsed if they come as strings (Gemini's responseSchema helps, but defensive)
    if (typeof parsedData.groupSize === 'string') {
        parsedData.groupSize = parseInt(parsedData.groupSize, 10);
        if (isNaN(parsedData.groupSize)) parsedData.groupSize = null;
    }

    // Ensure all optional fields are explicitly null if they are undefined in the parsed data
    // This makes the ParsedTripDetails object predictable for the rest of the application.
    parsedData.from = parsedData.from === undefined ? null : parsedData.from;
    parsedData.to = parsedData.to === undefined ? null : parsedData.to;
    parsedData.date = parsedData.date === undefined ? null : parsedData.date;
    parsedData.budget = parsedData.budget === undefined ? null : parsedData.budget;
    parsedData.mode = parsedData.mode === undefined ? null : parsedData.mode;
    parsedData.groupSize = parsedData.groupSize === undefined ? null : parsedData.groupSize;
    parsedData.message = parsedData.message === undefined ? undefined : parsedData.message; // Ensure message is undefined if not set

    // Defensive check: ensure intent is always valid or defaults to 'unknown'
    const validIntents = ["book_trip", "book_hotel", "book_car", "display_trip", "cancel_trip", "greet", "general_query", "error", "unknown"];
    if (!parsedData.intent || !validIntents.includes(parsedData.intent)) {
        console.warn(`NLP returned an invalid or missing intent: "${parsedData.intent}". Defaulting to 'unknown'.`);
        parsedData.intent = 'unknown';
        parsedData.message = parsedData.message || 'I could not determine your intent. Can you please rephrase?';
    }
    
    // Ensure returnTrip and returnDate are explicitly null if they are undefined
    parsedData.returnTrip = parsedData.returnTrip === undefined ? null : parsedData.returnTrip;
    parsedData.returnDate = parsedData.returnDate === undefined ? null : parsedData.returnDate;


    console.log('✅ NLP parse successful:', parsedData);
    return parsedData;
  } catch (error: any) {
    console.error('❌ NLP parse failed:', error);
    // Return an 'error' intent with the error message and all fields explicitly null
    return {
      intent: 'error',
      message: error.message || 'An unexpected error occurred during NLP parsing.',
      from: null, to: null, date: null, budget: null, mode: null, groupSize: null,
      returnTrip: null, returnDate: null
    };
  }
}