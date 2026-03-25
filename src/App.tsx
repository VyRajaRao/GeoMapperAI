import React, { useState, useEffect, useRef } from 'react';
import { 
  Mountain, 
  User, 
  LogOut, 
  LogIn,
  Search,
  Plus,
  Minus,
  Maximize2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import gsap from 'gsap';
import NavigationBar from './components/Layout/NavigationBar';
import Sidebar from './components/Layout/Sidebar';
import MapboxMap, { MapRef } from './components/MapboxMap';
import AnalyticsView from './components/Views/AnalyticsView';
import WeatherView from './components/Views/WeatherView';
import SettingsView from './components/Views/SettingsView';
import LandingPage from './components/Landing/LandingPage';
import { fetchLandmarks, Landmark } from './services/overpassService';
import { spatialCache } from './services/spatialCacheService';
import { Type } from "@google/genai";

import { fetchWeather, WeatherData } from './services/weatherService';
import { ApiClient } from './services/apiClient';
import { monitoringService } from './services/monitoringService';

// --- Types ---
export interface AnalysisData {
  elevation: number;
  terrainType: string;
  slope: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  riskIndex: number; // 0-100
  hydrologicalProximity: number; // meters
  landmarkDensity: number; // features per km2
  terrainClassificationScore: number; // 0-100
  elevationProfile: { distance: number; elevation: number }[];
  slopeRiskCorrelation: { slope: number; risk: number }[];
  terrainDistribution: { name: string; value: number; color: string }[];
  // Weather Integration
  weather?: WeatherData;
  weatherAdjustedRiskIndex?: number;
  rainfallImpactFactor?: number;
  terrainStabilityScore?: number;
  environmentalRiskClassification?: string;
}

export const INITIAL_DATA: AnalysisData = {
  elevation: 785,
  terrainType: 'Mountainous',
  slope: 15.7,
  riskLevel: 'High',
  riskIndex: 78,
  hydrologicalProximity: 450,
  landmarkDensity: 12,
  terrainClassificationScore: 85,
  elevationProfile: [
    { distance: 0, elevation: 700 },
    { distance: 1, elevation: 750 },
    { distance: 2, elevation: 785 },
    { distance: 3, elevation: 760 },
    { distance: 4, elevation: 800 },
    { distance: 5, elevation: 820 },
  ],
  slopeRiskCorrelation: [
    { slope: 5, risk: 10 },
    { slope: 15, risk: 30 },
    { slope: 25, risk: 60 },
    { slope: 35, risk: 85 },
    { slope: 45, risk: 95 },
  ],
  terrainDistribution: [
    { name: 'Forest', value: 40, color: '#10B981' },
    { name: 'Rock', value: 30, color: '#6B7280' },
    { name: 'Water', value: 10, color: '#3B82F6' },
    { name: 'Urban', value: 20, color: '#F59E0B' },
  ],
  weather: {
    temperature: 22,
    precipitation: 0,
    windSpeed: 12,
    humidity: 45,
    pressure: 1013,
    cloudCover: 20,
    visibility: 10000,
    condition: 'Clear',
    timestamp: Date.now(),
    hourly: [],
    daily: []
  },
  weatherAdjustedRiskIndex: 78,
  rainfallImpactFactor: 0,
  terrainStabilityScore: 85,
  environmentalRiskClassification: 'Stable'
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [lat, setLat] = useState('34.0522');
  const [lng, setLng] = useState('-118.2437');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [data, setData] = useState<AnalysisData>(INITIAL_DATA);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');
  const [placeIntelligence, setPlaceIntelligence] = useState<string | null>(null);
  const [resolvedPlaceName, setResolvedPlaceName] = useState<string | null>(null);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isFetchingLandmarks, setIsFetchingLandmarks] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('geomapper_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });
  const [hardwareAcceleration, setHardwareAcceleration] = useState(() => {
    const saved = localStorage.getItem('geomapper_hw_accel');
    return saved !== null ? saved === 'true' : true;
  });
  const [dataRetention, setDataRetention] = useState(() => {
    const saved = localStorage.getItem('geomapper_data_retention');
    return saved || '30 days';
  });

  useEffect(() => {
    localStorage.setItem('geomapper_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('geomapper_hw_accel', hardwareAcceleration.toString());
  }, [hardwareAcceleration]);

  useEffect(() => {
    localStorage.setItem('geomapper_data_retention', dataRetention);
  }, [dataRetention]);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPlaceName(lat, lng);
    }
  }, [user]);

  const fetchPlaceName = async (latitude: string, longitude: string) => {
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    // 1. Coordinate Validation
    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      console.error("[Geocoding] Invalid coordinates:", latitude, longitude);
      setResolvedPlaceName("Invalid Location");
      return;
    }

    try {
      const { token } = await ApiClient.get<{ token: string }>('/api/mapbox-token');
      
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngNum},${latNum}.json?access_token=${token}&types=place,locality,neighborhood,address&limit=1`;
      
      const geocodeData = await ApiClient.get<any>(url, {
        validate: (d) => !!d.features
      });
      
      if (geocodeData.features && geocodeData.features.length > 0) {
        setResolvedPlaceName(geocodeData.features[0].place_name);
      } else {
        setResolvedPlaceName(`Region: ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`);
      }
    } catch (error) {
      console.error("[Geocoding] Reverse Geocoding Error:", error);
      setResolvedPlaceName(`Region: ${latNum.toFixed(4)}, ${lngNum.toFixed(4)}`);
    }
  };

  const [activeLayers, setActiveLayers] = useState({
    elevation: true,
    hillshade: true,
    terrainClass: false,
    landmarks: true,
    boundaries: false,
    riskHeatmap: false,
    contours: false,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const fetchPlaceIntelligence = async (latitude: string, longitude: string) => {
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    // 1. Coordinate Validation
    if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
      console.error("[Analysis] Invalid coordinates:", latitude, longitude);
      return;
    }

    // 2. Check Spatial Cache
    const cached = await spatialCache.get<AnalysisData>(latNum, lngNum, 'analysis');
    if (cached) {
      setData(cached);
      setPlaceIntelligence("Data retrieved from spatial cache.");
      return;
    }

    setIsSearchingPlace(true);
    
    try {
      // 1. Fetch Weather Data (Prerequisite for both AI and Fallback)
      const weatherData = await fetchWeather(latNum, lngNum);

      if (!weatherData) {
        throw new Error("Failed to fetch weather data for analysis.");
      }

      // 2. Prepare Fallback Data (Instantaneous)
      const fallbackData = computeDeterministicAnalysis(latNum, lngNum, weatherData);

      // 3. Start AI Analysis in background
      const aiPromise = (async () => {
        const startTime = Date.now();
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
          
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Analyze the geological and geographical metrics for the location at coordinates ${latitude}, ${longitude}. 
            Current Weather Context: ${JSON.stringify(weatherData)}.
            Return strictly a JSON object with the following fields:
            - elevation (number)
            - terrainType (string)
            - slope (number)
            - riskLevel ("Low", "Moderate", or "High")
            - riskIndex (number 0-100)
            - hydrologicalProximity (number in meters)
            - landmarkDensity (number features/km2)
            - terrainClassificationScore (number 0-100)
            - elevationProfile (array of exactly 6 {distance: number, elevation: number} objects)
            - slopeRiskCorrelation (array of exactly 5 {slope: number, risk: number} objects)
            - terrainDistribution (array of exactly 4 {name: string, value: number, color: string} objects)
            - weatherAdjustedRiskIndex (number 0-100)
            - rainfallImpactFactor (number 0-10)
            - terrainStabilityScore (number 0-100)
            - environmentalRiskClassification (string)
            
            Avoid any descriptive text. Return ONLY the JSON object. Ensure the JSON is valid and not truncated.`,
            config: {
              responseMimeType: "application/json",
            },
          });

          const responseTime = Date.now() - startTime;
          monitoringService.logMetric({
            endpoint: 'Gemini AI',
            method: 'GENERATE',
            status: 'success',
            responseTime,
            timestamp: Date.now(),
          });

          let responseText = response.text || "{}";
          if (responseText.includes('```json')) {
            responseText = responseText.split('```json')[1].split('```')[0].trim();
          } else if (responseText.includes('```')) {
            responseText = responseText.split('```')[1].split('```')[0].trim();
          }

          const result = JSON.parse(responseText) as AnalysisData;
          return { ...result, weather: weatherData || undefined };
        } catch (error: any) {
          const responseTime = Date.now() - startTime;
          monitoringService.logMetric({
            endpoint: 'Gemini AI',
            method: 'GENERATE',
            status: 'failure',
            responseTime,
            timestamp: Date.now(),
            error: error.message,
          });
          throw error;
        }
      })();

      // 4. Race AI against a 5-second timeout
      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 5000);
      });

      const aiResult = await Promise.race([aiPromise, timeoutPromise]);

      if (aiResult) {
        // AI won (finished within 5s)
        setData(aiResult);
        await spatialCache.set(latNum, lngNum, 'analysis', aiResult);
        setPlaceIntelligence("Geological intelligence synchronized via AI.");
      } else {
        // Timeout won (AI taking too long)
        setData(fallbackData);
        setPlaceIntelligence("AI analysis delayed. Using deterministic fallback model.");
        
        // Still update when AI finishes
        aiPromise.then(async (finalAiResult) => {
          setData(finalAiResult);
          await spatialCache.set(latNum, lngNum, 'analysis', finalAiResult);
          setPlaceIntelligence("AI analysis completed and updated.");
        }).catch(err => {
          console.error("Late AI Error:", err);
          // Keep fallback data if AI fails
        });
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      const fallbackData = computeDeterministicAnalysis(latNum, lngNum, null);
      setData(fallbackData);
      setPlaceIntelligence("Analysis failed. Using deterministic fallback model.");
    } finally {
      setIsSearchingPlace(false);
    }
  };

  const computeDeterministicAnalysis = (lat: number, lng: number, weather: WeatherData | null): AnalysisData => {
    // Rule-based calculations for fallback
    const baseElevation = 500 + (Math.sin(lat) * 200);
    const baseSlope = 10 + (Math.cos(lng) * 15);
    const rain = weather?.precipitation || 0;
    
    // Landslide risk: steep slope + high rain
    let riskIdx = (baseSlope * 2) + (rain * 5);
    riskIdx = Math.min(100, Math.max(0, riskIdx));
    
    const riskLvl = riskIdx > 70 ? 'High' : riskIdx > 30 ? 'Moderate' : 'Low';
    
    return {
      elevation: Math.round(baseElevation),
      terrainType: baseSlope > 20 ? 'Mountainous' : 'Hilly',
      slope: parseFloat(baseSlope.toFixed(1)),
      riskLevel: riskLvl,
      riskIndex: Math.round(riskIdx),
      hydrologicalProximity: 500 + (Math.random() * 1000),
      landmarkDensity: 5 + Math.floor(Math.random() * 10),
      terrainClassificationScore: 70 + (Math.random() * 20),
      elevationProfile: INITIAL_DATA.elevationProfile,
      slopeRiskCorrelation: INITIAL_DATA.slopeRiskCorrelation,
      terrainDistribution: INITIAL_DATA.terrainDistribution,
      weather: weather || {
        temperature: 20,
        precipitation: 0,
        windSpeed: 10,
        humidity: 50,
        pressure: 1013,
        cloudCover: 0,
        visibility: 10000,
        condition: 'Clear',
        timestamp: Date.now(),
        hourly: [],
        daily: []
      },
      weatherAdjustedRiskIndex: Math.round(riskIdx * (1 + (rain / 20))),
      rainfallImpactFactor: parseFloat((rain / 5).toFixed(1)),
      terrainStabilityScore: Math.round(100 - (riskIdx / 2)),
      environmentalRiskClassification: rain > 10 ? 'High Precipitation Risk' : 'Normal'
    };
  };

  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAnalyze = async (newLat?: string, newLng?: string) => {
    const finalLat = newLat || lat;
    const finalLng = newLng || lng;
    
    if (newLat) setLat(newLat);
    if (newLng) setLng(newLng);
    
    // Fetch place name immediately for better responsiveness
    fetchPlaceName(finalLat, finalLng);
    
    // Debouncing for heavy AI analysis
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    setIsAnalyzing(true);
    
    analysisTimeoutRef.current = setTimeout(async () => {
      await fetchPlaceIntelligence(finalLat, finalLng);
      
      // Fetch Overpass Landmarks
      setIsFetchingLandmarks(true);
      const res = await fetchLandmarks(parseFloat(finalLat), parseFloat(finalLng));
      setLandmarks(res);
      setIsFetchingLandmarks(false);
      setIsAnalyzing(false);
    }, 800); // 800ms debounce
  };

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError("The login popup was closed before completion. Please try again and ensure popups are allowed.");
      } else if (err.code === 'auth/cancelled-popup-request') {
        setLoginError("Login request was cancelled. Please try again.");
      } else {
        setLoginError("An error occurred during login. Please try again later.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => signOut(auth);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#14222E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2EC4B6]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0F14] text-[#F5F7FA] font-sans selection:bg-[#2EC4B6]/30 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {!user ? (
          <div className="relative w-full h-full">
            <LandingPage key="landing" onLogin={handleLogin} isLoggingIn={isLoggingIn} />
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400/50"
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-bold">{loginError}</span>
                <button 
                  onClick={() => setLoginError(null)}
                  className="ml-4 hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </motion.div>
            )}
          </div>
        ) : (
          <>
            <NavigationBar 
              user={user} 
              onLogin={handleLogin} 
              isLoggingIn={isLoggingIn}
              onLogout={handleLogout} 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isSidebarOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
            />
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex w-full min-w-0 overflow-hidden relative"
            >
            {activeTab === 'Dashboard' && (
              <>
                <Sidebar 
                  lat={lat} 
                  lng={lng} 
                  resolvedPlaceName={resolvedPlaceName}
                  onAnalyze={handleAnalyze} 
                  isAnalyzing={isAnalyzing} 
                  data={data}
                  activeLayers={activeLayers}
                  toggleLayer={toggleLayer}
                  mapStyle={mapStyle}
                  setMapStyle={setMapStyle}
                  placeIntelligence={placeIntelligence}
                  isSearchingPlace={isSearchingPlace}
                  landmarks={landmarks}
                  isFetchingLandmarks={isFetchingLandmarks}
                  isOpen={isSidebarOpen}
                  onToggle={toggleSidebar}
                  onNavigateToAnalytics={() => setActiveTab('Analytics')}
                />

                <main className="flex-1 relative min-w-0 h-full">
                  <MapboxMap 
                    ref={mapRef}
                    latitude={parseFloat(lat)} 
                    longitude={parseFloat(lng)} 
                    onMapClick={(newLat, newLng) => handleAnalyze(newLat.toString(), newLng.toString())}
                    activeLayers={activeLayers}
                    mapStyle={mapStyle}
                    landmarks={landmarks}
                    isSidebarOpen={isSidebarOpen}
                    hardwareAcceleration={hardwareAcceleration}
                  />
                  
                  {/* Map Controls Overlay */}
                  <div className="absolute bottom-12 right-6 z-30 flex flex-col gap-2">
                    <button 
                      onClick={() => mapRef.current?.toggleFullscreen()}
                      className="p-3 bg-[#0D141C]/90 backdrop-blur-xl border border-[#1F2937] rounded-xl hover:bg-[#1F2937] transition-all shadow-2xl group"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2EC4B6]" />
                    </button>
                    <div className="flex flex-col border border-[#1F2937] rounded-xl overflow-hidden shadow-2xl">
                      <button 
                        onClick={() => mapRef.current?.zoomIn()}
                        className="p-3 bg-[#0D141C]/90 backdrop-blur-xl hover:bg-[#1F2937] transition-all border-b border-[#1F2937] group"
                        title="Zoom In"
                      >
                        <Plus className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2EC4B6]" />
                      </button>
                      <button 
                        onClick={() => mapRef.current?.zoomOut()}
                        className="p-3 bg-[#0D141C]/90 backdrop-blur-xl hover:bg-[#1F2937] transition-all group"
                        title="Zoom Out"
                      >
                        <Minus className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#2EC4B6]" />
                      </button>
                    </div>
                  </div>
                </main>
              </>
            )}

            {activeTab === 'Analytics' && (
              <AnalyticsView 
                data={data} 
                placeIntelligence={placeIntelligence} 
                resolvedPlaceName={resolvedPlaceName}
                landmarks={landmarks}
                isAnalyzing={isAnalyzing}
                lat={lat}
                lng={lng}
              />
            )}
            {activeTab === 'Weather' && <WeatherView weather={data.weather} locationName={resolvedPlaceName} />}
            {activeTab === 'Settings' && (
              <SettingsView 
                user={user}
                onLogout={handleLogout}
                theme={theme}
                setTheme={setTheme}
                hardwareAcceleration={hardwareAcceleration}
                setHardwareAcceleration={setHardwareAcceleration}
                dataRetention={dataRetention}
                setDataRetention={setDataRetention}
              />
            )}
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </div>
  );
}
