// Mock Cash Points for Withdraw (Cash-Out) and Deposit (Cash-In)
// In production, this would come from an API based on user location

export interface CashPoint {
  id: number;
  alias: string; // WPAY alias for instant payments
  name: string;
  country: string; // ISO 3166-1 alpha-2
  countryName: string;
  city: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  operatingHours: string;
  supportedCurrencies: string[];
  services: ('cash_in' | 'cash_out')[];
  phone?: string;
}

export const CASH_POINTS: CashPoint[] = [
  // Thailand - Bangkok
  {
    id: 1,
    alias: 'CASH_POINT_1',
    name: 'Trendy Offices Sukhumvit',
    country: 'TH',
    countryName: 'Thailand',
    city: 'Bangkok',
    address: 'Sukhumvit Soi 13, Trendy Building, 10F',
    coordinates: { lat: 13.7437, lng: 100.5568 },
    operatingHours: '9:00 AM - 6:00 PM',
    supportedCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'SGD', 'JPY'],
    services: ['cash_in', 'cash_out'],
    phone: '+66 2 123 4567',
  },
  {
    id: 2,
    alias: 'CASH_POINT_2',
    name: 'Suvarnabhumi Airport (BKK)',
    country: 'TH',
    countryName: 'Thailand',
    city: 'Bangkok',
    address: 'Suvarnabhumi Airport, Level 2, Gate D5',
    coordinates: { lat: 13.6900, lng: 100.7501 },
    operatingHours: '24/7',
    supportedCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'SGD'],
    services: ['cash_in', 'cash_out'],
    phone: '+66 2 134 1888',
  },
  {
    id: 3,
    alias: 'CASH_POINT_3',
    name: 'Don Mueang Airport (DMK)',
    country: 'TH',
    countryName: 'Thailand',
    city: 'Bangkok',
    address: 'Don Mueang Airport, Terminal 1, Arrivals Hall',
    coordinates: { lat: 13.9126, lng: 100.6068 },
    operatingHours: '6:00 AM - 11:00 PM',
    supportedCurrencies: ['THB', 'USD', 'EUR', 'GBP', 'JPY', 'CNY'],
    services: ['cash_in', 'cash_out'],
    phone: '+66 2 535 1192',
  },

  // United States
  {
    id: 4,
    alias: 'CASH_POINT_4',
    name: 'LA Downtown Exchange',
    country: 'US',
    countryName: 'United States',
    city: 'Los Angeles',
    address: '633 West 5th Street, Suite 2800',
    coordinates: { lat: 34.0505, lng: -118.2552 },
    operatingHours: '9:00 AM - 6:00 PM',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'MXN', 'JPY'],
    services: ['cash_in', 'cash_out'],
    phone: '+1 213 555 0100',
  },
  {
    id: 5,
    alias: 'CASH_POINT_5',
    name: 'Las Vegas Strip Exchange',
    country: 'US',
    countryName: 'United States',
    city: 'Las Vegas',
    address: '3570 Las Vegas Blvd S, Caesars Palace',
    coordinates: { lat: 36.1162, lng: -115.1745 },
    operatingHours: '24/7',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'MXN', 'JPY', 'CNY'],
    services: ['cash_in', 'cash_out'],
    phone: '+1 702 555 0200',
  },

  // Germany
  {
    id: 6,
    alias: 'CASH_POINT_6',
    name: 'Frankfurt Hauptbahnhof Exchange',
    country: 'DE',
    countryName: 'Germany',
    city: 'Frankfurt',
    address: 'Am Hauptbahnhof 1, 60329 Frankfurt',
    coordinates: { lat: 50.1072, lng: 8.6638 },
    operatingHours: '6:00 AM - 10:00 PM',
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF', 'PLN', 'CZK'],
    services: ['cash_in', 'cash_out'],
    phone: '+49 69 555 0300',
  },

  // France
  {
    id: 7,
    alias: 'CASH_POINT_7',
    name: 'Paris Champs-Élysées Exchange',
    country: 'FR',
    countryName: 'France',
    city: 'Paris',
    address: '125 Avenue des Champs-Élysées, 75008',
    coordinates: { lat: 48.8738, lng: 2.2965 },
    operatingHours: '9:00 AM - 8:00 PM',
    supportedCurrencies: ['EUR', 'USD', 'GBP', 'CHF'],
    services: ['cash_in', 'cash_out'],
    phone: '+33 1 55 55 55 55',
  },

  // UAE
  {
    id: 8,
    alias: 'CASH_POINT_8',
    name: 'Dubai Mall Exchange Center',
    country: 'AE',
    countryName: 'United Arab Emirates',
    city: 'Dubai',
    address: 'The Dubai Mall, Ground Floor, Financial Center Road',
    coordinates: { lat: 25.1972, lng: 55.2744 },
    operatingHours: '10:00 AM - 12:00 AM',
    supportedCurrencies: ['AED', 'USD', 'EUR', 'GBP', 'SAR', 'INR', 'PKR'],
    services: ['cash_in', 'cash_out'],
    phone: '+971 4 555 0400',
  },

  // Hong Kong
  {
    id: 9,
    alias: 'CASH_POINT_9',
    name: 'Central HK Exchange',
    country: 'HK',
    countryName: 'Hong Kong',
    city: 'Hong Kong',
    address: '1 Queen\'s Road Central, HSBC Building',
    coordinates: { lat: 22.2818, lng: 114.1588 },
    operatingHours: '9:00 AM - 7:00 PM',
    supportedCurrencies: ['HKD', 'USD', 'EUR', 'GBP', 'CNY', 'JPY', 'SGD'],
    services: ['cash_in', 'cash_out'],
    phone: '+852 2555 0500',
  },

  // Japan
  {
    id: 10,
    alias: 'CASH_POINT_10',
    name: 'Tokyo Shibuya Exchange',
    country: 'JP',
    countryName: 'Japan',
    city: 'Tokyo',
    address: '21-1 Udagawacho, Shibuya-ku',
    coordinates: { lat: 35.6595, lng: 139.7004 },
    operatingHours: '10:00 AM - 9:00 PM',
    supportedCurrencies: ['JPY', 'USD', 'EUR', 'GBP', 'CNY', 'KRW', 'THB'],
    services: ['cash_in', 'cash_out'],
    phone: '+81 3 5555 0600',
  },
];

