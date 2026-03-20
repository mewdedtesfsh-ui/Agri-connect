import { useState, useEffect } from 'react';
import axios from '../axios.config';
import { useTranslation } from 'react-i18next';
import FarmerLayout from '../components/FarmerLayout';
import { useAuth } from '../context/AuthContext';

const Weather = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await axios.get(`/api/weather?location=${user.location || 'Addis Ababa'}`);
      setWeather(response.data);
      
      if (response.data.forecast_data?.list) {
        const dailyForecast = response.data.forecast_data.list
          .filter((_, index) => index % 8 === 0)
          .slice(0, 7);
        setForecast(dailyForecast);
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    // Handle undefined or null condition
    if (!condition) {
      condition = 'Clear';
    }
    
    // Normalize condition to match icon map keys
    const normalizedCondition = condition.charAt(0).toUpperCase() + condition.slice(1).toLowerCase();
    
    // Map common weather descriptions to icon categories
    const conditionMap = {
      'Clear': 'Clear',
      'Clouds': 'Clouds',
      'Few clouds': 'Clouds',
      'Scattered clouds': 'Clouds',
      'Broken clouds': 'Clouds',
      'Overcast clouds': 'Clouds',
      'Rain': 'Rain',
      'Light rain': 'Rain',
      'Moderate rain': 'Rain',
      'Heavy rain': 'Rain',
      'Drizzle': 'Drizzle',
      'Light drizzle': 'Drizzle',
      'Thunderstorm': 'Thunderstorm',
      'Snow': 'Snow',
      'Light snow': 'Snow',
      'Heavy snow': 'Snow',
      'Mist': 'Mist',
      'Fog': 'Fog',
      'Haze': 'Mist',
      'Smoke': 'Mist'
    };

    // Find matching category
    const category = conditionMap[normalizedCondition] || 
                     Object.keys(conditionMap).find(key => normalizedCondition.includes(key)) ||
                     'Clear';
    
    const iconMap = {
      'Clear': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="14" fill="#FDB813" />
          <g stroke="#FDB813" strokeWidth="3" strokeLinecap="round">
            <line x1="32" y1="8" x2="32" y2="14" />
            <line x1="32" y1="50" x2="32" y2="56" />
            <line x1="8" y1="32" x2="14" y2="32" />
            <line x1="50" y1="32" x2="56" y2="32" />
            <line x1="14.5" y1="14.5" x2="19" y2="19" />
            <line x1="45" y1="45" x2="49.5" y2="49.5" />
            <line x1="14.5" y1="49.5" x2="19" y2="45" />
            <line x1="45" y1="19" x2="49.5" y2="14.5" />
          </g>
        </svg>
      ),
      'Clouds': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M48 36c4.4 0 8-3.6 8-8s-3.6-8-8-8c-0.5 0-1 0.1-1.5 0.2C45.2 15.4 40.1 12 34 12c-7.7 0-14 6.3-14 14 0 0.3 0 0.6 0 0.9C16.3 27.6 14 30.5 14 34c0 4.4 3.6 8 8 8h26z" fill="#E8E8E8" stroke="#B0B0B0" strokeWidth="2"/>
        </svg>
      ),
      'Rain': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M46 30c3.3 0 6-2.7 6-6s-2.7-6-6-6c-0.4 0-0.8 0.1-1.1 0.2C43.9 14.5 40.1 12 35.5 12c-5.8 0-10.5 4.7-10.5 10.5 0 0.2 0 0.5 0 0.7C22.2 23.7 20 26.1 20 29c0 3.3 2.7 6 6 6h20z" fill="#B0BEC5" stroke="#78909C" strokeWidth="2"/>
          <g stroke="#4FC3F7" strokeWidth="2.5" strokeLinecap="round">
            <line x1="28" y1="38" x2="26" y2="46" />
            <line x1="34" y1="40" x2="32" y2="48" />
            <line x1="40" y1="38" x2="38" y2="46" />
          </g>
        </svg>
      ),
      'Drizzle': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M46 30c3.3 0 6-2.7 6-6s-2.7-6-6-6c-0.4 0-0.8 0.1-1.1 0.2C43.9 14.5 40.1 12 35.5 12c-5.8 0-10.5 4.7-10.5 10.5 0 0.2 0 0.5 0 0.7C22.2 23.7 20 26.1 20 29c0 3.3 2.7 6 6 6h20z" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="2"/>
          <g stroke="#81D4FA" strokeWidth="2" strokeLinecap="round">
            <line x1="26" y1="38" x2="25" y2="42" />
            <line x1="32" y1="40" x2="31" y2="44" />
            <line x1="38" y1="38" x2="37" y2="42" />
            <line x1="44" y1="40" x2="43" y2="44" />
          </g>
        </svg>
      ),
      'Thunderstorm': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M46 28c3.3 0 6-2.7 6-6s-2.7-6-6-6c-0.4 0-0.8 0.1-1.1 0.2C43.9 12.5 40.1 10 35.5 10c-5.8 0-10.5 4.7-10.5 10.5 0 0.2 0 0.5 0 0.7C22.2 21.7 20 24.1 20 27c0 3.3 2.7 6 6 6h20z" fill="#546E7A" stroke="#37474F" strokeWidth="2"/>
          <path d="M34 34l-4 8h4l-2 8 8-10h-4l2-6z" fill="#FDD835" stroke="#F9A825" strokeWidth="1.5"/>
        </svg>
      ),
      'Snow': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <path d="M46 30c3.3 0 6-2.7 6-6s-2.7-6-6-6c-0.4 0-0.8 0.1-1.1 0.2C43.9 14.5 40.1 12 35.5 12c-5.8 0-10.5 4.7-10.5 10.5 0 0.2 0 0.5 0 0.7C22.2 23.7 20 26.1 20 29c0 3.3 2.7 6 6 6h20z" fill="#E3F2FD" stroke="#90CAF9" strokeWidth="2"/>
          <g fill="#BBDEFB">
            <circle cx="28" cy="40" r="2" />
            <circle cx="34" cy="44" r="2" />
            <circle cx="40" cy="40" r="2" />
            <circle cx="31" cy="48" r="1.5" />
            <circle cx="37" cy="48" r="1.5" />
          </g>
        </svg>
      ),
      'Mist': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <g stroke="#B0BEC5" strokeWidth="3" strokeLinecap="round" opacity="0.7">
            <line x1="16" y1="24" x2="48" y2="24" />
            <line x1="12" y1="32" x2="52" y2="32" />
            <line x1="16" y1="40" x2="48" y2="40" />
          </g>
        </svg>
      ),
      'Fog': (
        <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
          <g stroke="#90A4AE" strokeWidth="3" strokeLinecap="round" opacity="0.6">
            <line x1="14" y1="22" x2="50" y2="22" />
            <line x1="10" y1="30" x2="54" y2="30" />
            <line x1="14" y1="38" x2="50" y2="38" />
            <line x1="18" y1="46" x2="46" y2="46" />
          </g>
        </svg>
      )
    };
    return iconMap[category] || iconMap['Clear'];
  };

  const getWeatherAdvice = (temp, humidity, rainfall) => {
    if (rainfall > 10) return { 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: t('weather.advice.heavyRainfall.title'),
      text: t('weather.advice.heavyRainfall.text'),
      bgColor: 'bg-blue-50', 
      borderColor: 'border-blue-200',
      iconBgColor: 'bg-blue-500',
      iconColor: 'text-white',
      textColor: 'text-blue-900',
      subTextColor: 'text-blue-700'
    };
    if (temp > 35) return { 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      title: t('weather.advice.highTemperature.title'),
      text: t('weather.advice.highTemperature.text'),
      bgColor: 'bg-red-50', 
      borderColor: 'border-red-200',
      iconBgColor: 'bg-red-500',
      iconColor: 'text-white',
      textColor: 'text-red-900',
      subTextColor: 'text-red-700'
    };
    if (humidity > 80) return { 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: t('weather.advice.highHumidity.title'),
      text: t('weather.advice.highHumidity.text'),
      bgColor: 'bg-cyan-50', 
      borderColor: 'border-cyan-200',
      iconBgColor: 'bg-cyan-500',
      iconColor: 'text-white',
      textColor: 'text-cyan-900',
      subTextColor: 'text-cyan-700'
    };
    if (temp < 10) return { 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20M2 12h20" />
        </svg>
      ),
      title: t('weather.advice.coldWeather.title'),
      text: t('weather.advice.coldWeather.text'),
      bgColor: 'bg-indigo-50', 
      borderColor: 'border-indigo-200',
      iconBgColor: 'bg-indigo-500',
      iconColor: 'text-white',
      textColor: 'text-indigo-900',
      subTextColor: 'text-indigo-700'
    };
    return { 
      icon: (
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: t('weather.advice.optimal.title'),
      text: t('weather.advice.optimal.text'),
      bgColor: 'bg-green-50', 
      borderColor: 'border-green-200',
      iconBgColor: 'bg-green-500',
      iconColor: 'text-white',
      textColor: 'text-green-900',
      subTextColor: 'text-green-700'
    };
  };

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            <p className="text-xl text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          {/* Page Header */}
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{t('weather.title')}</h1>
            <p className="text-gray-600 mt-1">{t('weather.current')} {user.location || 'Addis Ababa'}</p>
          </div>

          {/* Current Weather Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-8">
              {/* Left: Weather Icon */}
              <div className="w-40 h-40 flex-shrink-0">
                {getWeatherIcon(weather.description)}
              </div>

              {/* Right: Temperature and Details */}
              <div className="flex-1">
                <div className="flex items-baseline gap-3 mb-2">
                  <div className="text-6xl font-bold text-gray-900">
                    {weather.temperature}°
                  </div>
                  <div className="text-2xl text-gray-500">C</div>
                </div>
                <p className="text-xl text-gray-600 capitalize mb-8">{weather.description}</p>

                {/* Weather Metrics Grid */}
                <div className="grid grid-cols-4 gap-8">
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t('weather.humidity')}</p>
                    <p className="text-2xl font-bold text-gray-900">{weather.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t('weather.windSpeed')}</p>
                    <p className="text-2xl font-bold text-gray-900">{weather.wind_speed} m/s</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t('weather.rainfall')}</p>
                    <p className="text-2xl font-bold text-gray-900">{weather.rainfall} mm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">{t('weather.feelsLike')}</p>
                    <p className="text-2xl font-bold text-gray-900">{weather.temperature}°C</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Optimal Conditions Card */}
          {(() => {
            const advice = getWeatherAdvice(weather.temperature, weather.humidity, weather.rainfall);
            return (
              <div className={`${advice.bgColor} rounded-2xl p-6 border-2 ${advice.borderColor} shadow-md`}>
                <div className="flex items-start gap-5">
                  <div className={`${advice.iconBgColor} rounded-xl p-3 flex-shrink-0 shadow-sm`}>
                    <div className={`w-7 h-7 ${advice.iconColor}`}>
                      {advice.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${advice.textColor} text-xl mb-2`}>
                      {advice.title}
                    </h3>
                    <p className={`text-base ${advice.subTextColor} leading-relaxed`}>
                      {advice.text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 7-Day Forecast Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('weather.forecast')}</h2>
            
            <div className="grid grid-cols-7 gap-3">
              {forecast.length > 0 ? (
                forecast.map((day, index) => (
                  <div 
                    key={`${day.dt}-${index}`}
                    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 text-center border border-gray-200 hover:shadow-lg hover:scale-105 hover:border-green-300 transition-all duration-300 cursor-pointer"
                  >
                    <p className="font-bold text-gray-900 mb-4 text-sm">
                      {index === 0 ? t('weather.today') : new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <div className="w-14 h-14 mx-auto mb-4">
                      {getWeatherIcon(day.weather[0].main)}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-3">
                      {Math.round(day.main.temp)}°
                    </p>
                    <p className="text-xs text-gray-600 capitalize leading-tight">
                      {day.weather[0].description}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-7 text-center py-12">
                  <p className="text-gray-500 text-lg">{t('common.noData')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default Weather;
