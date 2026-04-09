import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { fetchWeather, WeatherData } from '../services/weatherService';
import { Landmark } from '../services/overpassService';

export interface MapRef {
  zoomIn: () => void;
  zoomOut: () => void;
  toggleFullscreen: () => void;
}

interface MapboxMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  mapStyle?: string;
  activeLayers?: {
    elevation: boolean;
    hillshade: boolean;
    terrainClass: boolean;
    landmarks: boolean;
    boundaries: boolean;
    riskHeatmap: boolean;
    contours: boolean;
  };
  landmarks?: Landmark[];
  isSidebarOpen?: boolean;
  hardwareAcceleration?: boolean;
}

const MapboxMap = forwardRef<MapRef, MapboxMapProps>(({ 
  latitude, 
  longitude, 
  zoom = 12, 
  onMapClick,
  mapStyle = 'mapbox://styles/mapbox/satellite-streets-v12',
  activeLayers,
  landmarks = [],
  isSidebarOpen = true,
  hardwareAcceleration = true
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const landmarkMarkers = useRef<mapboxgl.Marker[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      map.current?.zoomIn();
    },
    zoomOut: () => {
      map.current?.zoomOut();
    },
    toggleFullscreen: () => {
      if (!mapContainer.current) return;
      if (!document.fullscreenElement) {
        mapContainer.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  }));

  const addLayers = () => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    try {
      // Add DEM source for terrain and hillshade
      if (!map.current.getSource('mapbox-dem')) {
        map.current.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
        });
      }

    // Hillshade Layer
    if (!map.current.getLayer('hillshade')) {
      map.current.addLayer({
        'id': 'hillshade',
        'type': 'hillshade',
        'source': 'mapbox-dem',
        'layout': { 'visibility': activeLayers?.hillshade ? 'visible' : 'none' },
        'paint': { 'hillshade-shadow-color': '#14222E', 'hillshade-opacity': 0 } as any
      });
      if (activeLayers?.hillshade) {
        map.current.setPaintProperty('hillshade', 'hillshade-opacity' as any, 0.6);
      }
    }

    // Contours Layer (from Mapbox Terrain)
    if (!map.current.getSource('contours')) {
      map.current.addSource('contours', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-terrain-v2'
      });
    }
    if (!map.current.getLayer('contour-lines')) {
      map.current.addLayer({
        'id': 'contour-lines',
        'type': 'line',
        'source': 'contours',
        'source-layer': 'contour',
        'layout': {
          'visibility': activeLayers?.contours ? 'visible' : 'none',
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#2EC4B6',
          'line-width': 1,
          'line-opacity': 0
        } as any
      });
      if (activeLayers?.contours) {
        map.current.setPaintProperty('contour-lines', 'line-opacity' as any, 0.4);
      }
    }

    // Risk Heatmap (Simulated)
    if (!map.current.getSource('risk-data')) {
      map.current.addSource('risk-data', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': [
            { 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [longitude, latitude] }, 'properties': { 'risk': 0.8 } },
            { 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [longitude + 0.01, latitude + 0.01] }, 'properties': { 'risk': 0.5 } },
            { 'type': 'Feature', 'geometry': { 'type': 'Point', 'coordinates': [longitude - 0.01, latitude - 0.01] }, 'properties': { 'risk': 0.9 } }
          ]
        }
      });
    }
    if (!map.current.getLayer('risk-heat')) {
      map.current.addLayer({
        'id': 'risk-heat',
        'type': 'heatmap',
        'source': 'risk-data',
        'layout': { 'visibility': activeLayers?.riskHeatmap ? 'visible' : 'none' },
        'paint': {
          'heatmap-weight': ['get', 'risk'],
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(46,196,182,0.2)',
            0.4, 'rgba(46,196,182,0.4)',
            0.6, 'rgba(255,107,53,0.6)',
            0.8, 'rgba(255,107,53,0.8)',
            1, 'rgba(255,107,53,1)'
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0
        } as any
      });
      if (activeLayers?.riskHeatmap) {
        map.current.setPaintProperty('risk-heat', 'heatmap-opacity' as any, 0.8);
      }
    }

    // Set 3D Terrain
    try {
      map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': activeLayers?.elevation ? 1.5 : 0 });
    } catch (err) {
      console.warn('Error setting terrain in addLayers:', err);
    }
    } catch (err) {
      console.warn('Error in addLayers:', err);
    }
  };

  useEffect(() => {
    const initializeMap = () => {
      // Get token from environment variable exposed by Vite
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN;
      
      if (!token) {
        console.error('[MapboxMap] Mapbox token not found in environment');
        setError('Map failed to load. Authentication required.');
        setLoading(false);
        return;
      }

      mapboxgl.accessToken = token;

      if (!mapContainer.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [longitude, latitude],
        zoom: zoom,
        attributionControl: false,
        antialias: true
      });

      // Add Geocoder
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search location...',
        flyTo: false,
        proximity: { longitude, latitude }
      });

      map.current.addControl(geocoder, 'top-left');

      geocoder.on('result', (e) => {
        const [lng, lat] = e.result.center;
        if (onMapClick) onMapClick(lat, lng);
      });

      map.current.on('load', () => {
        setLoading(false);
        
        // Add distinct marker with pulse effect
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.innerHTML = `
          <div class="marker-pulse"></div>
          <div class="marker-core"></div>
        `;

        marker.current = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(map.current!);

        addLayers();
      });

      map.current.on('style.load', () => {
        addLayers();
      });

      map.current.on('click', (e) => {
        if (onMapClick) {
          onMapClick(e.lngLat.lat, e.lngLat.lng);
        }
      });

      map.current.on('error', (e: any) => {
        const errorMessage = e.error?.message || 'Unknown Mapbox error';
        console.error('[MapboxMap] Error event:', errorMessage);
        
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Style') || errorMessage.includes('Unauthorized')) {
           setError('Map failed to load. This usually indicates an invalid or restricted Mapbox Access Token. Please ensure your MAPBOX_ACCESS_TOKEN is correctly configured in the Secrets panel and allows requests from this domain.');
        }
      });
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  // Handle style changes
  useEffect(() => {
    if (map.current && mapStyle) {
      map.current.setStyle(mapStyle);
    }
  }, [mapStyle]);

  // Handle coordinate changes
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({ 
        center: [longitude, latitude], 
        zoom,
        essential: true,
        speed: 0.8,
        curve: 1
      });
      if (marker.current) {
        marker.current.setLngLat([longitude, latitude]);
      }
    }
  }, [latitude, longitude, zoom]);

  // Handle container resize
  useEffect(() => {
    if (!mapContainer.current || !map.current) return;

    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });

    resizeObserver.observe(mapContainer.current);

    // Explicit resize after sidebar animation completes
    const timeout = setTimeout(() => {
      map.current?.resize();
    }, 400); // Slightly longer than the transition to be safe

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [isSidebarOpen]);

  // Handle landmarks
  useEffect(() => {
    if (!map.current) return;

    // Clear existing landmark markers
    landmarkMarkers.current.forEach(m => m.remove());
    landmarkMarkers.current = [];

    if (!activeLayers?.landmarks) return;

    // Add new landmark markers
    landmarks.forEach(l => {
      const el = document.createElement('div');
      el.className = 'landmark-marker';
      el.innerHTML = `
        <div class="landmark-icon">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, className: 'landmark-popup' })
        .setHTML(`
          <div class="p-3 bg-[#0D141C] text-white rounded-lg border border-[#1F2937]">
            <h4 class="text-[11px] font-black uppercase tracking-widest text-[#2EC4B6] mb-1">${l.name}</h4>
            <p class="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold">${l.type}</p>
            ${l.tags.elevation ? `<p class="text-[9px] text-[#4B5563] mt-2">Elevation: ${l.tags.elevation}m</p>` : ''}
          </div>
        `);

      const m = new mapboxgl.Marker(el)
        .setLngLat([l.lng, l.lat])
        .setPopup(popup)
        .addTo(map.current!);
      
      landmarkMarkers.current.push(m);
    });
  }, [landmarks, activeLayers?.landmarks]);

  // Handle layer toggles
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const toggle = (id: string, visible: boolean, opacityProp: string, targetOpacity: number) => {
      try {
        if (!map.current!.getLayer(id)) return;
        if (visible) {
          map.current!.setLayoutProperty(id, 'visibility', 'visible');
          map.current!.setPaintProperty(id, opacityProp as any, 0);
          // Subtle fade-in
          let opacity = 0;
          const interval = setInterval(() => {
            if (!map.current || !map.current.isStyleLoaded()) {
              clearInterval(interval);
              return;
            }
            opacity += 0.1;
            if (opacity >= targetOpacity) {
              map.current!.setPaintProperty(id, opacityProp as any, targetOpacity);
              clearInterval(interval);
            } else {
              map.current!.setPaintProperty(id, opacityProp as any, opacity);
            }
          }, 30);
        } else {
          map.current!.setLayoutProperty(id, 'visibility', 'none');
        }
      } catch (err) {
        console.warn(`Error toggling layer ${id}:`, err);
      }
    };

    toggle('hillshade', !!activeLayers?.hillshade, 'hillshade-opacity', 0.6);
    toggle('contour-lines', !!activeLayers?.contours, 'line-opacity', 0.4);
    toggle('risk-heat', !!activeLayers?.riskHeatmap, 'heatmap-opacity', 0.8);

    try {
      map.current.setTerrain({ 
        'source': 'mapbox-dem', 
        'exaggeration': (activeLayers?.elevation && hardwareAcceleration !== false) ? 1.5 : 0 
      });
    } catch (err) {
      console.warn('Error setting terrain:', err);
    }

  }, [activeLayers, hardwareAcceleration]);

  return (
    <div className="relative w-full h-full bg-[#14222E]">
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#14222E] z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EC4B6]"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#14222E] text-[#F5F7FA] text-[15px] text-center p-4 z-20">
          {error}
        </div>
      )}
      
      <div ref={mapContainer} className="w-full h-full" />
      
      <style>{`
        .mapboxgl-ctrl-geocoder {
          background-color: #0D141C !important;
          backdrop-filter: blur(20px);
          border: 1px solid #1F2937 !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.5) !important;
          width: 420px !important;
          max-width: 420px !important;
          margin: 32px !important;
          font-family: inherit !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .mapboxgl-ctrl-geocoder:focus-within {
          border-color: #2EC4B6 !important;
          box-shadow: 0 0 0 4px rgba(46, 196, 182, 0.1), 0 20px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
        .mapboxgl-ctrl-geocoder--input {
          color: #FFFFFF !important;
          height: 56px !important;
          padding: 12px 52px !important;
          font-size: 14px !important;
          font-weight: 700 !important;
          letter-spacing: 0.02em !important;
        }
        .mapboxgl-ctrl-geocoder--input::placeholder {
          color: #4B5563 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.2em !important;
          font-weight: 900 !important;
        }
        .mapboxgl-ctrl-geocoder--icon-search {
          fill: #2EC4B6 !important;
          left: 18px !important;
          top: 18px !important;
          width: 20px !important;
          height: 20px !important;
        }
        .mapboxgl-ctrl-geocoder--button {
          background: transparent !important;
          top: 14px !important;
          right: 10px !important;
        }
        .mapboxgl-ctrl-geocoder--icon-close {
          fill: #4B5563 !important;
          width: 16px !important;
          height: 16px !important;
        }
        .mapboxgl-ctrl-geocoder--icon-close:hover {
          fill: #FFFFFF !important;
        }
        
        /* Suggestions Styling */
        .mapboxgl-ctrl-geocoder .suggestions {
          background-color: #0D141C !important;
          border: 1px solid #1F2937 !important;
          border-radius: 16px !important;
          margin-top: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.8) !important;
          padding: 8px !important;
        }
        .mapboxgl-ctrl-geocoder .suggestions > li {
          border-radius: 10px !important;
          margin-bottom: 2px !important;
        }
        .mapboxgl-ctrl-geocoder .suggestions > li > a {
          color: #9CA3AF !important;
          padding: 14px 16px !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }
        .mapboxgl-ctrl-geocoder .suggestions > li > a:hover {
          background-color: #1F2937 !important;
          color: #2EC4B6 !important;
          padding-left: 20px !important;
        }
        .mapboxgl-ctrl-geocoder .suggestions > .active > a {
          background-color: #1F2937 !important;
          color: #2EC4B6 !important;
        }
        .mapboxgl-ctrl-geocoder--suggestion-title {
          font-weight: 800 !important;
          color: #FFFFFF !important;
        }
        .mapboxgl-ctrl-geocoder--suggestion-address {
          font-size: 10px !important;
          color: #4B5563 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        /* Custom Marker Styles */
        .custom-marker {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .marker-core {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #2EC4B6, #26A69A);
          border-radius: 50%;
          border: 2.5px solid #FFFFFF;
          z-index: 2;
          box-shadow: 0 0 20px rgba(46, 196, 182, 0.6);
        }
        .marker-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          background-color: rgba(46, 196, 182, 0.3);
          border-radius: 50%;
          animation: pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          z-index: 1;
        }
        @keyframes pulse {
          0% { transform: scale(0.4); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }

        /* Landmark Marker Styles */
        .landmark-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .landmark-marker:hover {
          transform: scale(1.2);
          z-index: 10;
        }
        .landmark-icon {
          width: 20px;
          height: 20px;
          background: #0D141C;
          border: 1.5px solid #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3B82F6;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        }
        .landmark-popup .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
        .landmark-popup .mapboxgl-popup-tip {
          border-top-color: #1F2937 !important;
        }
      `}</style>
    </div>
  );
});

export default MapboxMap;
