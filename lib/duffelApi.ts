import { FlightData } from '../types';
import { searchNearestAirport } from './airportSearch';

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}

export async function searchFlightsWithDuffel(params: FlightSearchParams): Promise<FlightData[]> {
  const apiKey = process.env.DUFFEL_API_KEY;
  
  if (!apiKey) {
    throw new Error('Duffel API key not configured');
  }

  // Search for nearest airports to origin and destination cities
  const origin = await searchNearestAirport(params.origin);
  const destination = await searchNearestAirport(params.destination);
  
  // Parse and format date to YYYY-MM-DD
  const { parseDate, formatDateForAPI } = await import('./dateParser');
  const parsedDate = parseDate(params.departureDate);
  const formattedDate = parsedDate ? formatDateForAPI(parsedDate) : new Date().toISOString().split('T')[0];

  console.log('Duffel request:', { origin, destination, formattedDate, adults: params.adults });

  try {
    const requestBody = {
      data: {
        slices: [{
          origin,
          destination,
          departure_date: formattedDate
        }],
        passengers: Array(params.adults).fill({ type: 'adult' }),
        cabin_class: 'economy'
      }
    };

    const response = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Duffel API error:', response.status, errorText);
      throw new Error(`Unable to search flights at the moment`);
    }

    const data = await response.json();
    const offers = data?.data?.offers || [];

    return offers.slice(0, 10).map((offer: any, index: number) => ({
      id: offer.id || `flight-${index}`,
      airline: offer.owner?.name || 'Airline',
      flightNumber: offer.slices?.[0]?.segments?.[0]?.marketing_carrier_flight_number || 'N/A',
      departureAirportIata: origin,
      arrivalAirportIata: destination,
      departureTime: offer.slices?.[0]?.segments?.[0]?.departing_at ? new Date(offer.slices[0].segments[0].departing_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00',
      arrivalTime: offer.slices?.[0]?.segments?.[0]?.arriving_at ? new Date(offer.slices[0].segments[0].arriving_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '13:00',
      duration: offer.slices?.[0]?.duration || '3h 0m',
      price: Math.round(parseFloat(offer.total_amount) * 83) || 5000,
      currency: 'INR',
      deeplink: `https://duffel.com/`,
      stops: (offer.slices?.[0]?.segments?.length - 1) || 0,
      departureCity: params.origin,
      arrivalCity: params.destination,
      departureDate: params.departureDate,
    }));

  } catch (error) {
    console.error('Duffel API error:', error);
    throw error;
  }
}
