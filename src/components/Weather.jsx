import React, { useState, useEffect } from 'react';
import {
  Cloud, Thermometer, Droplets, Wind,
  AlertTriangle, Sun, CloudRain, CloudSun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Weather = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.location) {
      fetchWeatherData();
    }
  }, [user?.location]);

  const WeatherIcon = ({ condition, ...props }) => {
    if (!condition) return <Cloud className="text-gray-400" {...props} />;
    const c = condition.toLowerCase();
    if (c.includes('sun')) return <Sun className="text-yellow-400" {...props} />;
    if (c.includes('partly')) return <CloudSun className="text-sky-400" {...props} />;
    if (c.includes('rain')) return <CloudRain className="text-blue-400" {...props} />;
    if (c.includes('cloud')) return <Cloud className="text-gray-400" {...props} />;
    return <Cloud className="text-gray-400" {...props} />;
  };

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: geocode location to lat/long
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        user.location || 'Hyderabad'
      )}&count=1&language=en&format=json`;

      console.log('Fetching geo data from:', geoUrl);
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error(`Geocoding failed: ${geoRes.status}`);

      const geoJson = await geoRes.json();
      const place = geoJson?.results?.[0];
      if (!place) throw new Error('Could not resolve location to coordinates');

      const { latitude, longitude, name: placeName, admin1, country } = place;
      console.log('Resolved location:', { placeName, latitude, longitude });

      // Step 2: fetch forecast
      // Updated to use 'current' instead of legacy 'current_weather'
      const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

      console.log('Fetching weather data from:', wxUrl);
      const wxRes = await fetch(wxUrl);
      if (!wxRes.ok) throw new Error(`Weather fetch failed: ${wxRes.status}`);

      const wx = await wxRes.json();
      console.log('Weather data received:', wx);

      const formatted = {
        locationLabel: [placeName, admin1, country].filter(Boolean).join(', '),
        current: {
          // New API structure uses 'current' object
          temperatureC: wx?.current?.temperature_2m ?? null,
          windSpeedKph: wx?.current?.wind_speed_10m ?? null,
          weatherCode: wx?.current?.weather_code ?? null,
          time: wx?.current?.time ?? null,
        },
        daily: {
          dates: wx?.daily?.time ?? [],
          maxC: wx?.daily?.temperature_2m_max ?? [],
          minC: wx?.daily?.temperature_2m_min ?? [],
          precipitationMm: wx?.daily?.precipitation_sum ?? [],
        },
      };

      setWeatherData(formatted);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message || t('unableToLoad'));
    }
    setLoading(false);
  };

  const renderLoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        ))}
      </div>
      <div className="space-y-6">
        <div className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-32 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );

  const InfoCard = ({ icon, title, value, gradient }) => (
    <div className={`p-4 rounded-xl text-white shadow-lg ${gradient}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Cloud className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('weatherForecast')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{user.location}</p>
          </div>
        </div>
        <button
          onClick={fetchWeatherData}
          className="px-4 py-2 bg-white dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('updating') : t('refresh')}
        </button>
      </div>

      {loading ? (
        renderLoadingSkeleton()
      ) : error ? (
        <div className="card text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      ) : weatherData && (
        <>
          {/* Current Weather */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard
              icon={<Thermometer size={24} />}
              title={t('temperature')}
              value={
                weatherData.current.temperatureC !== null
                  ? `${Math.round(weatherData.current.temperatureC)}°C`
                  : '—'
              }
              gradient="from-red-500 to-orange-500 bg-gradient-to-br"
            />
            <InfoCard
              icon={<Droplets size={24} />}
              title={t('humidity')}
              value="—" // Open-Meteo free API doesn’t return humidity in this call
              gradient="from-sky-500 to-blue-500 bg-gradient-to-br"
            />
            <InfoCard
              icon={<Wind size={24} />}
              title={t('windSpeed')}
              value={
                weatherData.current.windSpeedKph !== null
                  ? `${Math.round(weatherData.current.windSpeedKph)} km/h`
                  : '—'
              }
              gradient="from-slate-500 to-gray-500 bg-gradient-to-br"
            />
            <InfoCard
              icon={<CloudRain size={24} />}
              title={t('rainfall')}
              value={`${Math.round(weatherData.daily.precipitationMm[0] ?? 0)} mm`}
              gradient="from-indigo-500 to-purple-500 bg-gradient-to-br"
            />
          </div>

          {/* 7-Day Forecast */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('sevenDayForecast')}
            </h2>
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-4">
                {weatherData.daily.dates.map((dateStr, idx) => (
                  <div
                    key={dateStr}
                    className="flex-shrink-0 w-28 text-center p-3 border dark:border-gray-700 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <p className="font-bold text-gray-800 dark:text-white">
                      {new Date(dateStr).toLocaleDateString(undefined, {
                        weekday: 'short',
                      })}
                    </p>
                    <WeatherIcon
                      condition="partly cloudy"
                      className="h-10 w-10 mx-auto my-2"
                    />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {Math.round(weatherData.daily.maxC[idx])}°
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(weatherData.daily.minC[idx])}°
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Weather;
