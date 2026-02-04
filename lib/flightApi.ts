import { FlightData } from '../types';

interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}

const AIRPORT_CODES: Record<string, string> = {
  'delhi': 'DEL',
  'mumbai': 'BOM',
  'bangalore': 'BLR',
  'chennai': 'MAA',
  'kolkata': 'CCU',
  'hyderabad': 'HYD',
  'pune': 'PNQ',
  'goa': 'GOI',
  'jaipur': 'JAI',
};

export async function searchFlights(params: FlightSearchParams): Promise<FlightData[]> {
  const rapidApiKey = process.env.RAPID_API_KEY;
  
  if (!rapidApiKey) {
    return generateMockFlights(params);
  }

  const departId = AIRPORT_CODES[params.origin.toLowerCase()] || 'DEL';
  const arrivalId = AIRPORT_CODES[params.destination.toLowerCase()] || 'BOM';

  const url = `https://booking-com18.p.rapidapi.com/flights/v2/min-price-oneway?departId=${departId}&arrivalId=${arrivalId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'booking-com18.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey,
      }
    });

    if (!response.ok) {
      throw new Error(`Flight API failed: ${response.status}`);
    }

    const data = await response.json();
    const flights = data?.data?.flights || [];

    if (flights.length === 0) {
      throw new Error('No flights available for this route');
    }

    return flights.slice(0, 10).map((flight: any, index: number) => ({
      id: flight.token || `flight-${index}`,
      airline: flight.segments?.[0]?.legs?.[0]?.carriersData?.[0]?.name || 'Airline',
      flightNumber: flight.segments?.[0]?.legs?.[0]?.flightInfo?.flightNumber || 'N/A',
      departureAirportIata: departId,
      arrivalAirportIata: arrivalId,
      departureTime: flight.segments?.[0]?.departureTime || '10:00',
      arrivalTime: flight.segments?.[0]?.arrivalTime || '13:00',
      duration: flight.segments?.[0]?.totalTime || '3h 0m',
      price: Math.round(flight.priceBreakdown?.total?.units || 5000),
      currency: 'INR',
      deeplink: `https://www.booking.com/flights`,
      stops: flight.segments?.[0]?.legs?.length - 1 || 0,
      departureCity: params.origin,
      arrivalCity: params.destination,
      departureDate: params.departureDate,
    }));

  } catch (error) {
    console.error('Flight API error:', error);
    throw error;
  }
}
