import { FlightData, HotelData } from '../types';

export async function searchFlightsTravelPayouts(params: {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}): Promise<FlightData[]> {
  const apiKey = process.env.TRAVELPAYOUTS_API_KEY;
  
  if (!apiKey) {
    throw new Error('TravelPayouts API key not configured');
  }

  const { searchNearestAirport } = await import('./airportSearch');
  const { parseDate, formatDateForAPI } = await import('./dateParser');
  
  const origin = await searchNearestAirport(params.origin);
  const destination = await searchNearestAirport(params.destination);
  const parsedDate = parseDate(params.departureDate);
  const formattedDate = parsedDate ? formatDateForAPI(parsedDate) : new Date().toISOString().split('T')[0];

  const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${formattedDate}&currency=inr&limit=10&token=${apiKey}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TravelPayouts API failed: ${response.statusText}`);
  }

  const data = await response.json();
  const flights = data.data || [];

  return flights.map((flight: any, index: number) => ({
    id: flight.link || `flight-${index}`,
    airline: flight.airline || 'Airline',
    flightNumber: `${flight.airline || 'XX'}-${Math.floor(Math.random() * 9000) + 1000}`,
    departureAirportIata: origin,
    arrivalAirportIata: destination,
    departureTime: flight.departure_at ? new Date(flight.departure_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00',
    arrivalTime: flight.return_at ? new Date(flight.return_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '13:00',
    duration: `${Math.floor((flight.duration || 180) / 60)}h ${(flight.duration || 180) % 60}m`,
    price: Math.round(flight.price) || 5000,
    currency: 'INR',
    deeplink: flight.link || `https://www.aviasales.com/`,
    stops: flight.transfers || 0,
    departureCity: params.origin,
    arrivalCity: params.destination,
    departureDate: params.departureDate,
  }));
}

export async function searchHotelsTravelPayouts(params: {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  budget?: "Luxury" | "Medium" | "Budget-friendly";
}): Promise<HotelData[]> {
  const apiKey = process.env.TRAVELPAYOUTS_API_KEY;
  
  if (!apiKey) {
    throw new Error('TravelPayouts API key not configured');
  }

  const url = `https://engine.hotellook.com/api/v2/cache.json?location=${encodeURIComponent(params.destination)}&checkIn=${params.checkInDate}&checkOut=${params.checkOutDate}&currency=INR&limit=20&token=${apiKey}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`TravelPayouts Hotel API failed: ${response.statusText}`);
  }

  const hotels = await response.json();

  const budgetRanges = {
    'Budget-friendly': { min: 0, max: 3000 },
    'Medium': { min: 3000, max: 8000 },
    'Luxury': { min: 8000, max: Infinity }
  };

  const range = budgetRanges[params.budget || 'Medium'];

  return hotels
    .filter((h: any) => {
      const price = h.priceFrom || 0;
      return price >= range.min && price <= range.max;
    })
    .slice(0, 8)
    .map((hotel: any) => ({
      id: hotel.id || hotel.hotelId,
      name: hotel.hotelName || hotel.name,
      address: `${params.destination}, India`,
      price: Math.round(hotel.priceFrom || 0),
      currency: 'INR',
      rating: hotel.stars || 4.0,
      imageUrl: hotel.photoUrl || `https://placehold.co/400x250/7c3aed/ffffff?text=${encodeURIComponent(hotel.hotelName || 'Hotel')}`,
      deeplink: hotel.link || `https://www.hotellook.com/`,
      category: params.budget || 'Medium',
    }));
}
