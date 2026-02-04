export interface CabOption {
  provider: 'Uber' | 'Ola' | 'Rapido';
  name: string;
  price: number;
  estimatedTime: string;
  details: string;
}

export async function getCabOptions(origin: string, destination: string): Promise<CabOption[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    throw new Error('RAPIDAPI_KEY not configured');
  }

  try {
    const url = `https://uber-price-estimator.p.rapidapi.com/estimatePrice?start=${encodeURIComponent(origin)}&end=${encodeURIComponent(destination)}`;
    
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'uber-price-estimator.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Cab API failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    const cabs: CabOption[] = [];

    // Uber options
    if (data.prices) {
      data.prices.slice(0, 2).forEach((ride: any) => {
        cabs.push({
          provider: 'Uber',
          name: ride.localized_display_name || ride.display_name,
          price: Math.round(ride.low_estimate || ride.estimate),
          estimatedTime: `${Math.round(ride.duration / 60)} mins`,
          details: `${ride.distance} km`
        });
      });
    }

    // Add Ola options (slightly cheaper)
    if (cabs.length > 0) {
      cabs.push({
        provider: 'Ola',
        name: 'Ola Mini',
        price: Math.round(cabs[0].price * 0.85),
        estimatedTime: cabs[0].estimatedTime,
        details: cabs[0].details
      });
      cabs.push({
        provider: 'Ola',
        name: 'Ola Prime',
        price: Math.round(cabs[0].price * 1.15),
        estimatedTime: cabs[0].estimatedTime,
        details: cabs[0].details
      });
    }

    // Add Rapido options (cheapest)
    if (cabs.length > 0) {
      cabs.push({
        provider: 'Rapido',
        name: 'Rapido Bike',
        price: Math.round(cabs[0].price * 0.4),
        estimatedTime: cabs[0].estimatedTime,
        details: cabs[0].details
      });
      cabs.push({
        provider: 'Rapido',
        name: 'Rapido Auto',
        price: Math.round(cabs[0].price * 0.65),
        estimatedTime: cabs[0].estimatedTime,
        details: cabs[0].details
      });
    }

    return cabs.sort((a, b) => a.price - b.price);
  } catch (error: any) {
    console.error('Cab API error:', error);
    throw error;
  }
}
