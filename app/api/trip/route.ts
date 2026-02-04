// app/api/trip/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TripContext, TripPlanData, FlightData, HotelData, ParsedTripDetails, TrainData, BusData } from '../../../types';
import { parseTripDetails } from '@/lib/nlpParser';
import { searchFlights } from '@/lib/flightApi';
import { searchFlightsWithDuffel } from '@/lib/duffelApi';
import { parseDate, formatDateForAPI } from '@/lib/dateParser';

const QUESTIONS: Record<string, string> = {
  from: 'Which city will you be departing from?',
  to: 'What is your destination city?',
  date: 'When would you like to travel? (e.g., 18 August 2025 or Tomorrow)',
  budget: 'What budget range works best for you? (Luxury, Medium, or Budget-friendly)',
  groupSize: 'How many travelers will be joining? (e.g., 1, 2, or 5)',
  mode: 'How would you prefer to travel? (Flight, Train, or Bus)',
  returnTrip: 'Would you like to book a round-trip journey? (Yes or No)',
  returnDate: 'When would you like to return? (e.g., 25 August 2025 or Next week)',
};

function getRandomPrice(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(req: NextRequest) {
  try {
    const { message, context: ctxIn = {} } = await req.json();
    const context: TripContext = { ...ctxIn };

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Invalid message.' }, { status: 400 });
    }

    const parsed: ParsedTripDetails = await parseTripDetails(message);
    console.log("Parsed NLP details:", parsed);
    
    // If we're asking for specific info, don't treat as general query
    const isAnsweringQuestion = context.ask != null;
    
    // Handle general queries with Gemini - Professional Travel Assistant (only if not answering a question)
    if (!isAnsweringQuestion && parsed.intent === 'general_query') {
      try {
        const { chatWithGemini } = await import('@/lib/gemini');
        
        // Enhanced professional system prompt
        const professionalPrompt = `You are TravixAI, an expert AI travel assistant with comprehensive knowledge of:
- Global destinations, attractions, and hidden gems
- Real-time travel trends and seasonal recommendations
- Cultural insights, local customs, and etiquette
- Budget planning and cost optimization
- Weather patterns and best travel times
- Visa requirements and travel documentation
- Safety tips and health precautions
- Local cuisine and dining recommendations
- Transportation options and logistics
- Accommodation suggestions for all budgets

Provide accurate, detailed, and actionable travel advice. Be conversational yet professional. Include specific examples, practical tips, and insider knowledge when relevant.

User Question: ${message}

Provide a comprehensive, well-structured response (200-300 words).`;
        
        const geminiResponse = await chatWithGemini(professionalPrompt, []);
        
        return NextResponse.json({
          success: true,
          message: geminiResponse.response,
          context: context
        });
      } catch (error: any) {
        console.error('Gemini query error:', error);
        return NextResponse.json({
          success: false,
          message: "I'm having trouble answering that right now. Could you rephrase your question?",
          context: context
        });
      }
    }
    
    // Handle trip plan requests - Professional Itinerary Generation
    const tripPlanMatch = message.toLowerCase().match(/(?:make|create|plan|suggest|generate).*?(?:trip|itinerary|plan)/i);
    const daysMatch = message.match(/(\d+)\s+days?/i);
    
    // Extract cities from the message if not already parsed
    if (tripPlanMatch && daysMatch) {
      const days = parseInt(daysMatch[1]);
      const fromCity = parsed.from || context.from;
      const toCity = parsed.to || context.to;
      
      if (fromCity && toCity) {
        try {
          const { chatWithGemini } = await import('@/lib/gemini');
          
          // Extract special interests from the message
          const interests = message.toLowerCase().match(/(?:see|visit|experience|want)\s+([^\d]+?)(?:\s+for|$)/i)?.[1] || '';
          
          const itineraryPrompt = `You are TravixAI, a professional travel planner. Create a detailed, realistic ${days}-day trip itinerary from ${fromCity} to ${toCity}${interests ? ` focusing on: ${interests}` : ''}.

Include:

📅 **Day-by-Day Breakdown:**
- Morning, afternoon, and evening activities
- Specific attractions with brief descriptions
- Estimated time at each location
- Travel time between locations

💰 **Budget Breakdown:**
- Accommodation costs per night (budget/mid-range/luxury options)
- Food expenses (breakfast, lunch, dinner)
- Transportation costs (local travel)
- Entry fees for attractions
- Total estimated cost

🎯 **Practical Tips:**
- Best time to visit each attraction
- Local transportation options
- Must-try local dishes
- Cultural etiquette
- Safety considerations
${interests ? `- Specific tips for experiencing: ${interests}` : ''}

⚡ **Quick Facts:**
- Best season to visit
- Average weather during the trip
- Essential items to pack

Make it actionable, realistic, and exciting. Use emojis for better readability.`;
          
          const geminiResponse = await chatWithGemini(itineraryPrompt, []);
          
          return NextResponse.json({
            success: true,
            message: geminiResponse.response + "\n\n✈️ **Ready to Book?**\nWould you like me to help you book flights, trains, buses, and hotels for this trip? Just let me know!",
            context: { ...context, from: fromCity, to: toCity, tripDuration: days }
          });
        } catch (error: any) {
          console.error('Trip plan generation error:', error);
        }
      }
    }
    
    // Track if this is a hotel-only booking
    const isHotelOnly = parsed.intent === 'book_hotel' || message.toLowerCase().includes('book hotel');
    if (isHotelOnly && !context.isHotelOnly) {
      context.isHotelOnly = true;
    }

    // If we're asking for specific info, treat the message as the answer
    if (context.ask) {
      const askField = context.ask;
      
      // Check if the new message contains trip planning keywords - if so, treat as new trip
      const isTripPlanningMessage = message.toLowerCase().match(/\b(trip|plan|travel|book|from|to)\b.*\b(from|to)\b/);
      
      if (isTripPlanningMessage && (parsed.from || parsed.to)) {
        // User is starting a new trip plan, not answering the question
        delete context.ask;
        if (parsed.from) context.from = parsed.from;
        if (parsed.to) context.to = parsed.to;
        if (parsed.date) context.date = parsed.date;
        if (parsed.mode) context.mode = parsed.mode;
        if (parsed.groupSize) context.groupSize = parsed.groupSize;
      } else if (askField === 'from' || askField === 'to') {
        context[askField] = message.trim();
        delete context.ask;
      } else if (askField === 'date') {
        const parsedDate = parseDate(message.trim());
        if (parsedDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          parsedDate.setHours(0, 0, 0, 0);
          
          if (parsedDate < today) {
            return NextResponse.json({
              assistantFollowUp: true,
              ask: 'date',
              context: { ...context, ask: 'date' },
              message: "That date has already passed. Please provide a future date for your travel.",
            });
          }
        }
        context.date = message.trim();
        delete context.ask;
      } else if (askField === 'budget') {
        const budgetLower = message.toLowerCase();
        if (budgetLower.includes('luxury')) context.budget = 'Luxury';
        else if (budgetLower.includes('medium')) context.budget = 'Medium';
        else if (budgetLower.includes('budget')) context.budget = 'Budget-friendly';
        else context.budget = message.trim() as any;
        delete context.ask;
      } else if (askField === 'mode') {
        const modeLower = message.toLowerCase();
        if (modeLower.includes('flight')) context.mode = 'Flight';
        else if (modeLower.includes('train')) context.mode = 'Train';
        else if (modeLower.includes('bus')) context.mode = 'Bus';
        else context.mode = message.trim() as any;
        delete context.ask;
      } else if (askField === 'groupSize') {
        const num = parseInt(message.trim());
        context.groupSize = isNaN(num) ? 1 : num;
        delete context.ask;
      } else if (askField === 'returnDate') {
        context.returnDate = message.trim();
        delete context.ask;
      }
    } else {
      // Update context from parsed NLP
      if (parsed.from && !context.isHotelOnly) {
        context.from = parsed.from;
        // If both from and to are in the same message, update both
        if (parsed.to) context.to = parsed.to;
      }
      if (parsed.to && !context.to) context.to = parsed.to;
      if (parsed.date) {
        // Validate date is not in the past
        const parsedDate = parseDate(parsed.date);
        if (parsedDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          parsedDate.setHours(0, 0, 0, 0);
          
          if (parsedDate < today) {
            return NextResponse.json({
              assistantFollowUp: true,
              ask: 'date',
              context: { ...context, ask: 'date' },
              message: "That date has already passed. Please provide a future date for your travel.",
            });
          }
        }
        context.date = parsed.date;
      }
      if (parsed.budget) context.budget = parsed.budget;
      if (parsed.groupSize != null) context.groupSize = parsed.groupSize;
      if (parsed.mode && !context.isHotelOnly) context.mode = parsed.mode;
      if (parsed.returnTrip != null) context.returnTrip = parsed.returnTrip;
      if (parsed.returnDate) context.returnDate = parsed.returnDate;
    }

    // --- ASK FOR MISSING INFO FIRST ---
    // For hotel-only bookings, we don't need 'from' or 'mode'
    const slots: (keyof TripContext)[] = context.isHotelOnly
      ? ['to', 'date', 'budget', 'groupSize']
      : ['from', 'to', 'date', 'mode', 'budget', 'groupSize'];
    const missing = slots.find((k) => context[k] == null);
    
    // For hotel-only bookings, search hotels directly after getting all required info
    if (context.isHotelOnly && !missing && !context.hotel) {
      try {
        const { searchHotelsWithGemini } = await import('@/lib/gemini');
        
        let checkInDate: Date;
        if (context.date) {
          checkInDate = parseDate(context.date) || new Date();
        } else {
          checkInDate = new Date();
        }

        const checkInDateStr = formatDateForAPI(checkInDate);

        const hotels: HotelData[] = await searchHotelsWithGemini(
          context.to || '',
          context.budget as "Luxury" | "Medium" | "Budget-friendly",
          checkInDateStr,
          context.groupSize || 1
        );

        if (hotels.length > 0) {
          return NextResponse.json({
            assistantFollowUp: true,
            message: `Excellent! I've found ${hotels.length} available hotels in ${context.to} using AI-powered search. Please select your preferred accommodation.`,
            context: context,
            data: {
              availableHotels: hotels
            }
          });
        } else {
          return NextResponse.json({
            success: false,
            message: `Unfortunately, no hotels are currently available in ${context.to} within the ${context.budget} budget range. Would you like to explore a different budget category?`,
            context: { ...context, budget: undefined }
          });
        }
      } catch (error: any) {
        console.error('Hotel search error:', error);
        return NextResponse.json({
          success: false,
          message: `I'm experiencing difficulty searching for hotels at the moment. Please try again in a few moments.`,
          context: context
        });
      }
    }
    
    // If all basic info is provided and returnTrip is true, check for returnDate
    if (!missing && context.returnTrip && !context.returnDate) {
      return NextResponse.json({
        assistantFollowUp: true,
        ask: 'returnDate',
        context: { ...context, ask: 'returnDate' },
        message: QUESTIONS['returnDate'],
      });
    }

    if (missing) {
      return NextResponse.json({
        assistantFollowUp: true,
        ask: missing,
        context: { ...context, ask: missing },
        message: QUESTIONS[missing],
      });
    }

    // --- STEP 2: SEARCH FOR HOTELS ---
    if ((context.flight || context.train || context.bus) && context.budget && !context.hotel) {
      try {
        const { searchHotelsWithGemini } = await import('@/lib/gemini');

        let flightDate: Date;
        if (context.date) {
          flightDate = parseDate(context.date) || new Date();
        } else {
          flightDate = new Date();
        }

        const checkInDate = formatDateForAPI(flightDate);

        const hotels: HotelData[] = await searchHotelsWithGemini(
          context.to || '',
          context.budget as "Luxury" | "Medium" | "Budget-friendly",
          checkInDate,
          context.groupSize || 1
        );

        if (hotels.length > 0) {
          return NextResponse.json({
            assistantFollowUp: true,
            message: "Perfect! I've found several hotels using AI-powered search that match your budget preferences. Please select your preferred accommodation.",
            context: context,
            data: {
              availableHotels: hotels,
              transport: context.flight || context.train || context.bus
            }
          });
        } else {
          return NextResponse.json({
            success: false,
            message: `Unfortunately, no hotels are currently available in ${context.to} within the ${context.budget} budget range. Would you like to explore a different budget category?`,
            context: { ...context, budget: undefined }
          });
        }
      } catch (error: any) {
        console.error('Hotel search error:', error);
        return NextResponse.json({
          success: false,
          message: `I'm experiencing difficulty searching for hotels at the moment. Please try again in a few moments.`,
          context: context
        });
      }
    }

    // --- STEP 1: SEARCH FOR TRANSPORT (FLIGHT, TRAIN, BUS) ---
    if (context.from && context.to && context.date && context.mode && !context.flight && !context.train && !context.bus) {
      try {
        if (context.mode === 'Flight') {
          const { searchFlightsAffiliate } = await import('@/lib/affiliateBooking');
          const flights: FlightData[] = await searchFlightsAffiliate({
            origin: context.from,
            destination: context.to,
            departureDate: context.date,
            adults: context.groupSize || 1,
          });

          if (flights.length > 0) {
            // If returnTrip is true, ask about returnDate if not provided
            if (context.returnTrip && !context.returnDate) {
              return NextResponse.json({
                assistantFollowUp: true,
                ask: 'returnDate',
                message: "Excellent! I've found several flights for your outbound journey. When would you like to return?",
                context: context,
                data: { availableFlights: flights }
              });
            }
            
            // Don't ask for budget if already provided
            if (context.budget) {
              return NextResponse.json({
                assistantFollowUp: true,
                message: "Excellent! I've found several flight options for you. Please select your preferred flight.",
                context: context,
                data: { availableFlights: flights }
              });
            }
            
            return NextResponse.json({
              assistantFollowUp: true,
              ask: 'budget',
              message: "Excellent! I've found several flight options for you. Please select your preferred flight. Meanwhile, what budget range works best for your trip?",
              context: context,
              data: { availableFlights: flights }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: `Unfortunately, no flights are available from ${context.from} to ${context.to} on that date. Would you like to try a different travel date?`,
              context: { ...context, date: undefined }
            });
          }
        } else if (context.mode === 'Train') {
          const { searchTrains } = await import('@/lib/train');
          
          const trains = await searchTrains({
            origin: context.from,
            destination: context.to,
            departureDate: context.date,
            passengers: context.groupSize || 1,
          });
          
          if (trains.length > 0) {
            // If returnTrip is true, ask about returnDate if not provided
            if (context.returnTrip && !context.returnDate) {
              return NextResponse.json({
                assistantFollowUp: true,
                ask: 'returnDate',
                message: "Excellent! I've found several trains for your outbound journey. When would you like to return?",
                context: context,
                data: { availableTrains: trains }
              });
            }
            
            // Don't ask for budget if already provided
            if (context.budget) {
              return NextResponse.json({
                assistantFollowUp: true,
                message: "Excellent! I've found several train options for you. Please select your preferred train.",
                context: context,
                data: { availableTrains: trains }
              });
            }
            
            return NextResponse.json({
              assistantFollowUp: true,
              ask: 'budget',
              message: "Excellent! I've found several train options for you. Please select your preferred train. Meanwhile, what budget range works best for your trip?",
              context: context,
              data: { availableTrains: trains }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: `Unfortunately, no trains are available from ${context.from} to ${context.to} on that date. Would you like to try a different travel date?`,
              context: { ...context, date: undefined }
            });
          }
        } else if (context.mode === 'Bus') {
          const { searchBuses } = await import('@/lib/busApi');
          
          const buses = await searchBuses({
            origin: context.from,
            destination: context.to,
            departureDate: context.date,
            passengers: context.groupSize || 1,
          });
          
          if (buses.length > 0) {
            // If returnTrip is true, ask about returnDate if not provided
            if (context.returnTrip && !context.returnDate) {
              return NextResponse.json({
                assistantFollowUp: true,
                ask: 'returnDate',
                message: "Excellent! I've found several buses for your outbound journey. When would you like to return?",
                context: context,
                data: { availableBuses: buses }
              });
            }
            
            // Don't ask for budget if already provided
            if (context.budget) {
              return NextResponse.json({
                assistantFollowUp: true,
                message: "Excellent! I've found several bus options for you. Please select your preferred bus.",
                context: context,
                data: { availableBuses: buses }
              });
            }
            
            return NextResponse.json({
              assistantFollowUp: true,
              ask: 'budget',
              message: "Excellent! I've found several bus options for you. Please select your preferred bus. Meanwhile, what budget range works best for your trip?",
              context: context,
              data: { availableBuses: buses }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: `Unfortunately, no buses are available from ${context.from} to ${context.to} on that date. Would you like to try a different travel date?`,
              context: { ...context, date: undefined }
            });
          }
        }
      } catch (e: any) {
        console.error(`${context.mode} search error:`, e);
        return NextResponse.json({ success: false, message: `${context.mode} search failed: ${e.message}` });
      }
    }
    
    // --- STEP 1.5: SEARCH FOR RETURN TRANSPORT IF NEEDED ---
    if (context.returnTrip && context.returnDate && 
        ((context.flight && !context.returnFlight) || 
         (context.train && !context.returnTrain) || 
         (context.bus && !context.returnBus))) {
      try {
        if (context.mode === 'Flight' && context.flight) {
          const returnFlights: FlightData[] = await searchFlightsWithDuffel({
            origin: context.to || '', // Swap origin and destination for return
            destination: context.from || '',
            departureDate: context.returnDate || '',
            adults: context.groupSize || 1,
          });

          if (returnFlights.length > 0) {
            return NextResponse.json({
              assistantFollowUp: true,
              message: "Perfect! I've found several return flight options for you. Please select your preferred return flight.",
              context: context,
              data: { availableFlights: returnFlights }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: `Unfortunately, no return flights are available from ${context.to} to ${context.from} on ${context.returnDate}. Would you like to try a different return date?`,
              context: { ...context, returnDate: undefined }
            });
          }
        } else if (context.mode === 'Train' && context.train) {
          const { searchTrains } = await import('@/lib/train');
          
          const returnTrains = await searchTrains({
            origin: context.to || '', // Swap origin and destination for return
            destination: context.from || '',
            departureDate: context.returnDate || '',
            passengers: context.groupSize || 1,
          });
          
          if (returnTrains.length > 0) {
            return NextResponse.json({
              assistantFollowUp: true,
              message: "Perfect! I've found several return train options for you. Please select your preferred return train.",
              context: context,
              data: { availableTrains: returnTrains }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: `Unfortunately, no return trains are available from ${context.to} to ${context.from} on ${context.returnDate}. Would you like to try a different return date?`,
              context: { ...context, returnDate: undefined }
            });
          }
        } else if (context.mode === 'Bus' && context.bus) {
          const { searchBuses } = await import('@/lib/busApi');
          
          const returnBuses = await searchBuses({
            origin: context.to || '', // Swap origin and destination for return
            destination: context.from || '',
            departureDate: context.returnDate || '',
            passengers: context.groupSize || 1,
          });
          
          if (returnBuses.length > 0) {
            return NextResponse.json({
              assistantFollowUp: true,
              message: "Perfect! I've found several return bus options for you. Please select your preferred return bus.",
              context: context,
              data: { availableBuses: returnBuses }
            });
          } else {
            return NextResponse.json({
              success: false,
              message: `Unfortunately, no return buses are available from ${context.to} to ${context.from} on ${context.returnDate}. Would you like to try a different return date?`,
              context: { ...context, returnDate: undefined }
            });
          }
        }
      } catch (e: any) {
        console.error(`Return ${context.mode} search error:`, e);
        return NextResponse.json({ success: false, message: `Return ${context.mode} search failed: ${e.message}` });
      }
    }

    // --- STEP 3: FINALIZE TRIP PLAN ---
    if ((context.flight || context.train || context.bus) && context.hotel && context.groupSize) {
      try {
        let cabsToStation: any[] = [];
        let cabsToHotel: any[] = [];
        
        try {
          const { getCabOptions } = await import('@/lib/cabMakeMyTrip');
          cabsToStation = await getCabOptions(context.from || '', `${context.from} Airport`);
          cabsToHotel = await getCabOptions(`${context.to} Airport`, context.to || '');
        } catch (cabError) {
          console.error('Cab API error, using fallback:', cabError);
        }
        
        const cabToStationPrice = cabsToStation[0]?.price || getRandomPrice(400, 700);
        const cabToHotelPrice = cabsToHotel[0]?.price || getRandomPrice(500, 800);
        
        let transportCost = 0;
        let returnTransportCost = 0;
        let transport: FlightData | TrainData | BusData | null = null;
        let transportType: 'flight' | 'train' | 'bus' = 'flight';
        let returnTransport: FlightData | TrainData | BusData | undefined = undefined;
        let stationName = 'Airport';
        
        // Determine transport type and cost
        if (context.flight) {
          transportType = 'flight';
          transport = context.flight;
          transportCost = context.flight.price * context.groupSize;
          stationName = 'Airport';
          
          if (context.returnTrip && context.returnFlight) {
            returnTransport = context.returnFlight;
            returnTransportCost = context.returnFlight.price * context.groupSize;
          }
        } else if (context.train) {
          transportType = 'train';
          transport = context.train;
          transportCost = context.train.price * context.groupSize;
          stationName = 'Train Station';
          
          if (context.returnTrip && context.returnTrain) {
            returnTransport = context.returnTrain;
            returnTransportCost = context.returnTrain.price * context.groupSize;
          }
        } else if (context.bus) {
          transportType = 'bus';
          transport = context.bus;
          transportCost = context.bus.price * context.groupSize;
          stationName = 'Bus Station';
          
          if (context.returnTrip && context.returnBus) {
            returnTransport = context.returnBus;
            returnTransportCost = context.returnBus.price * context.groupSize;
          }
        } else {
          throw new Error('No transport selected');
        }

        const hotelCost = context.hotel.price * context.groupSize;
        const cabCost = cabToStationPrice + cabToHotelPrice;
        const totalCost = transportCost + returnTransportCost + hotelCost + cabCost;

        const finalPlan: TripPlanData = {
          transport: transport as (FlightData | TrainData | BusData | null),
          transportType: transportType,
          hotel: context.hotel,
          cabToStation: {
            name: `${cabsToStation[0]?.provider || 'Uber'} to ${stationName} in ${context.from}`,
            price: cabToStationPrice,
            details: cabsToStation[0]?.name || 'Standard Ride'
          },
          cabToHotel: {
            name: `${cabsToHotel[0]?.provider || 'Uber'} from ${stationName} in ${context.to}`,
            price: cabToHotelPrice,
            details: cabsToHotel[0]?.name || 'Standard Ride'
          },
          cabOptionsToStation: cabsToStation.length > 0 ? cabsToStation : undefined,
          cabOptionsToHotel: cabsToHotel.length > 0 ? cabsToHotel : undefined,
          groupSize: context.groupSize,
          total: totalCost,
          returnTrip: context.returnTrip,
          returnDate: context.returnDate,
          returnTransport: returnTransport
        };

        return NextResponse.json({
          success: true,
          message: "Perfect! Your complete itinerary is ready with real-time pricing. Please review your trip summary and proceed to secure booking.",
          data: finalPlan,
          context: { lastPlannedTrip: finalPlan }
        });
      } catch (error: any) {
        console.error('Error finalizing trip plan:', error);
        return NextResponse.json({
          success: false,
          message: `I'm experiencing difficulty finalizing your trip details. Please try again in a moment.`,
          context: context
        });
      }
    }
    
    // --- FINALIZE HOTEL-ONLY BOOKING ---
    if (context.isHotelOnly && context.hotel && context.groupSize) {
      const hotelCost = context.hotel.price * context.groupSize;
      
      const hotelPlan: TripPlanData = {
        transport: null,
        transportType: 'flight',
        hotel: context.hotel,
        groupSize: context.groupSize,
        total: hotelCost,
        returnTrip: false
      };
      
      return NextResponse.json({
        success: true,
        message: `Perfect! Your hotel booking is ready.\n\n🏨 **${context.hotel.name}**\n📍 ${context.hotel.location}\n👥 ${context.groupSize} guest${context.groupSize > 1 ? 's' : ''}\n💰 Total: ₹${hotelCost.toLocaleString()}\n\nReady to confirm your booking?`,
        data: hotelPlan,
        context: { ...context, lastPlannedTrip: hotelPlan }
      });
    }

    // --- HANDLE BOOKING REQUEST ---
    if (parsed.intent === 'book_trip' && context.hotel && context.groupSize) {
      // Check if this is hotel-only booking
      if (context.isHotelOnly) {
        // Hotel-only booking confirmation
        const hotelCost = context.hotel.price * context.groupSize;
        
        return NextResponse.json({
          success: true,
          message: `🎉 Excellent! Your hotel booking is being processed.\n\n📧 You'll receive a confirmation email shortly with your booking details.\n\nBooking Reference: HB${Date.now().toString().slice(-6)}\n\nThank you for choosing TravixAI!`,
          context: { ...context, bookingConfirmed: true }
        });
      }
      
      // Full trip booking with transport
      if (context.flight || context.train || context.bus) {
      try {
        // Determine transport type and details
        let transport: FlightData | TrainData | BusData | null = null;
        let transportType: 'flight' | 'train' | 'bus' = 'flight';
        let returnTransport: FlightData | TrainData | BusData | undefined = undefined;
        let stationName = 'Airport';
        let transportPrice = 0;
        let returnTransportPrice = 0;
        
        if (context.flight) {
          transport = context.flight;
          transportType = 'flight';
          transportPrice = context.flight.price;
          stationName = 'Airport';
          
          if (context.returnTrip && context.returnFlight) {
            returnTransport = context.returnFlight;
            returnTransportPrice = context.returnFlight.price;
          }
        } else if (context.train) {
          transport = context.train;
          transportType = 'train';
          transportPrice = context.train.price;
          stationName = 'Train Station';
          
          if (context.returnTrip && context.returnTrain) {
            returnTransport = context.returnTrain;
            returnTransportPrice = context.returnTrain.price;
          }
        } else if (context.bus) {
          transport = context.bus;
          transportType = 'bus';
          transportPrice = context.bus.price;
          stationName = 'Bus Station';
          
          if (context.returnTrip && context.returnBus) {
            returnTransport = context.returnBus;
            returnTransportPrice = context.returnBus.price;
          }
        } else {
          throw new Error('No transport selected');
        }
        
        const groupSize = context.groupSize || 1;
        const cabToStationPrice = getRandomPrice(400, 700);
        const cabToHotelPrice = getRandomPrice(500, 800);
        const hotelPrice = context.hotel.price;
        
        // Create a trip plan from the context
        const tripPlan: TripPlanData = {
          transport: transport as (FlightData | TrainData | BusData | null),
          transportType: transportType,
          hotel: context.hotel,
          cabToStation: {
            name: `Uber to ${stationName} in ${context.from || ''}`,
            price: cabToStationPrice,
            details: 'Standard Ride (UberX)'
          },
          cabToHotel: {
            name: `Uber from ${stationName} in ${context.to || ''}`,
            price: cabToHotelPrice,
            details: 'Standard Ride (UberX)'
          },
          groupSize: groupSize,
          total: (transportPrice + returnTransportPrice + hotelPrice) * groupSize + cabToStationPrice + cabToHotelPrice,
          returnTrip: context.returnTrip,
          returnDate: context.returnDate,
          returnTransport: returnTransport
        };
        
        // Call the booking API
        const bookingResponse = await fetch(new URL('/api/book-trip', req.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tripPlan, context })
        });
        
        const bookingResult = await bookingResponse.json();
        
        if (bookingResult.success) {
          return NextResponse.json({
            success: true,
            message: `Excellent news! Your journey from ${context.from || ''} to ${context.to || ''} on ${context.date || ''} has been successfully confirmed. Your booking reference is ${bookingResult.bookingId}. A confirmation email will arrive shortly.`,
            context: { ...context, lastPlannedTrip: tripPlan, bookingReference: bookingResult.bookingId },
            data: tripPlan
          });
        } else {
          return NextResponse.json({
            success: false,
            message: `Unfortunately, we encountered an issue processing your booking: ${bookingResult.message}. Would you like to try again?`,
            context: context
          });
        }
      } catch (error: any) {
        console.error('Booking error:', error);
        return NextResponse.json({
          success: false,
          message: `I'm experiencing difficulty processing your booking at the moment. Please try again shortly.`,
          context: context
        });
      }
    }
    }
    
    // --- SAFETY FALLBACK ---
    return NextResponse.json({
      success: false,
      message: "I'd be happy to help you further. Could you please provide more details about what you'd like to do?",
      context: context,
    });

  } catch (err: any) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: err.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
