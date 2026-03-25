import { spatialCache } from './spatialCacheService';
import { ApiClient } from './apiClient';

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

export const fetchLandmarks = async (lat: number, lng: number, radius: number = 5000): Promise<Landmark[]> => {
  // 1. Check Cache
  const cached = await spatialCache.get<Landmark[]>(lat, lng, 'landmarks');
  if (cached) {
    return cached;
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

  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    const url = `${endpoint}?data=${encodeURIComponent(query)}`;

    try {
      const data = await ApiClient.get<OverpassResponse>(url, {
        timeout: 15000,
        retries: 1, // Low retries per endpoint because we have multiple endpoints
        validate: (d) => !!d.elements
      });

      const landmarks = data.elements.map((el) => ({
        id: el.id,
        lat: el.lat ?? el.center?.lat ?? 0,
        lng: el.lon ?? el.center?.lon ?? 0,
        name: el.tags?.name ?? 'Unnamed Feature',
        type: el.tags?.natural ?? 'unknown',
        tags: el.tags ?? {},
      })).filter(l => l.lat !== 0 && l.lng !== 0);

      // Store in cache
      await spatialCache.set(lat, lng, 'landmarks', landmarks);

      return landmarks;
    } catch (error) {
      console.warn(`[OverpassService] Failed to fetch from ${endpoint}:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  console.error('[OverpassService] All Overpass API endpoints failed:', lastError);
  return [];
};
