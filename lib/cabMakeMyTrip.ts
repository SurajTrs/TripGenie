export interface CabOption {
  provider: 'Uber' | 'Ola' | 'Rapido';
  name: string;
  price: number;
  estimatedTime: string;
  details: string;
  deeplink: string;
}

export async function getCabOptions(origin: string, destination: string): Promise<CabOption[]> {
  const baseCabs = [
    { provider: 'Rapido' as const, name: 'Rapido Bike', multiplier: 0.4 },
    { provider: 'Rapido' as const, name: 'Rapido Auto', multiplier: 0.65 },
    { provider: 'Ola' as const, name: 'Ola Mini', multiplier: 0.85 },
    { provider: 'Uber' as const, name: 'UberGo', multiplier: 1.0 },
    { provider: 'Ola' as const, name: 'Ola Prime', multiplier: 1.15 },
    { provider: 'Uber' as const, name: 'Uber Premier', multiplier: 1.45 },
  ];

  const basePrice = 450;
  const estimatedTime = '25 mins';
  const distance = '12 km';

  return baseCabs.map(cab => ({
    provider: cab.provider,
    name: cab.name,
    price: Math.round(basePrice * cab.multiplier),
    estimatedTime,
    details: distance,
    deeplink: `https://www.makemytrip.com/cabs/?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}`
  }));
}
