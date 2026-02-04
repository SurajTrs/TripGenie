import { NextRequest, NextResponse } from 'next/server';
import {
  searchRealFlights,
  searchRealHotels,
  searchRealTrains,
  searchRealBuses,
  RealFlightSearchParams,
  RealHotelSearchParams,
  RealTrainSearchParams,
  RealBusSearchParams,
} from '../../../lib/realTimeBooking';

/**
 * Real-Time Search API - Production-Level
 * Integrates with actual APIs: Amadeus, Booking.com, RapidAPI, etc.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchType, params } = body;

    console.log(`🔍 Real-time search initiated: ${searchType}`);

    switch (searchType) {
      case 'flights':
        return await handleFlightSearch(params);

      case 'hotels':
        return await handleHotelSearch(params);

      case 'trains':
        return await handleTrainSearch(params);

      case 'buses':
        return await handleBusSearch(params);

      case 'all':
        return await handleCompleteSearch(params);

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid search type. Use: flights, hotels, trains, buses, or all',
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Real-time search error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Search failed',
      errorCode: error.code || 'SEARCH_ERROR',
    }, { status: 500 });
  }
}

/**
 * Handle flight search with Amadeus API
 */
async function handleFlightSearch(params: any) {
  try {
    // Validate required parameters
    if (!params.origin || !params.destination || !params.departureDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: origin, destination, departureDate',
      }, { status: 400 });
    }

    const searchParams: RealFlightSearchParams = {
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults || 1,
      children: params.children || 0,
      infants: params.infants || 0,
      travelClass: params.travelClass || 'ECONOMY',
      nonStop: params.nonStop || false,
      currencyCode: params.currencyCode || 'INR',
      maxPrice: params.maxPrice,
    };

    console.log('🛫 Searching real flights with Amadeus API...');

    const flights = await searchRealFlights(searchParams);

    // Transform to user-friendly format
    const transformedFlights = flights.slice(0, 10).map((flight, index) => ({
      id: flight.id || `FLIGHT_${index + 1}`,
      airline: flight.validatingAirlineCodes?.[0] || 'Unknown',
      flightNumber: flight.itineraries[0]?.segments[0]?.flightNumber || 'N/A',
      departureAirport: flight.itineraries[0]?.segments[0]?.departure?.iataCode || params.origin,
      arrivalAirport: flight.itineraries[0]?.segments[flight.itineraries[0]?.segments.length - 1]?.arrival?.iataCode || params.destination,
      departureTime: flight.itineraries[0]?.segments[0]?.departure?.at || '',
      arrivalTime: flight.itineraries[0]?.segments[flight.itineraries[0]?.segments.length - 1]?.arrival?.at || '',
      duration: flight.itineraries[0]?.duration || 'N/A',
      price: parseFloat(flight.price?.total || '0'),
      currency: flight.price?.currency || 'INR',
      availableSeats: flight.numberOfBookableSeats || 0,
      stops: flight.itineraries[0]?.segments.length - 1 || 0,
      class: searchParams.travelClass,
      rawData: flight, // Store complete data for booking
    }));

    return NextResponse.json({
      success: true,
      type: 'flights',
      count: transformedFlights.length,
      results: transformedFlights,
      searchParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Flight search error:', error);
    return NextResponse.json({
      success: false,
      type: 'flights',
      error: error.message || 'Flight search failed',
      errorCode: 'FLIGHT_SEARCH_ERROR',
    }, { status: 500 });
  }
}

/**
 * Handle hotel search with Amadeus/Booking.com API
 */
