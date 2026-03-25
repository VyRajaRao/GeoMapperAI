import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mountain, 
  Activity, 
  Layers, 
  Map as MapIcon, 
  Sun, 
  Grid, 
  MapPin, 
  Box, 
  Flame, 
  Waves,
  ChevronLeft,
  Info,
  Globe,
  Moon,
  Zap,
  Cpu,
  ArrowRight,
  BarChart3,
  ShieldAlert,
  Maximize2
} from 'lucide-react';
import { AnalysisData } from '../../App';
import { Landmark } from '../../services/overpassService';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  lat: string;
  lng: string;
  resolvedPlaceName: string | null;
  onAnalyze: (lat?: string, lng?: string) => void;
  isAnalyzing: boolean;
  data: AnalysisData;
  activeLayers: {
    elevation: boolean;
    hillshade: boolean;
    terrainClass: boolean;
    landmarks: boolean;
    boundaries: boolean;
    riskHeatmap: boolean;
    contours: boolean;
  };
  toggleLayer: (layer: any) => void;
  mapStyle: string;
  setMapStyle: (style: string) => void;
  placeIntelligence: string | null;
  isSearchingPlace: boolean;
  landmarks: Landmark[];
  isFetchingLandmarks: boolean;
  onNavigateToAnalytics: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen,
  onToggle,
  lat, 
  lng, 
  resolvedPlaceName,
  onAnalyze, 
  isAnalyzing, 
  data,
  activeLayers,
  toggleLayer,
  mapStyle,
  setMapStyle,
  placeIntelligence,
  isSearchingPlace,
  landmarks,
  isFetchingLandmarks,
  onNavigateToAnalytics
}) => {
  const [lastUpdated, setLastUpdated] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const layerItems = [
    { id: 'elevation', label: '3D Terrain', icon: Mountain, color: '#2EC4B6' },
    { id: 'hillshade', label: 'Hillshade', icon: Sun, color: '#FF6B35' },
    { id: 'contours', label: 'Contours', icon: Waves, color: '#A855F7' },
    { id: 'riskHeatmap', label: 'Risk Heatmap', icon: Flame, color: '#EF4444' },
    { id: 'landmarks', label: 'Landmarks', icon: MapPin, color: '#3B82F6' },
    { id: 'boundaries', label: 'Boundaries', icon: Box, color: '#10B981' },
  ];

  const mapStyles = [
    { id: 'mapbox://styles/mapbox/satellite-streets-v12', label: 'Satellite', icon: Globe },
    { id: 'mapbox://styles/mapbox/streets-v12', label: 'Streets', icon: MapIcon },
    { id: 'mapbox://styles/mapbox/dark-v11', label: 'Dark', icon: Moon },
    { id: 'mapbox://styles/mapbox/outdoors-v12', label: 'Outdoors', icon: Mountain },
  ];

  // Group landmarks by type
  const landmarkCategories = useMemo(() => {
    const groups: Record<string, number> = {};
    landmarks.forEach(l => {
      groups[l.type] = (groups[l.type] || 0) + 1;
    });
    return Object.entries(groups).sort((a, b) => b[1] - a[1]);
  }, [landmarks]);

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isOpen ? 380 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`bg-[#0A0F14] flex flex-col shrink-0 z-20 relative overflow-hidden ${isOpen ? 'border-r border-[#1F2937] shadow-2xl' : 'border-r-0 shadow-none'}`}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#2EC4B6]/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#A855F7]/5 blur-[100px] -ml-32 -mb-32 pointer-events-none" />

      {/* Header */}
      <div className="p-6 border-b border-[#1F2937] flex items-center gap-4 bg-[#0D141C]/50 backdrop-blur-xl relative z-10">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#2EC4B6] to-[#A855F7] rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-10 h-10 bg-[#0A0F14] border border-[#1F2937] rounded-lg flex items-center justify-center shadow-2xl">
            <Mountain className="text-[#2EC4B6] w-6 h-6" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black tracking-tighter uppercase italic text-white leading-none truncate">GeoMapper <span className="text-[#2EC4B6]">AI</span></h1>
          <p className="text-[8px] text-[#4B5563] font-black uppercase tracking-[0.3em] mt-1 truncate">Control Panel</p>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-[#1F2937] rounded-lg transition-all border border-[#1F2937] hover:border-[#2EC4B6]/30 group"
        >
          <ChevronLeft className="w-4 h-4 text-[#4B5563] group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 custom-scrollbar relative z-10">
        
        {/* Location & Analysis Trigger */}
        <section className="space-y-4">
          {resolvedPlaceName && (
            <div className="p-4 bg-[#2EC4B6]/5 border border-[#2EC4B6]/20 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#2EC4B6]" />
              <p className="text-[7px] font-black text-[#2EC4B6] uppercase tracking-[0.3em] mb-1.5">Identified Location</p>
              <h4 className="text-xs font-black text-white leading-tight group-hover:text-[#2EC4B6] transition-colors line-clamp-2 italic">
                {resolvedPlaceName}
              </h4>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2EC4B6]">
              <MapPin className="w-3.5 h-3.5" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Active Coordinates</h3>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#0D141C] border border-[#1F2937] rounded-xl group hover:border-[#2EC4B6]/30 transition-all">
              <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Latitude</p>
              <p className="text-xs font-mono font-black text-white group-hover:text-[#2EC4B6] transition-colors">{parseFloat(lat).toFixed(6)}°</p>
            </div>
            <div className="p-3 bg-[#0D141C] border border-[#1F2937] rounded-xl group hover:border-[#2EC4B6]/30 transition-all">
              <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Longitude</p>
              <p className="text-xs font-mono font-black text-white group-hover:text-[#2EC4B6] transition-colors">{parseFloat(lng).toFixed(6)}°</p>
            </div>
          </div>

          {data.weather && (
            <div className="p-4 bg-[#FF6B35]/5 border border-[#FF6B35]/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#FF6B35]">
                  <Sun className="w-3.5 h-3.5" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Local Weather</h3>
                </div>
                <span className="text-[8px] font-black text-[#FF6B35] uppercase tracking-widest bg-[#FF6B35]/10 px-2 py-0.5 rounded-full">
                  {data.weather.condition}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest">Temp</p>
                  <p className="text-sm font-black text-white">{data.weather.temperature}°C</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest">Precip</p>
                  <p className="text-sm font-black text-white">{data.weather.precipitation}mm</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest">Wind</p>
                  <p className="text-sm font-black text-white">{data.weather.windSpeed}km/h</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest">Pressure</p>
                  <p className="text-sm font-black text-white">{data.weather.pressure}hPa</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest">Humidity</p>
                  <p className="text-sm font-black text-white">{data.weather.humidity}%</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest">Visibility</p>
                  <p className="text-sm font-black text-white">{data.weather.visibility}m</p>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={() => onAnalyze(lat, lng)}
            disabled={isAnalyzing}
            className="w-full group relative py-3 bg-[#2EC4B6] hover:bg-[#26A69A] text-[#0A0F14] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 overflow-hidden shadow-lg shadow-[#2EC4B6]/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <div className="relative flex items-center justify-center gap-2">
              {isAnalyzing ? (
                <div className="w-3 h-3 border-2 border-[#0A0F14] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-[#0A0F14]" />
              )}
              {isAnalyzing ? 'Processing...' : 'Run Deep Analysis'}
            </div>
          </button>
        </section>

        {/* Intelligence Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#A855F7]">
              <Cpu className="w-3.5 h-3.5" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">AI Insights</h3>
            </div>
            <span className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest">Summary</span>
          </div>
          
          <div className="p-5 bg-[#0D141C] border border-[#1F2937] rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2EC4B6] to-[#A855F7] opacity-30" />
            
            {isSearchingPlace ? (
              <div className="flex items-center gap-3 py-4">
                <div className="w-4 h-4 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#A855F7] animate-pulse">Scanning...</span>
              </div>
            ) : placeIntelligence ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-[#0D141C] border border-[#1F2937] rounded-xl">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Risk Index</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#1F2937] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#EF4444]" 
                        style={{ width: `${data.riskIndex}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-white">{data.riskIndex}</span>
                  </div>
                </div>
                <div className="p-3 bg-[#0D141C] border border-[#1F2937] rounded-xl">
                  <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Terrain Score</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#1F2937] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#2EC4B6]" 
                        style={{ width: `${data.terrainClassificationScore}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-black text-white">{data.terrainClassificationScore}</span>
                  </div>
                </div>
                <div className="col-span-2 p-3 bg-[#0D141C] border border-[#1F2937] rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-[7px] font-black text-[#4B5563] uppercase tracking-widest mb-0.5">Hydrological Proximity</p>
                    <p className="text-[10px] font-black text-white">{data.hydrologicalProximity}m</p>
                  </div>
                  <Waves className="w-3 h-3 text-[#3B82F6]" />
                </div>
                <button 
                  onClick={onNavigateToAnalytics}
                  className="col-span-2 flex items-center justify-center gap-2 py-2 text-[8px] font-black uppercase tracking-widest text-[#2EC4B6] hover:bg-[#2EC4B6]/5 rounded-lg transition-all group/btn"
                >
                  Analyze Full Geospatial Data
                  <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#4B5563]">No active report</p>
              </div>
            )}
          </div>
        </section>

        {/* Key Metrics */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#FF6B35]">
            <BarChart3 className="w-3.5 h-3.5" />
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Key Metrics</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#0D141C] border border-[#1F2937] rounded-2xl flex flex-col items-center text-center group hover:border-[#FF6B35]/30 transition-all">
              <div className="p-2 bg-[#FF6B35]/10 rounded-lg mb-2">
                <Mountain className="w-4 h-4 text-[#FF6B35]" />
              </div>
              <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Elevation</p>
              <p className="text-sm font-black text-white">{data.elevation}m</p>
            </div>
            <div className="p-4 bg-[#0D141C] border border-[#1F2937] rounded-2xl flex flex-col items-center text-center group hover:border-[#EF4444]/30 transition-all">
              <div className="p-2 bg-[#EF4444]/10 rounded-lg mb-2">
                <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              </div>
              <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Risk Level</p>
              <p className={`text-sm font-black ${
                data.riskLevel === 'High' ? 'text-[#EF4444]' : 
                data.riskLevel === 'Moderate' ? 'text-[#FF6B35]' : 'text-[#10B981]'
              }`}>{data.riskLevel}</p>
            </div>
            <div className="p-4 bg-[#0D141C] border border-[#1F2937] rounded-2xl flex flex-col items-center text-center group hover:border-[#2EC4B6]/30 transition-all">
              <div className="p-2 bg-[#2EC4B6]/10 rounded-lg mb-2">
                <Activity className="w-4 h-4 text-[#2EC4B6]" />
              </div>
              <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Avg Slope</p>
              <p className="text-sm font-black text-white">{data.slope}°</p>
            </div>
            <div className="p-4 bg-[#0D141C] border border-[#1F2937] rounded-2xl flex flex-col items-center text-center group hover:border-[#3B82F6]/30 transition-all">
              <div className="p-2 bg-[#3B82F6]/10 rounded-lg mb-2">
                <Grid className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest mb-1">Landmark Density</p>
              <p className="text-sm font-black text-white">{data.landmarkDensity}/km²</p>
            </div>
          </div>
        </section>

        {/* Landmark Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#3B82F6]">
              <Grid className="w-3.5 h-3.5" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Terrain Features</h3>
            </div>
            <span className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest">{landmarks.length} Detected</span>
          </div>

          <div className="p-4 bg-[#0D141C] border border-[#1F2937] rounded-2xl space-y-3">
            {isFetchingLandmarks ? (
              <div className="flex items-center gap-3 py-2">
                <div className="w-3 h-3 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                <span className="text-[8px] font-black uppercase tracking-widest text-[#4B5563]">Scanning...</span>
              </div>
            ) : landmarkCategories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {landmarkCategories.slice(0, 5).map(([type, count]) => (
                  <div key={type} className="px-2 py-1 bg-[#111827] border border-[#1F2937] rounded-md flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#4B5563]">{type}</span>
                    <span className="text-[9px] font-bold text-[#3B82F6]">{count}</span>
                  </div>
                ))}
                {landmarkCategories.length > 5 && (
                  <div className="px-2 py-1 bg-[#111827] border border-[#1F2937] rounded-md">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#4B5563]">+{landmarkCategories.length - 5} More</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[9px] font-black uppercase tracking-widest text-[#4B5563] text-center py-2">No features detected</p>
            )}
          </div>
        </section>

        {/* Map Controls */}
        <section className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2EC4B6]">
              <Layers className="w-3.5 h-3.5" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Layer Management</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {layerItems.map(layer => (
                <button 
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    activeLayers[layer.id as keyof typeof activeLayers] 
                      ? 'bg-[#2EC4B6]/10 border-[#2EC4B6]/40 text-white' 
                      : 'bg-[#0D141C] border-[#1F2937] text-[#4B5563] hover:text-white hover:border-[#2EC4B6]/20'
                  }`}
                >
                  <layer.icon className={`w-3.5 h-3.5 ${activeLayers[layer.id as keyof typeof activeLayers] ? 'text-[#2EC4B6]' : ''}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest truncate">{layer.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#2EC4B6]">
              <MapIcon className="w-3.5 h-3.5" />
              <h3 className="text-[9px] font-black uppercase tracking-[0.2em]">Cartographic Style</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {mapStyles.map(style => (
                <button
                  key={style.id}
                  onClick={() => setMapStyle(style.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                    mapStyle === style.id 
                      ? 'bg-[#2EC4B6]/10 border-[#2EC4B6]/40 text-white' 
                      : 'bg-[#0D141C] border-[#1F2937] text-[#4B5563] hover:text-white hover:border-[#2EC4B6]/20'
                  }`}
                >
                  <style.icon className={`w-3.5 h-3.5 ${mapStyle === style.id ? 'text-[#2EC4B6]' : ''}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest truncate">{style.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#1F2937] bg-[#0D141C]">
        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-[#4B5563]">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 bg-[#2EC4B6] rounded-full" />
            <span>System: <span className="text-[#2EC4B6]">Online</span></span>
          </div>
          <span>{lastUpdated}</span>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1F2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #374151;
        }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;
