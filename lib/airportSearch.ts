const AIRPORT_MAP: Record<string, string> = {
  'delhi': 'DEL', 'mumbai': 'BOM', 'bangalore': 'BLR', 'chennai': 'MAA',
  'kolkata': 'CCU', 'hyderabad': 'HYD', 'pune': 'PNQ', 'goa': 'GOI',
  'jaipur': 'JAI', 'ahmedabad': 'AMD', 'kochi': 'COK', 'lucknow': 'LKO',
  'london': 'LHR', 'paris': 'CDG', 'new york': 'JFK', 'dubai': 'DXB',
  'singapore': 'SIN', 'tokyo': 'NRT', 'bangkok': 'BKK', 'sydney': 'SYD'
};

export async function searchNearestAirport(city: string): Promise<string> {
  const cityLower = city.toLowerCase().trim();
  
  if (AIRPORT_MAP[cityLower]) {
    return AIRPORT_MAP[cityLower];
  }

  const apiKey = process.env.DUFFEL_API_KEY;
  if (!apiKey) {
    throw new Error('Duffel API key not configured');
  }

  try {
    const response = await fetch(`https://api.duffel.com/air/airports?iata_city_code=${encodeURIComponent(cityLower.toUpperCase().slice(0, 3))}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Duffel-Version': 'v2',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      console.error('Duffel airport search error:', response.status);
      throw new Error(`Unable to find airport for ${city}`);
    }

    const data = await response.json();
    const airports = data?.data || [];

    if (airports.length === 0) {
      throw new Error(`No airports found near ${city}`);
    }

    return airports[0].iata_code;

  } catch (error) {
    console.error('Airport search error:', error);
    throw error;
  }
}
