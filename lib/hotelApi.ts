import { HotelData } from '../types';

export interface HotelSearchOptions {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  budget?: "Luxury" | "Medium" | "Budget-friendly";
}

export async function searchHotels(options: HotelSearchOptions): Promise<HotelData[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  try {
    // Step 1: Get destination ID
    const searchUrl = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchDestination?query=${encodeURIComponent(options.destination)}`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
      }
    });

    if (!searchResponse.ok) {
      throw new Error(`Destination search failed: ${searchResponse.statusText}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      throw new Error(`No destination found for ${options.destination}`);
    }

    const destId = searchData.data[0].dest_id;

    // Step 2: Search hotels
    const hotelsUrl = `https://booking-com15.p.rapidapi.com/api/v1/hotels/searchHotels?dest_id=${destId}&search_type=CITY&arrival_date=${options.checkInDate}&departure_date=${options.checkOutDate}&adults=${options.adults || 1}&room_qty=1&page_number=1&units=metric&temperature_unit=c&languagecode=en-us&currency_code=INR`;
    
    const hotelsResponse = await fetch(hotelsUrl, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'booking-com15.p.rapidapi.com'
      }
    });

    if (!hotelsResponse.ok) {
      throw new Error(`Hotel search failed: ${hotelsResponse.statusText}`);
    }

    const hotelsData = await hotelsResponse.json();
    
    if (!hotelsData.data?.hotels || hotelsData.data.hotels.length === 0) {
      throw new Error(`No hotels found in ${options.destination}`);
    }

    // Filter by budget
    const budgetRanges = {
      'Budget-friendly': { min: 0, max: 3000 },
      'Medium': { min: 3000, max: 8000 },
      'Luxury': { min: 8000, max: Infinity }
    };

    const range = budgetRanges[options.budget || 'Medium'];

    const hotels: HotelData[] = hotelsData.data.hotels
      .filter((h: any) => {
        const price = h.property?.priceBreakdown?.grossPrice?.value || 0;
        return price >= range.min && price <= range.max;
      })
      .slice(0, 8)
      .map((hotel: any) => ({
        id: hotel.property?.id || hotel.hotel_id,
        name: hotel.property?.name || hotel.hotel_name,
        address: `${hotel.property?.city || options.destination}, ${hotel.property?.countryCode || 'India'}`,
        price: Math.round(hotel.property?.priceBreakdown?.grossPrice?.value || 0),
        currency: hotel.property?.priceBreakdown?.grossPrice?.currency || 'INR',
        rating: hotel.property?.reviewScore || 4.0,
        imageUrl: hotel.property?.photoUrls?.[0] || `https://placehold.co/400x250/7c3aed/ffffff?text=${encodeURIComponent(hotel.property?.name || 'Hotel')}`,
        deeplink: `https://www.booking.com/hotel/in/${hotel.property?.id}.html`,
        category: options.budget || 'Medium',
      }));

    return hotels;
  } catch (error: any) {
    console.error('Hotel API error:', error);
    throw error;
  }
}
