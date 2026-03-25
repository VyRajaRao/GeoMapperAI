import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Globe,
  Mountain,
  Waves,
  Cpu,
  ShieldAlert,
  MapPin,
  Download,
  FileText,
  Layers,
  Info,
  Grid
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  PieChart as RePieChart,
  Pie,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { AnalysisData } from '../../App';
import { Landmark } from '../../services/overpassService';

interface AnalyticsViewProps {
  data: AnalysisData;
  placeIntelligence: string | null;
  resolvedPlaceName: string | null;
  landmarks: Landmark[];
  isAnalyzing: boolean;
  lat: string;
  lng: string;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  data,
  placeIntelligence,
  resolvedPlaceName,
  landmarks,
  isAnalyzing,
  lat,
  lng
}) => {
  // Group landmarks by type for charts
  const landmarkCategories = React.useMemo(() => {
    if (!landmarks || !Array.isArray(landmarks)) return [];
    const groups: Record<string, number> = {};
    landmarks.forEach(l => {
      if (!l) return;
      const type = l.type || 'other';
      groups[type] = (groups[type] || 0) + 1;
    });
    return Object.entries(groups).map(([name, value]) => ({ 
      name, 
      value: value || 0,
    })).sort((a, b) => (b.value || 0) - (a.value || 0));
  }, [landmarks]);

  // If no data is selected, show a placeholder
  if (!placeIntelligence && !isAnalyzing && landmarks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0A0F14] text-center space-y-6">
        <div className="w-24 h-24 bg-[#111827] rounded-full flex items-center justify-center border border-[#1F2937] relative">
          <div className="absolute inset-0 bg-[#2EC4B6]/10 blur-2xl rounded-full" />
          <BarChart3 className="w-12 h-12 text-[#4B5563]" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">No Intelligence Data</h2>
          <p className="text-sm text-[#4B5563] font-bold uppercase tracking-widest leading-relaxed">
            Select a location on the dashboard map and run a deep analysis to populate this analytics suite.
          </p>
        </div>
        <button 
          onClick={() => {
            const dashboardTab = document.querySelector('[data-view="dashboard"]') as HTMLElement;
            if (dashboardTab) dashboardTab.click();
          }}
          className="px-8 py-3 bg-[#2EC4B6] text-[#0A0F14] rounded-xl text-[11px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#2EC4B6] transition-all"
        >
          Return to Map
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0A0F14] p-8 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#2EC4B6]/10 rounded-lg">
              <Activity className="w-5 h-5 text-[#2EC4B6]" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Geospatial Intelligence Dashboard</h1>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[#4B5563] font-bold uppercase tracking-widest text-[10px]">
              Real-time terrain analysis and risk assessment metrics
            </p>
            {resolvedPlaceName && (
              <div className="flex items-center gap-2 mt-1">
                <div className="px-2 py-0.5 bg-[#2EC4B6]/10 border border-[#2EC4B6]/30 rounded text-[9px] font-black text-[#2EC4B6] uppercase tracking-widest">
                  Analyzing: {resolvedPlaceName}
                </div>
                <div className="text-[9px] font-mono text-[#4B5563] font-bold">
                  {parseFloat(lat).toFixed(4)}°N, {parseFloat(lng).toFixed(4)}°E
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#111827] border border-[#1F2937] rounded-xl text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] hover:text-white hover:border-[#2EC4B6]/50 transition-all">
            <Download className="w-4 h-4" />
            Export Dataset
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#2EC4B6] text-[#0A0F14] rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#2EC4B6] transition-all">
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Elevation', value: `${data.elevation}m`, icon: Mountain, color: '#FF6B35', trend: '+12m' },
          { label: 'Avg Slope', value: `${data.slope}°`, icon: Activity, color: '#A855F7', trend: '-2.4°' },
          { label: 'Risk Index', value: data.weatherAdjustedRiskIndex || data.riskIndex, icon: ShieldAlert, color: '#EF4444', trend: data.weatherAdjustedRiskIndex ? 'Weather Adj' : 'Stable' },
          { label: 'Terrain Score', value: data.terrainClassificationScore, icon: Grid, color: '#2EC4B6', trend: 'Optimized' },
        ].map((metric, i) => (
          <div key={i} className="p-6 bg-[#0D141C] border border-[#1F2937] rounded-3xl group hover:border-[#2EC4B6]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <metric.icon className="w-16 h-16" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${metric.color}15` }}>
                <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
              </div>
              <span className="text-[9px] font-black text-[#4B5563] uppercase tracking-widest">{metric.trend}</span>
            </div>
            <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-1">{metric.label}</p>
            <p className="text-2xl font-black text-white">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Weather & Environmental Insights */}
      {data.weather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF6B35]/10 rounded-lg">
                  <Globe className="w-4 h-4 text-[#FF6B35]" />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Environmental Risk Classification</h3>
              </div>
              <p className="text-2xl font-black text-[#FF6B35] uppercase italic tracking-tighter">
                {data.environmentalRiskClassification || 'Normal'}
              </p>
              <div className="flex gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest">Rain Impact</p>
                  <p className="text-sm font-black text-white">{data.rainfallImpactFactor || 0}/10</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest">Terrain Stability</p>
                  <p className="text-sm font-black text-white">{data.terrainStabilityScore || 100}%</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-64 grid grid-cols-2 gap-4">
              {[
                { label: 'Temp', value: `${data.weather.temperature}°C` },
                { label: 'Precip', value: `${data.weather.precipitation}mm` },
                { label: 'Wind', value: `${data.weather.windSpeed}km/h` },
                { label: 'Humidity', value: `${data.weather.humidity}%` },
                { label: 'Pressure', value: `${data.weather.pressure}hPa` },
                { label: 'Cloud Cover', value: `${data.weather.cloudCover}%` },
                { label: 'Visibility', value: `${data.weather.visibility}m` },
              ].map((w, i) => (
                <div key={i} className="p-4 bg-[#0A0F14] border border-[#1F2937] rounded-2xl">
                  <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest mb-1">{w.label}</p>
                  <p className="text-sm font-black text-white">{w.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2EC4B6]/10 rounded-lg">
                <Cpu className="w-4 h-4 text-[#2EC4B6]" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">AI Derived Stability</h3>
            </div>
            <div className="relative h-32 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-[#111827]"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * (data.terrainStabilityScore || 0)) / 100}
                  className="text-[#2EC4B6] transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{data.terrainStabilityScore || 0}%</span>
                <span className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest">Stability</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Elevation Profile */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF6B35]/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-[#FF6B35]" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Elevation Profile</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.elevationProfile}>
                <defs>
                  <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="distance" 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  label={{ value: 'Distance (km)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#4B5563' }}
                />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D141C', border: '1px solid #1F2937', borderRadius: '12px', fontSize: '10px' }}
                  itemStyle={{ color: '#FF6B35' }}
                />
                <Area type="monotone" dataKey="elevation" stroke="#FF6B35" strokeWidth={3} fillOpacity={1} fill="url(#colorElev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk vs Slope Correlation */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#EF4444]/10 rounded-lg">
                <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Risk vs Slope Correlation</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis 
                  type="number" 
                  dataKey="slope" 
                  name="Slope" 
                  unit="°" 
                  stroke="#4B5563" 
                  fontSize={10}
                  label={{ value: 'Slope (Degrees)', position: 'insideBottom', offset: -10, fontSize: 10, fill: '#4B5563' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="risk" 
                  name="Risk" 
                  unit="%" 
                  stroke="#4B5563" 
                  fontSize={10}
                  label={{ value: 'Risk Index', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#4B5563' }}
                />
                <ZAxis type="number" range={[64, 144]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0D141C', border: '1px solid #1F2937', borderRadius: '12px', fontSize: '10px' }} />
                <Scatter name="Risk Correlation" data={data.slopeRiskCorrelation} fill="#EF4444" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Terrain Distribution */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#2EC4B6]/10 rounded-lg">
                <PieChart className="w-4 h-4 text-[#2EC4B6]" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Terrain Distribution</h3>
            </div>
          </div>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={data.terrainDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.terrainDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0D141C', border: '1px solid #1F2937', borderRadius: '12px', fontSize: '10px' }} />
              </RePieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-3">
              {data.terrainDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest">{item.name}</span>
                  <span className="text-[10px] font-black text-white ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Landmark Counts */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#3B82F6]/10 rounded-lg">
                <BarChart3 className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Landmark Classification</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={landmarkCategories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0D141C', border: '1px solid #1F2937', borderRadius: '12px', fontSize: '10px' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
