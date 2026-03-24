
/**
 * Spatial Cache Service
 * Implements a grid-based caching mechanism for geospatial data.
 * Uses a coordinate-to-grid-key mapping to group nearby locations.
 */

export interface CachedData<T> {
  data: T;
  timestamp: number;
  lat: number;
  lng: number;
}

class SpatialCacheService {
  private cache: Map<string, CachedData<any>> = new Map();
  private readonly GRID_PRECISION = 2; // ~1.1km at equator
  private readonly CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

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
   */
  public get<T>(lat: number, lng: number, thresholdKm: number = 1.5): T | null {
    const key = this.getGridKey(lat, lng);
    const cached = this.cache.get(key);

    if (cached) {
      // Check expiry
      if (Date.now() - cached.timestamp > this.CACHE_EXPIRY) {
        this.cache.delete(key);
        return null;
      }

      // Check exact proximity
      const distance = this.getDistance(lat, lng, cached.lat, cached.lng);
      if (distance <= thresholdKm) {
        console.log(`[SpatialCache] Hit for ${key} (Distance: ${distance.toFixed(2)}km)`);
        return cached.data as T;
      }
    }

    // Check neighboring grids if needed (optional optimization)
    // For now, simple grid key is enough for 1-2km
    
    return null;
  }

  /**
   * Stores data in the spatial cache.
   */
  public set<T>(lat: number, lng: number, data: T): void {
    const key = this.getGridKey(lat, lng);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lat,
      lng
    });
    console.log(`[SpatialCache] Stored data for ${key}`);
  }

  /**
   * Clears the entire cache.
   */
  public clear(): void {
    this.cache.clear();
  }
}

export const spatialCache = new SpatialCacheService();
