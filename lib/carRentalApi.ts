export interface CarRentalData {
  id: string;
  provider: string;
  carType: string;
  price: number;
  currency: string;
  pickUpLocation: string;
  dropOffLocation: string;
  imageUrl?: string;
  deeplink: string;
  features: string[];
}

export interface CarRentalSearchOptions {
  pickUpLocation: string;
  dropOffLocation: string;
  pickUpDate: string;
  dropOffDate: string;
  pickUpTime?: string;
  dropOffTime?: string;
  driverAge?: number;
}

const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'goa': { lat: 15.2993, lng: 74.1240 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
};

export async function searchCarRentals(options: CarRentalSearchOptions): Promise<CarRentalData[]> {
  const rapidApiKey = process.env.RAPID_API_KEY;
  
  if (!rapidApiKey) {
    console.warn("RAPID_API_KEY not configured");
    return generateMockCars(options);
  }

  const pickUpCoords = LOCATION_COORDS[options.pickUpLocation.toLowerCase()] || LOCATION_COORDS['mumbai'];
  const dropOffCoords = LOCATION_COORDS[options.dropOffLocation.toLowerCase()] || pickUpCoords;

  const url = `https://booking-com15.p.rapidapi.com/api/v1/cars/searchCarRentals?pick_up_latitude=${pickUpCoords.lat}&pick_up_longitude=${pickUpCoords.lng}&drop_off_latitude=${dropOffCoords.lat}&drop_off_longitude=${dropOffCoords.lng}&pick_up_time=${options.pickUpTime || '10:00'}&drop_off_time=${options.dropOffTime || '10:00'}&driver_age=${options.driverAge || 30}&currency_code=INR&location=IN`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey,
      },
    });

    if (!response.ok) {
      console.error(`Car rental API failed: ${response.status}`);
      return generateMockCars(options);
    }

    const data = await response.json();
    const cars = data?.data?.vehicles || [];

    return cars.slice(0, 10).map((car: any) => ({
      id: car.id?.toString() || `car-${Math.random()}`,
      provider: car.provider?.name || 'Car Rental',
      carType: car.vehicle?.name || 'Standard Car',
      price: Math.round(car.price?.amount || 2000),
      currency: 'INR',
      pickUpLocation: options.pickUpLocation,
      dropOffLocation: options.dropOffLocation,
      imageUrl: car.vehicle?.image || `https://placehold.co/400x250/7c3aed/ffffff?text=Car`,
      deeplink: car.deeplink || `https://www.booking.com/`,
      features: car.vehicle?.features || ['AC', 'Automatic', '5 Seats'],
    }));

  } catch (error) {
    console.error("Car rental API error:", error);
    return generateMockCars(options);
  }
}

function generateMockCars(options: CarRentalSearchOptions): CarRentalData[] {
  const carTypes = ['Sedan', 'SUV', 'Hatchback'];
  
  return carTypes.map((type, i) => ({
    id: `mock-car-${i + 1}`,
    provider: 'Zoomcar',
    carType: type,
    price: 1500 + (i * 500),
    currency: 'INR',
    pickUpLocation: options.pickUpLocation,
    dropOffLocation: options.dropOffLocation,
    imageUrl: `https://placehold.co/400x250/7c3aed/ffffff?text=${type}`,
    deeplink: `https://www.booking.com/`,
    features: ['AC', 'Automatic', '5 Seats'],
  }));
}