async function handleHotelSearch(params: any) {
  try {
    if (!params.cityCode || !params.checkInDate || !params.checkOutDate) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: cityCode, checkInDate, checkOutDate',
      }, { status: 400 });
    }

    const searchParams: RealHotelSearchParams = {
      cityCode: params.cityCode,
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults: params.adults || 2,
      rooms: params.rooms || 1,
      priceRange: params.priceRange,
      amenities: params.amenities || [],
      stars: params.stars || [],
      sortBy: params.sortBy || 'PRICE',
    };

    console.log('🏨 Searching real hotels with Amadeus API...');

    const hotels = await searchRealHotels(searchParams);

    // Sort based on preference
    const sortedHotels = hotels.sort((a, b) => {
      switch (searchParams.sortBy) {
        case 'PRICE':
          return a.price.total - b.price.total;
        case 'RATING':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    const transformedHotels = sortedHotels.slice(0, 15).map(hotel => ({
      id: hotel.hotelId,
      name: hotel.name,
      rating: hotel.rating,
      address: `${hotel.address.street}, ${hotel.address.city}`,
      city: hotel.address.city,
      price: hotel.price.total,
      pricePerNight: hotel.price.perNight,
      currency: hotel.price.currency,
      available: hotel.available,
      amenities: hotel.amenities.slice(0, 10),
      images: hotel.images.slice(0, 5),
      location: hotel.location,
      rooms: hotel.rooms.slice(0, 3),
      policies: hotel.policies,
      rawData: hotel,
    }));

    return NextResponse.json({
      success: true,
      type: 'hotels',
      count: transformedHotels.length,
      results: transformedHotels,
      searchParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Hotel search error:', error);
    return NextResponse.json({
      success: false,
      type: 'hotels',
      error: error.message || 'Hotel search failed',
      errorCode: 'HOTEL_SEARCH_ERROR',
    }, { status: 500 });
  }
}

/**
 * Handle train search with RapidAPI/IRCTC
 */
async function handleTrainSearch(params: any) {
  try {
    if (!params.from || !params.to || !params.date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: from, to, date',
      }, { status: 400 });
    }

    const searchParams: RealTrainSearchParams = {
      from: params.from,
      to: params.to,
      date: params.date,
      class: params.class || '3AC',
      quota: params.quota || 'GENERAL',
    };

    console.log('🚂 Searching real trains...');

    const trains = await searchRealTrains(searchParams);

    return NextResponse.json({
      success: true,
      type: 'trains',
      count: trains.length,
      results: trains,
      searchParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Train search error:', error);
    return NextResponse.json({
      success: false,
      type: 'trains',
      error: error.message || 'Train search failed',
      errorCode: 'TRAIN_SEARCH_ERROR',
    }, { status: 500 });
  }
}

/**
 * Handle bus search with RedBus/AbhiBus API
 */
async function handleBusSearch(params: any) {
  try {
    if (!params.from || !params.to || !params.date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: from, to, date',
      }, { status: 400 });
    }

    const searchParams: RealBusSearchParams = {
      from: params.from,
      to: params.to,
      date: params.date,
      passengers: params.passengers || 1,
    };

    console.log('🚌 Searching real buses...');

    const buses = await searchRealBuses(searchParams);

    return NextResponse.json({
      success: true,
      type: 'buses',
      count: buses.length,
      results: buses,
      searchParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Bus search error:', error);
    return NextResponse.json({
      success: false,
      type: 'buses',
      error: error.message || 'Bus search failed',
      errorCode: 'BUS_SEARCH_ERROR',
    }, { status: 500 });
  }
}

/**
 * Handle complete trip search (flights + hotels)
 */
async function handleCompleteSearch(params: any) {
  try {
    console.log('🌍 Searching complete trip (flights + hotels)...');

    const [flightResponse, hotelResponse] = await Promise.allSettled([
      handleFlightSearch(params),
      handleHotelSearch(params),
    ]);

    const results: any = {
      success: true,
      type: 'complete',
      timestamp: new Date().toISOString(),
    };

    if (flightResponse.status === 'fulfilled') {
      const flightData = await flightResponse.value.json();
      results.flights = flightData;
    } else {
      results.flights = { success: false, error: 'Flight search failed' };
    }

    if (hotelResponse.status === 'fulfilled') {
      const hotelData = await hotelResponse.value.json();
      results.hotels = hotelData;
    } else {
      results.hotels = { success: false, error: 'Hotel search failed' };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('❌ Complete search error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Complete search failed',
    }, { status: 500 });
  }
}

/**
 * GET endpoint for API documentation
 */
export async function GET() {
  return NextResponse.json({
    name: 'TravixAI Real-Time Search API',
    version: '1.0.0',
    description: 'Production-level travel search with real API integrations',
    endpoints: {
      POST: {
        description: 'Search for flights, hotels, trains, or buses',
        body: {
          searchType: 'flights | hotels | trains | buses | all',
          params: 'Search parameters based on type',
        },
        examples: {
          flights: {
            searchType: 'flights',
            params: {
              origin: 'DEL',
              destination: 'BOM',
              departureDate: '2024-12-25',
              returnDate: '2024-12-30',
              adults: 2,
              travelClass: 'ECONOMY',
            },
          },
          hotels: {
            searchType: 'hotels',
            params: {
              cityCode: 'DEL',
              checkInDate: '2024-12-25',
              checkOutDate: '2024-12-28',
              adults: 2,
              rooms: 1,
            },
          },
        },
      },
    },
    integrations: {
      flights: 'Amadeus API (Production)',
      hotels: 'Amadeus Hotel API (Production)',
      trains: 'RapidAPI/IRCTC (Mock fallback)',
      buses: 'RedBus API (Mock fallback)',
    },
    status: 'Production Ready',
  });
}