// Get unique countries from cash points
export const getAvailableCountries = (): { code: string; name: string }[] => {
  const countries = new Map<string, string>();
  CASH_POINTS.forEach((cp) => {
    if (!countries.has(cp.country)) {
      countries.set(cp.country, cp.countryName);
    }
  });
  return Array.from(countries.entries()).map(([code, name]) => ({ code, name }));
};

// Filter cash points by country
export const getCashPointsByCountry = (countryCode: string): CashPoint[] => {
  return CASH_POINTS.filter((cp) => cp.country === countryCode);
};

// Filter cash points by service type
export const getCashPointsByService = (
  service: 'cash_in' | 'cash_out',
  countryCode?: string
): CashPoint[] => {
  let points = CASH_POINTS.filter((cp) => cp.services.includes(service));
  if (countryCode) {
    points = points.filter((cp) => cp.country === countryCode);
  }
  return points;
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get cash points sorted by distance from user location
export const getCashPointsNearby = (
  userLat: number,
  userLng: number,
  service?: 'cash_in' | 'cash_out'
): (CashPoint & { distance: number })[] => {
  let points = service
    ? CASH_POINTS.filter((cp) => cp.services.includes(service))
    : CASH_POINTS;

  return points
    .map((cp) => ({
      ...cp,
      distance: calculateDistance(
        userLat,
        userLng,
        cp.coordinates.lat,
        cp.coordinates.lng
      ),
    }))
    .sort((a, b) => a.distance - b.distance);
};

// Country code to approximate coordinates (for fallback)
export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  TH: { lat: 13.7563, lng: 100.5018 }, // Bangkok
  US: { lat: 34.0522, lng: -118.2437 }, // Los Angeles
  DE: { lat: 50.1109, lng: 8.6821 }, // Frankfurt
  FR: { lat: 48.8566, lng: 2.3522 }, // Paris
  AE: { lat: 25.2048, lng: 55.2708 }, // Dubai
  HK: { lat: 22.3193, lng: 114.1694 }, // Hong Kong
  JP: { lat: 35.6762, lng: 139.6503 }, // Tokyo
};
