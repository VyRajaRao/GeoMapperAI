export interface Landmark {
  id: number;
  lat: number;
  lng: number;
  name: string;
  type: string;
  tags: Record<string, string>;
}

export interface OverpassResponse {
  elements: Array<{
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    center?: {
      lat: number;
      lon: number;
    };
    tags?: Record<string, string>;
  }>;
}

const CACHE_PREFIX = 'overpass_cache_';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

const getCacheKey = (lat: number, lng: number, radius: number) => {
  // Round to 3 decimal places (~110m precision) to improve cache hits for nearby clicks
  const roundedLat = lat.toFixed(3);
  const roundedLng = lng.toFixed(3);
  return `${CACHE_PREFIX}${roundedLat}_${roundedLng}_${radius}`;
};

export const fetchLandmarks = async (lat: number, lng: number, radius: number = 5000): Promise<Landmark[]> => {
  const cacheKey = getCacheKey(lat, lng, radius);
  
  // Try to load from cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
        console.log('Serving landmarks from cache:', cacheKey);
        return data;
      }
      // Expired cache
      localStorage.removeItem(cacheKey);
    }
  } catch (e) {
    console.warn('Cache read error:', e);
  }

  const query = `
    [out:json][timeout:25];
    (
      node["natural"~"peak|ridge|valley|water|volcano|glacier|spring|cave_entrance"](around:${radius}, ${lat}, ${lng});
      way["natural"~"peak|ridge|valley|water|volcano|glacier|spring|cave_entrance"](around:${radius}, ${lat}, ${lng});
      relation["natural"~"peak|ridge|valley|water|volcano|glacier|spring|cave_entrance"](around:${radius}, ${lat}, ${lng});
    );
    out center;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Overpass API request failed');
    }
    const data: OverpassResponse = await response.json();

    const landmarks = data.elements.map((el) => ({
      id: el.id,
      lat: el.lat ?? el.center?.lat ?? 0,
      lng: el.lon ?? el.center?.lon ?? 0,
      name: el.tags?.name ?? 'Unnamed Feature',
      type: el.tags?.natural ?? 'unknown',
      tags: el.tags ?? {},
    })).filter(l => l.lat !== 0 && l.lng !== 0);

    // Store in cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: landmarks,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Handle quota exceeded or other storage errors gracefully
      console.warn('Cache write error (likely quota exceeded):', e);
      // Optional: Clear old cache entries if quota is exceeded
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        Object.keys(localStorage)
          .filter(key => key.startsWith(CACHE_PREFIX))
          .forEach(key => localStorage.removeItem(key));
      }
    }

    return landmarks;
  } catch (error) {
    console.error('Error fetching landmarks from Overpass:', error);
    
    // Fallback to expired cache if available during offline/error
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data } = JSON.parse(cached);
        console.log('Serving expired landmarks from cache due to network error:', cacheKey);
        return data;
      }
    } catch (e) { /* ignore */ }

    return [];
  }
};
