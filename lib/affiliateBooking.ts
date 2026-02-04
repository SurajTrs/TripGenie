import { FlightData, HotelData } from '../types';

export async function searchFlightsAffiliate(params: {
  origin: string;
  destination: string;
  departureDate: string;
  adults: number;
}): Promise<FlightData[]> {
  const airlines = ['IndiGo', 'Air India', 'SpiceJet', 'Vistara', 'GoAir', 'AirAsia'];
  
  return Array.from({ length: 8 }, (_, i) => {
    const airline = airlines[i % airlines.length];
    const price = 3500 + (i * 500);
    const hour = 6 + i;
    const minute = i % 2 === 0 ? '00' : '30';
    
    return {
      id: `flight-${i}`,
      airline,
      flightNumber: `${airline.substring(0, 2).toUpperCase()}-${1000 + i}`,
      departureAirportIata: 'DEL',
      arrivalAirportIata: 'BOM',
      departureTime: `${hour}:${minute}`,
      arrivalTime: `${hour + 2}:${minute}`,
      duration: '2h 30m',
      price,
      currency: 'INR',
      deeplink: `https://www.makemytrip.com/flight/search?itinerary=${params.origin}-${params.destination}-${params.departureDate}&tripType=O&paxType=A-${params.adults}_C-0_I-0&cabinClass=E`,
      stops: i % 3 === 0 ? 1 : 0,
      departureCity: params.origin,
      arrivalCity: params.destination,
      departureDate: params.departureDate,
    };
  });
}

export async function searchHotelsAffiliate(params: {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  budget?: "Luxury" | "Medium" | "Budget-friendly";
}): Promise<HotelData[]> {
  const hotelNames = ['Taj Hotel', 'Oberoi Grand', 'ITC Maratha', 'Hyatt Regency', 'JW Marriott', 'Radisson Blu', 'Lemon Tree', 'Treebo'];
  const budgetPrices = { 'Luxury': 8000, 'Medium': 3500, 'Budget-friendly': 1500 };
  const basePrice = budgetPrices[params.budget || 'Medium'];
  
  return Array.from({ length: 8 }, (_, i) => {
    const price = basePrice + (i * 200);
    
    return {
      id: `hotel-${i}`,
      name: `${hotelNames[i]} ${params.destination}`,
      address: `${params.destination}, India`,
      price,
      currency: 'INR',
      rating: 4.0 + (i % 10) / 10,
      imageUrl: `https://placehold.co/400x250/7c3aed/ffffff?text=${encodeURIComponent(hotelNames[i])}`,
      deeplink: `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(params.destination)}&checkin=${params.checkInDate}&checkout=${params.checkOutDate}&roomStayQualifier=${params.adults || 2}e0e`,
      category: params.budget || 'Medium',
    };
  });
}
