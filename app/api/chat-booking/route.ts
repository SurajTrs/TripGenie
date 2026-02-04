import { NextRequest, NextResponse } from 'next/server';
import { parseTripDetails } from '@/lib/nlpParser';
import openai from '@/lib/openai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    const parsed = await parseTripDetails(message);

    if (parsed.intent === 'greet') {
      return NextResponse.json({
        message: 'Hello! I can help you book flights, hotels, trains, and buses. Just tell me where you want to go!'
      });
    }

    if (parsed.intent === 'book_trip' && parsed.from && parsed.to && parsed.date) {
      const [flights, hotels, trains, buses] = await Promise.allSettled([
        fetchFlights(parsed.from, parsed.to, parsed.date),
        fetchHotels(parsed.to, parsed.date),
        fetchTrains(parsed.from, parsed.to, parsed.date),
        fetchBuses(parsed.from, parsed.to, parsed.date)
      ]);

      const flightData = flights.status === 'fulfilled' ? flights.value : null;
      const hotelData = hotels.status === 'fulfilled' ? hotels.value : null;
      const trainData = trains.status === 'fulfilled' ? trains.value : null;
      const busData = buses.status === 'fulfilled' ? buses.value : null;

      const systemPrompt = `You are a professional travel booking assistant. Present the available options clearly and help the user make a decision. Be concise and friendly.`;
      
      const contextMessages: ChatMessage[] = [
        { role: 'user', content: message },
        { 
          role: 'assistant', 
          content: `I found options for your trip from ${parsed.from} to ${parsed.to} on ${parsed.date}:\n\n` +
            `✈️ Flights: ${flightData?.length || 0} available\n` +
            `🏨 Hotels: ${hotelData?.length || 0} available\n` +
            `🚆 Trains: ${trainData?.length || 0} available\n` +
            `🚌 Buses: ${busData?.length || 0} available\n\n` +
            `Would you like to see specific options or proceed with booking?`
        }
      ];

      const aiResponse = await openai.chat.completions.create({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          ...contextMessages
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const tripData = {
        from: parsed.from,
        to: parsed.to,
        date: parsed.date,
        mode: parsed.mode,
        budget: parsed.budget,
        groupSize: parsed.groupSize || 1,
        transport: flightData?.[0] || trainData?.[0] || busData?.[0],
        hotel: hotelData?.[0],
        total: calculateTotal(flightData?.[0], hotelData?.[0], parsed.groupSize || 1),
        availableFlights: flightData,
        availableHotels: hotelData,
        availableTrains: trainData,
        availableBuses: busData
      };

      return NextResponse.json({
        message: aiResponse.choices[0].message.content,
        tripData,
        parsed
      });
    }

    const missingFields = [];
    if (!parsed.from) missingFields.push('origin city');
    if (!parsed.to) missingFields.push('destination city');
    if (!parsed.date) missingFields.push('travel date');

    if (missingFields.length > 0) {
      return NextResponse.json({
        message: `I need a bit more information. Please provide: ${missingFields.join(', ')}`
      });
    }

    return NextResponse.json({
      message: 'I can help you book your trip! Please tell me where you want to go, when, and your budget preference.'
    });

  } catch (error: any) {
    console.error('Chat booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

async function fetchFlights(from: string, to: string, date: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/real-pricing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, date, type: 'flight' })
  });
  const data = await response.json();
  return data.flights || [];
}

async function fetchHotels(city: string, date: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/real-pricing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, date, type: 'hotel' })
  });
  const data = await response.json();
  return data.hotels || [];
}

async function fetchTrains(from: string, to: string, date: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/train`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, date })
  });
  const data = await response.json();
  return data.trains || [];
}

async function fetchBuses(from: string, to: string, date: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, date })
  });
  const data = await response.json();
  return data.buses || [];
}

function calculateTotal(transport: any, hotel: any, groupSize: number) {
  const transportPrice = transport?.price || 0;
  const hotelPrice = hotel?.price || 0;
  return (transportPrice + hotelPrice) * groupSize;
}
