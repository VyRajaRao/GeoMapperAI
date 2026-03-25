import { db, auth } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  limit
} from 'firebase/firestore';

/**
 * Spatial Cache Service
 * Implements a grid-based caching mechanism for geospatial data.
 * Uses a coordinate-to-grid-key mapping to group nearby locations.
 * Persists data to Firestore for cross-session availability.
 */
export type CacheType = 'analysis' | 'weather' | 'landmarks';

export interface CachedData<T> {
  data: T;
  timestamp: number;
  lat: number;
  lng: number;
  gridKey: string;
  uid: string;
  type: CacheType;
}

class SpatialCacheService {
  private memoryCache: Map<string, CachedData<any>> = new Map();
  private readonly GRID_PRECISION = 2; // ~1.1km at equator
  
  // TTLs in milliseconds
  private readonly TTL_MAP: Record<CacheType, number> = {
    'analysis': 1000 * 60 * 60 * 24 * 7, // 7 days (terrain is stable)
    'weather': 1000 * 60 * 60, // 1 hour
    'landmarks': 1000 * 60 * 60 * 24 * 30 // 30 days
  };

  /**
   * Generates a unique key for a given coordinate based on grid precision.
   */
  private getGridKey(lat: number, lng: number): string {
    const gridLat = Math.floor(lat * Math.pow(10, this.GRID_PRECISION)) / Math.pow(10, this.GRID_PRECISION);
    const gridLng = Math.floor(lng * Math.pow(10, this.GRID_PRECISION)) / Math.pow(10, this.GRID_PRECISION);
    return `${gridLat.toFixed(this.GRID_PRECISION)},${gridLng.toFixed(this.GRID_PRECISION)}`;
  }

  /**
   * Calculates distance between two coordinates in km using Haversine formula.
   */
  private getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Retrieves data from cache if it exists within the proximity threshold.
   * Checks memory first, then Firestore.
   * Searches the current grid and 8 neighboring grids for the closest match.
   */
  public async get<T>(lat: number, lng: number, type: CacheType, thresholdKm: number = 1.5): Promise<T | null> {
    const centerGridLat = Math.floor(lat * Math.pow(10, this.GRID_PRECISION));
    const centerGridLng = Math.floor(lng * Math.pow(10, this.GRID_PRECISION));
    
    const gridOffsets = [
      [0, 0], [0, 1], [0, -1],
      [1, 0], [1, 1], [1, -1],
      [-1, 0], [-1, 1], [-1, -1]
    ];

    let bestMatch: CachedData<T> | null = null;
    let minDistance = thresholdKm;

    for (const [dLat, dLng] of gridOffsets) {
      const gridLat = (centerGridLat + dLat) / Math.pow(10, this.GRID_PRECISION);
      const gridLng = (centerGridLng + dLng) / Math.pow(10, this.GRID_PRECISION);
      const key = `${gridLat.toFixed(this.GRID_PRECISION)},${gridLng.toFixed(this.GRID_PRECISION)}`;
      const cacheId = `${type}_${key.replace(',', '_')}`;

      // 1. Check Memory Cache
      let cached = this.memoryCache.get(cacheId);

      // 2. If not in memory, check Firestore
      if (!cached) {
        try {
          const cacheRef = doc(db, 'spatial_cache', cacheId);
          const docSnap = await getDoc(cacheRef);
          
          if (docSnap.exists()) {
            cached = docSnap.data() as CachedData<T>;
            this.memoryCache.set(cacheId, cached);
          }
        } catch (error) {
          console.warn(`[SpatialCache] Firestore read error for ${type} at ${key}:`, error);
        }
      }

      if (cached) {
        // Check expiry
        const ttl = this.TTL_MAP[type];
        if (Date.now() - cached.timestamp > ttl) {
          this.memoryCache.delete(cacheId);
          continue;
        }

        // Check proximity
        const distance = this.getDistance(lat, lng, cached.lat, cached.lng);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = cached;
        }
      }
    }

    if (bestMatch) {
      console.log(`[SpatialCache] ${type} hit (Distance: ${minDistance.toFixed(2)}km)`);
      return bestMatch.data;
    }
    
    return null;
  }

  /**
   * Stores data in the spatial cache (Memory + Firestore).
   */
  public async set<T>(lat: number, lng: number, type: CacheType, data: T): Promise<void> {
    const key = this.getGridKey(lat, lng);
    const cacheId = `${type}_${key.replace(',', '_')}`;
    const uid = auth.currentUser?.uid || 'anonymous';
    
    const cacheEntry: CachedData<T> = {
      data,
      timestamp: Date.now(),
      lat,
      lng,
      gridKey: key,
      uid,
      type
    };

    // Update Memory
    this.memoryCache.set(cacheId, cacheEntry);

    // Update Firestore
    try {
      const cacheRef = doc(db, 'spatial_cache', cacheId);
      await setDoc(cacheRef, cacheEntry);
      console.log(`[SpatialCache] Persisted ${type} to Firestore for ${key}`);
    } catch (error) {
      console.error(`[SpatialCache] Firestore write error for ${type}:`, error);
    }
  }

  /**
   * Clears the entire memory cache.
   */
  public clear(): void {
    this.memoryCache.clear();
  }
}

export const spatialCache = new SpatialCacheService();
