import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  Droplets, 
  Thermometer, 
  Gauge, 
  CloudLightning,
  Eye,
  Calendar,
  Clock,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ComposedChart
} from 'recharts';
import { WeatherData } from '../../services/weatherService';

interface WeatherViewProps {
  weather?: WeatherData;
  locationName: string;
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D141C] border border-[#1F2937] p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-2 border-b border-[#1F2937] pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 py-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{entry.name}:</span>
            <span className="text-sm font-black text-white">{entry.value}{unit || entry.unit || ''}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const WeatherView: React.FC<WeatherViewProps> = ({ weather, locationName }) => {
  if (!weather || !weather.hourly || weather.hourly.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0A0F14]">
        <div className="text-center space-y-6 max-w-md px-6">
          <div className="w-20 h-20 bg-[#2EC4B6]/10 rounded-full flex items-center justify-center mx-auto relative">
            <div className="absolute inset-0 bg-[#2EC4B6]/20 blur-xl rounded-full animate-pulse" />
            <Cloud className="w-10 h-10 text-[#2EC4B6] relative z-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Initializing Intelligence</h3>
            <p className="text-[10px] text-[#4B5563] font-black uppercase tracking-[0.2em] leading-relaxed">
              Synchronizing with global atmospheric sensors and satellite arrays. 
              Please select a location on the dashboard to begin analysis.
            </p>
          </div>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 bg-[#2EC4B6] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const hourlyData = weather.hourly.map(h => ({
    ...h,
    time: new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fullTime: new Date(h.time).toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  }));

  const dailyData = weather.daily.map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  }));

  const [timeRange, setTimeRange] = React.useState<24 | 48>(24);
  const displayHourlyData = hourlyData.slice(0, timeRange);

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-[#0A0F14] custom-scrollbar">
      {/* Header - Prominent Location Name */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1F2937] pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2EC4B6]/10 rounded-xl">
              <MapPin className="w-6 h-6 text-[#2EC4B6]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#2EC4B6] uppercase tracking-[0.3em] mb-0.5">Intelligence Node Active</p>
              <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{locationName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#111827] border border-[#1F2937] rounded-lg">
              <div className="w-1.5 h-1.5 bg-[#2EC4B6] rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-[#9CA3AF] uppercase tracking-widest">Live Stream</span>
            </div>
            <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-widest">Atmospheric Analytics & Predictive Modeling Suite</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-3 px-5 py-3 bg-[#111827] border border-[#1F2937] rounded-2xl shadow-xl">
            <Clock className="w-4 h-4 text-[#2EC4B6]" />
            <div className="text-right">
              <p className="text-[8px] font-black text-[#4B5563] uppercase tracking-widest">Last Synchronization</p>
              <p className="text-xs font-black text-white uppercase tracking-widest">{new Date(weather.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="flex bg-[#111827] p-1 rounded-xl border border-[#1F2937]">
            {[24, 48].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as 24 | 48)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  timeRange === range 
                    ? 'bg-[#2EC4B6] text-[#0A0F14]' 
                    : 'text-[#4B5563] hover:text-white'
                }`}
              >
                {range}H View
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Temperature', value: `${weather.temperature}°C`, icon: Thermometer, color: '#FF6B35', sub: weather.condition, detail: 'Ambient Air' },
          { label: 'Humidity', value: `${weather.humidity}%`, icon: Droplets, color: '#2EC4B6', sub: 'Relative', detail: 'Saturation' },
          { label: 'Wind Speed', value: `${weather.windSpeed} km/h`, icon: Wind, color: '#A855F7', sub: 'Surface', detail: 'Velocity' },
          { label: 'Pressure', value: `${weather.pressure} hPa`, icon: Gauge, color: '#FFD166', sub: 'MSL', detail: 'Barometric' },
        ].map((metric, i) => (
          <div key={i} className="p-6 bg-[#0D141C] border border-[#1F2937] rounded-3xl group hover:border-[#2EC4B6]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <metric.icon className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl" style={{ backgroundColor: `${metric.color}15` }}>
                <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
              </div>
              <div className="text-right">
                <span className="block text-[9px] font-black text-[#4B5563] uppercase tracking-widest">{metric.sub}</span>
                <span className="block text-[8px] font-bold text-[#2EC4B6] uppercase tracking-widest">{metric.detail}</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-1">{metric.label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Temperature Trend */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B35]/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#FF6B35]/10 rounded-2xl">
                <Thermometer className="w-5 h-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Temperature Gradient</h3>
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">24-Hour Thermal Oscillation</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#0A0F14] border border-[#1F2937] rounded-lg">
              <TrendingUp className="w-3 h-3 text-[#FF6B35]" />
              <span className="text-[9px] font-black text-[#FF6B35] uppercase tracking-widest">Rising</span>
            </div>
          </div>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayHourlyData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  interval={timeRange === 24 ? 2 : 4}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}°`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip unit="°C" />} />
                <Area 
                  type="monotone" 
                  dataKey="temp" 
                  name="Temperature"
                  stroke="#FF6B35" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorTemp)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Precipitation Analysis */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#3B82F6]/10 rounded-2xl">
                <CloudRain className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Precipitation Intensity</h3>
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">Volumetric Liquid Accumulation</p>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayHourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  interval={timeRange === 24 ? 2 : 4}
                />
                <YAxis 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}mm`}
                />
                <Tooltip content={<CustomTooltip unit="mm" />} />
                <Bar 
                  dataKey="precip" 
                  name="Precipitation"
                  fill="#3B82F6" 
                  radius={[6, 6, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity Trends */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2EC4B6]/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#2EC4B6]/10 rounded-2xl">
                <Droplets className="w-5 h-5 text-[#2EC4B6]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Humidity Saturation</h3>
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">Relative Moisture Concentration</p>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayHourlyData}>
                <defs>
                  <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2EC4B6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  interval={timeRange === 24 ? 2 : 4}
                />
                <YAxis 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Area 
                  type="stepAfter" 
                  dataKey="humidity" 
                  name="Humidity"
                  stroke="#2EC4B6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorHum)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Wind vs Pressure - Dual Axis */}
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A855F7]/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#A855F7]/10 rounded-2xl">
                <Wind className="w-5 h-5 text-[#A855F7]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Wind Dynamics & Pressure</h3>
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">Velocity vs Barometric Correlation</p>
              </div>
            </div>
          </div>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayHourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  interval={timeRange === 24 ? 2 : 4}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}km/h`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#4B5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}hPa`}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '2px', paddingTop: '20px' }} 
                />
                <Bar 
                  yAxisId="left" 
                  dataKey="windSpeed" 
                  fill="#A855F7" 
                  radius={[4, 4, 0, 0]} 
                  name="Wind Speed" 
                  unit=" km/h"
                  animationDuration={1500}
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#FFD166" 
                  strokeWidth={4} 
                  dot={false} 
                  name="Pressure" 
                  unit=" hPa"
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visibility & Cloud Cover Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2EC4B6]/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#2EC4B6]/10 rounded-2xl">
                <Cloud className="w-5 h-5 text-[#2EC4B6]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Cloud Cover Density</h3>
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">Atmospheric Opacity Analysis</p>
              </div>
            </div>
          </div>
          <div className="h-[200px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayHourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Area 
                  type="monotone" 
                  dataKey="cloudCover" 
                  name="Cloud Cover"
                  stroke="#2EC4B6" 
                  strokeWidth={2} 
                  fill="#2EC4B6" 
                  fillOpacity={0.1} 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD166]/5 to-transparent pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#FFD166]/10 rounded-2xl">
                <Eye className="w-5 h-5 text-[#FFD166]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Visual Range</h3>
                <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">Atmospheric Visibility Metrics</p>
              </div>
            </div>
          </div>
          <div className="h-[200px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayHourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip unit="m" />} />
                <Area 
                  type="monotone" 
                  dataKey="visibility" 
                  name="Visibility"
                  stroke="#FFD166" 
                  strokeWidth={2} 
                  fill="#FFD166" 
                  fillOpacity={0.1} 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="p-8 bg-[#0D141C] border border-[#1F2937] rounded-3xl space-y-10 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#2EC4B6]/10 rounded-2xl">
              <Calendar className="w-5 h-5 text-[#2EC4B6]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Extended Forecast</h3>
              <p className="text-[9px] font-bold text-[#4B5563] uppercase tracking-widest">7-Day Meteorological Projection</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 relative z-10">
          {dailyData.map((day, i) => (
            <div key={i} className="p-6 bg-[#0A0F14] border border-[#1F2937] rounded-3xl flex flex-col items-center text-center space-y-5 hover:border-[#2EC4B6]/50 hover:shadow-[0_0_30px_rgba(46,196,182,0.1)] transition-all group cursor-default">
              <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-[0.2em]">{day.date}</p>
              <div className="p-4 bg-[#111827] rounded-2xl group-hover:bg-[#2EC4B6]/10 transition-all transform group-hover:scale-110 duration-500">
                {day.condition.includes('Rain') ? <CloudRain className="w-8 h-8 text-[#3B82F6]" /> :
                 day.condition.includes('Cloud') ? <Cloud className="w-8 h-8 text-[#9CA3AF]" /> :
                 day.condition.includes('Storm') ? <CloudLightning className="w-8 h-8 text-[#FFD166]" /> :
                 <Sun className="w-8 h-8 text-[#FF6B35]" />}
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black text-white tracking-tighter">{Math.round(day.tempMax)}°</p>
                <p className="text-[11px] font-bold text-[#4B5563]">{Math.round(day.tempMin)}°</p>
              </div>
              <div className="pt-4 border-t border-[#1F2937] w-full">
                <p className="text-[9px] font-black text-[#2EC4B6] uppercase tracking-widest">{day.condition}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherView;
