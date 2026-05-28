/**
 * City coordinates mapping for Uttar Pradesh (SEO GPS fix)
 * Used in JSON-LD schemas for accurate Google Maps integration.
 * Covers all major UP cities + NCR border cities.
 */

export interface CityData {
  name: string;           // Display name (capitalized)
  slug: string;           // URL-safe slug (lowercase)
  lat: number;
  lng: number;
  nearbyAreas: string[];  // For SEO content: popular nearby areas
  pincode?: string;       // Optional primary pincode for schema
}

export const UP_CITIES: Record<string, CityData> = {
  'lucknow': {
    name: 'Lucknow',
    slug: 'lucknow',
    lat: 26.8467,
    lng: 80.9462,
    nearbyAreas: ['Gomti Nagar', 'Hazratganj', 'Aminabad', 'Aliganj', 'Indira Nagar', 'Mahanagar', 'Rajajipuram'],
    pincode: '226001'
  },
  'kanpur': {
    name: 'Kanpur',
    slug: 'kanpur',
    lat: 26.4499,
    lng: 80.3319,
    nearbyAreas: ['Swaroop Nagar', 'Kidwai Nagar', 'Kakadeo', 'Govind Nagar', 'Civil Lines', 'Mall Road'],
    pincode: '208001'
  },
  'noida': {
    name: 'Noida',
    slug: 'noida',
    lat: 28.5355,
    lng: 77.3910,
    nearbyAreas: ['Sector 18', 'Sector 62', 'Sector 15', 'Greater Noida', 'Sector 50', 'Sector 137'],
    pincode: '201301'
  },
  'varanasi': {
    name: 'Varanasi',
    slug: 'varanasi',
    lat: 25.3176,
    lng: 82.9739,
    nearbyAreas: ['Sigra', 'Lanka', 'Bhelupur', 'Godowlia', 'Cantonment', 'Pandeypur'],
    pincode: '221001'
  },
  'prayagraj': {
    name: 'Prayagraj',
    slug: 'prayagraj',
    lat: 25.4358,
    lng: 81.8463,
    nearbyAreas: ['Civil Lines', 'Naini', 'Katra', 'George Town', 'Jhunsi', 'Tagore Town'],
    pincode: '211001'
  },
  'agra': {
    name: 'Agra',
    slug: 'agra',
    lat: 27.1767,
    lng: 78.0081,
    nearbyAreas: ['Sadar Bazaar', 'Tajganj', 'Kamla Nagar', 'Dayalbagh', 'Sikandra', 'Fatehabad Road'],
    pincode: '282001'
  },
  'ghaziabad': {
    name: 'Ghaziabad',
    slug: 'ghaziabad',
    lat: 28.6692,
    lng: 77.4538,
    nearbyAreas: ['Indirapuram', 'Vaishali', 'Kaushambi', 'Raj Nagar Extension', 'Vasundhara', 'Crossings Republik'],
    pincode: '201001'
  },
  'gorakhpur': {
    name: 'Gorakhpur',
    slug: 'gorakhpur',
    lat: 26.7606,
    lng: 83.3732,
    nearbyAreas: ['Golghar', 'Civil Lines', 'Mohaddipur', 'Rapti Nagar', 'Medical College Road'],
    pincode: '273001'
  },
  'bareilly': {
    name: 'Bareilly',
    slug: 'bareilly',
    lat: 28.3670,
    lng: 79.4304,
    nearbyAreas: ['Civil Lines', 'Rajendra Nagar', 'Pilibhit Bypass', 'Kutubkhana', 'Subhash Nagar'],
    pincode: '243001'
  },
  'meerut': {
    name: 'Meerut',
    slug: 'meerut',
    lat: 28.9845,
    lng: 77.7064,
    nearbyAreas: ['Pallavpuram', 'Shastri Nagar', 'Saket', 'Western Kutchery', 'Ganga Nagar'],
    pincode: '250001'
  },
  'ballia': {
    name: 'Ballia',
    slug: 'ballia',
    lat: 25.7584,
    lng: 84.1487,
    nearbyAreas: ['Kotwali', 'Rasra', 'Bansdih', 'Sikandarpur', 'Bairiya'],
    pincode: '277001'
  },
  'jhansi': {
    name: 'Jhansi',
    slug: 'jhansi',
    lat: 25.4484,
    lng: 78.5685,
    nearbyAreas: ['Civil Lines', 'Sipri Bazaar', 'Elite Chowk', 'Sadar Bazar', 'Nai Basti'],
    pincode: '284001'
  },
  'aligarh': {
    name: 'Aligarh',
    slug: 'aligarh',
    lat: 27.8974,
    lng: 78.0880,
    nearbyAreas: ['Marris Road', 'Ramghat Road', 'Civil Lines', 'Dodhpur', 'Jamalpur'],
    pincode: '202001'
  },
  'ayodhya': {
    name: 'Ayodhya',
    slug: 'ayodhya',
    lat: 26.7922,
    lng: 82.1998,
    nearbyAreas: ['Faizabad', 'Naya Ghat', 'Hanuman Garhi', 'Civil Lines', 'Ram Ki Paidi'],
    pincode: '224001'
  },
  'mathura': {
    name: 'Mathura',
    slug: 'mathura',
    lat: 27.4924,
    lng: 77.6737,
    nearbyAreas: ['Vrindavan', 'Dampier Nagar', 'Krishna Nagar', 'Highway Road', 'Govind Nagar'],
    pincode: '281001'
  },
  'moradabad': {
    name: 'Moradabad',
    slug: 'moradabad',
    lat: 28.8386,
    lng: 78.7733,
    nearbyAreas: ['Civil Lines', 'Kanth Road', 'Lajpat Nagar', 'MDA Colony'],
    pincode: '244001'
  },
  'saharanpur': {
    name: 'Saharanpur',
    slug: 'saharanpur',
    lat: 29.9680,
    lng: 77.5460,
    nearbyAreas: ['Court Road', 'Chilkana Road', 'Delhi Road', 'Ambala Road'],
    pincode: '247001'
  },
  'firozabad': {
    name: 'Firozabad',
    slug: 'firozabad',
    lat: 27.1591,
    lng: 78.3957,
    nearbyAreas: ['Nai Basti', 'Suhag Nagar', 'Agra Road'],
    pincode: '283203'
  },
  'sultanpur': {
    name: 'Sultanpur',
    slug: 'sultanpur',
    lat: 26.2648,
    lng: 82.0727,
    nearbyAreas: ['Civil Lines', 'Kotwali', 'Kadipur'],
    pincode: '228001'
  },
  'muzaffarnagar': {
    name: 'Muzaffarnagar',
    slug: 'muzaffarnagar',
    lat: 29.4727,
    lng: 77.7085,
    nearbyAreas: ['New Mandi', 'Jansath Road', 'Civil Lines'],
    pincode: '251001'
  },
};

/**
 * Get coordinates for a city (case-insensitive lookup)
 * Falls back to Lucknow if city not found.
 */
export function getCityCoordinates(city: string): { lat: number; lng: number } {
  const slug = city.toLowerCase().trim().replace(/\s+/g, '-');
  const match = UP_CITIES[slug];
  if (match) return { lat: match.lat, lng: match.lng };
  
  // Try partial match
  const partialKey = Object.keys(UP_CITIES).find(k => slug.includes(k) || k.includes(slug));
  if (partialKey) return { lat: UP_CITIES[partialKey].lat, lng: UP_CITIES[partialKey].lng };
  
  // Fallback: Lucknow
  return { lat: 26.8467, lng: 80.9462 };
}

/**
 * Get full CityData for a city slug
 */
export function getCityData(citySlug: string): CityData | null {
  const slug = citySlug.toLowerCase().trim().replace(/\s+/g, '-');
  return UP_CITIES[slug] || null;
}

/**
 * Get all known city slugs (for sitemap and generateStaticParams)
 */
export function getAllCitySlugs(): string[] {
  return Object.keys(UP_CITIES);
}
