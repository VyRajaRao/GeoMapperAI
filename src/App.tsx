import React, { useState, useEffect, useRef } from 'react';
import { 
  Mountain, 
  Bell, 
  User, 
  LogOut, 
  LogIn,
  Search,
  Plus,
  Minus,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import gsap from 'gsap';
import NavigationBar from './components/Layout/NavigationBar';
import Sidebar from './components/Layout/Sidebar';
import MapboxMap, { MapRef } from './components/MapboxMap';
import AnalyticsView from './components/Views/AnalyticsView';
import ReportsView from './components/Views/ReportsView';
import SettingsView from './components/Views/SettingsView';
import LandingPage from './components/Landing/LandingPage';
import { fetchLandmarks, Landmark } from './services/overpassService';
import { spatialCache } from './services/spatialCacheService';
import { Type } from "@google/genai";

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
  ]
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
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [isFetchingLandmarks, setIsFetchingLandmarks] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

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

    // Check Spatial Cache
    const cached = spatialCache.get<AnalysisData>(latNum, lngNum);
    if (cached) {
      setData(cached);
      setPlaceIntelligence("Data retrieved from spatial cache.");
      return;
    }

    setIsSearchingPlace(true);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: `Analyze the geological and geographical metrics for the location at coordinates ${latitude}, ${longitude}. 
        Return strictly a JSON object with the following fields:
        - elevation (number)
        - terrainType (string)
        - slope (number)
        - riskLevel ("Low", "Moderate", or "High")
        - riskIndex (number 0-100)
        - hydrologicalProximity (number in meters)
        - landmarkDensity (number features/km2)
        - terrainClassificationScore (number 0-100)
        - elevationProfile (array of {distance: number, elevation: number})
        - slopeRiskCorrelation (array of {slope: number, risk: number})
        - terrainDistribution (array of {name: string, value: number, color: string})
        
        Avoid any descriptive text. Return ONLY the JSON object.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              elevation: { type: Type.NUMBER },
              terrainType: { type: Type.STRING },
              slope: { type: Type.NUMBER },
              riskLevel: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
              riskIndex: { type: Type.NUMBER },
              hydrologicalProximity: { type: Type.NUMBER },
              landmarkDensity: { type: Type.NUMBER },
              terrainClassificationScore: { type: Type.NUMBER },
              elevationProfile: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    distance: { type: Type.NUMBER },
                    elevation: { type: Type.NUMBER }
                  }
                }
              },
              slopeRiskCorrelation: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    slope: { type: Type.NUMBER },
                    risk: { type: Type.NUMBER }
                  }
                }
              },
              terrainDistribution: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    value: { type: Type.NUMBER },
                    color: { type: Type.STRING }
                  }
                }
              }
            },
            required: ["elevation", "terrainType", "slope", "riskLevel", "riskIndex", "hydrologicalProximity", "landmarkDensity", "terrainClassificationScore", "elevationProfile", "slopeRiskCorrelation", "terrainDistribution"]
          }
        },
      });

      const result = JSON.parse(response.text || "{}") as AnalysisData;
      setData(result);
      spatialCache.set(latNum, lngNum, result);
      setPlaceIntelligence("Geological intelligence synchronized.");
    } catch (error) {
      console.error("Gemini Error:", error);
      setPlaceIntelligence("Failed to fetch geological intelligence.");
    } finally {
      setIsSearchingPlace(false);
    }
  };

  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAnalyze = async (newLat?: string, newLng?: string) => {
    const finalLat = newLat || lat;
    const finalLng = newLng || lng;
    
    if (newLat) setLat(newLat);
    if (newLng) setLng(newLng);
    
    // Debouncing
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
            <LandingPage key="landing" onLogin={handleLogin} />
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-red-400/50"
              >
                <Bell className="w-5 h-5" />
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

                <main className="flex-1 w-full relative min-w-0">
                  <MapboxMap 
                    ref={mapRef}
                    latitude={parseFloat(lat)} 
                    longitude={parseFloat(lng)} 
                    onMapClick={(newLat, newLng) => handleAnalyze(newLat.toString(), newLng.toString())}
                    activeLayers={activeLayers}
                    mapStyle={mapStyle}
                    landmarks={landmarks}
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
                landmarks={landmarks}
                isAnalyzing={isAnalyzing}
              />
            )}
            {activeTab === 'Reports' && <ReportsView />}
            {activeTab === 'Settings' && <SettingsView />}
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </div>
  );
}
