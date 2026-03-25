import { spatialCache } from './spatialCacheService';
import { ApiClient } from './apiClient';

export interface WeatherData {
  // Current
  temperature: number;
  precipitation: number;
  windSpeed: number;
  humidity: number;
  pressure: number;
  cloudCover: number;
  visibility: number;
  condition: string;
  timestamp: number;
  
  // Forecast
  hourly: Array<{
    time: string;
    temp: number;
    precip: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    cloudCover: number;
    visibility: number;
  }>;
  daily: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    precipSum: number;
    condition: string;
  }>;
}

export const fetchWeather = async (lat: number, lng: number): Promise<WeatherData | null> => {
  // 1. Check Cache
  const cached = await spatialCache.get<WeatherData>(lat, lng, 'weather');
  if (cached) {
    return cached;
  }

  // 2. Primary API: Open-Meteo
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,precipitation,windspeed_10m,pressure_msl,cloudcover,visibility&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
    
    const data = await ApiClient.get<any>(url, {
      validate: (d) => !!d.current_weather && !!d.hourly && !!d.daily
    });

    const weather: WeatherData = {
      temperature: data.current_weather.temperature,
      precipitation: data.hourly.precipitation[0] || 0,
      windSpeed: data.current_weather.windspeed,
      humidity: data.hourly.relativehumidity_2m[0] || 50,
      pressure: data.hourly.pressure_msl[0] || 1013,
      cloudCover: data.hourly.cloudcover[0] || 0,
      visibility: data.hourly.visibility[0] || 10000,
      condition: getWeatherCondition(data.current_weather.weathercode),
      timestamp: Date.now(),
      hourly: data.hourly.time.slice(0, 48).map((time: string, i: number) => ({
        time,
        temp: data.hourly.temperature_2m[i],
        precip: data.hourly.precipitation[i],
        humidity: data.hourly.relativehumidity_2m[i],
        windSpeed: data.hourly.windspeed_10m[i],
        pressure: data.hourly.pressure_msl[i],
        cloudCover: data.hourly.cloudcover[i],
        visibility: data.hourly.visibility[i] || 10000
      })),
      daily: data.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        precipSum: data.daily.precipitation_sum[i],
        condition: getWeatherCondition(data.daily.weathercode[i])
      }))
    };

    await spatialCache.set(lat, lng, 'weather', weather);
    return weather;
  } catch (error) {
    console.warn('[WeatherService] Open-Meteo failed, trying fallback:', error);
  }

  // 3. Secondary API: OpenWeatherMap
  const owmKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (owmKey) {
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${owmKey}&units=metric`;
      
      const data = await ApiClient.get<any>(url, {
        validate: (d) => !!d.list && d.list.length > 0
      });

      const current = data.list[0];
      const dailyMap = new Map();
      
      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            tempMax: item.main.temp_max,
            tempMin: item.main.temp_min,
            precipSum: item.rain ? item.rain['3h'] || 0 : 0,
            condition: item.weather[0].main
          });
        } else {
          const day = dailyMap.get(date);
          day.tempMax = Math.max(day.tempMax, item.main.temp_max);
          day.tempMin = Math.min(day.tempMin, item.main.temp_min);
          day.precipSum += item.rain ? item.rain['3h'] || 0 : 0;
        }
      });

      const weather: WeatherData = {
        temperature: current.main.temp,
        precipitation: current.rain ? current.rain['3h'] || 0 : 0,
        windSpeed: current.wind.speed,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        cloudCover: current.clouds.all,
        visibility: current.visibility || 10000,
        condition: current.weather[0].main,
        timestamp: Date.now(),
        hourly: data.list.slice(0, 16).map((item: any) => ({
          time: item.dt_txt,
          temp: item.main.temp,
          precip: item.rain ? item.rain['3h'] || 0 : 0,
          humidity: item.main.humidity,
          windSpeed: item.wind.speed,
          pressure: item.main.pressure,
          cloudCover: item.clouds.all,
          visibility: item.visibility || 10000
        })),
        daily: Array.from(dailyMap.values())
      };

      await spatialCache.set(lat, lng, 'weather', weather);
      return weather;
    } catch (error) {
      console.error('[WeatherService] OpenWeatherMap fallback failed:', error);
    }
  }

  return null;
};

const getWeatherCondition = (code: number | string): string => {
  if (typeof code === 'string') return code;
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 55) return 'Drizzle';
  if (code <= 65) return 'Rainy';
  if (code <= 75) return 'Snowy';
  if (code <= 82) return 'Rain Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
};
