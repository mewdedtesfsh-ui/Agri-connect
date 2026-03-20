import { useState, useEffect } from 'react';
import axios from '../axios.config';
import { useTranslation } from 'react-i18next';
import FarmerLayout from '../components/FarmerLayout';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { formatDate } from '../i18n/formatters';

const FarmerDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [prices, setPrices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [recentAdvice, setRecentAdvice] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, alertsRes, adviceRes] = await Promise.all([
        axios.get('/api/prices'),
        axios.get(`/api/weather-alerts?location=${user.location || ''}`),
        axios.get('/api/extension/advice')
      ]);

      setPrices(pricesRes.data.slice(0, 10));
      setAlerts(alertsRes.data);
      setRecentAdvice(adviceRes.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-blue-100 border-blue-500 text-blue-800',
      medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      high: 'bg-orange-100 border-orange-500 text-orange-800',
      critical: 'bg-red-100 border-red-500 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 border-gray-500 text-gray-800';
  };

  const getAlertIcon = (alertType) => {
    const icons = {
      'Heavy Rainfall': '🌧️',
      'Flood Risk': '🌊',
      'Drought': '☀️',
      'Extreme Heat': '🔥',
      'Strong Winds': '💨'
    };
    return icons[alertType] || '⚠️';
  };

  if (loading) {
    return (
      <FarmerLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </FarmerLayout>
    );
  }

  return (
    <FarmerLayout>
      <div className="p-4 lg:p-6">
        {/* Header for mobile */}
        <div className="mb-6 lg:hidden">
          <h1 className="text-2xl font-bold mb-1">{t('dashboard.welcome')}, {user.name}!</h1>
          <p className="text-gray-600 text-sm">📍 {user.location}</p>
        </div>

        {/* Weather Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-3">⚠️ Weather Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{getAlertIcon(alert.alert_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold">{alert.alert_type}</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white bg-opacity-50">
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm mb-1">{alert.message}</p>
                      <p className="text-xs opacity-75">
                        📍 {alert.location} • {formatDate(alert.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expert Advice */}
        {recentAdvice.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">📚 {t('advice.title')}</h2>
              <Link to="/advice" className="text-green-600 hover:text-green-700 font-medium text-sm">
                {t('common.view')} {t('common.actions')} →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAdvice.map((article) => (
                <Link 
                  key={article.id} 
                  to="/advice" 
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                >
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                    {article.category}
                  </span>
                  <h3 className="font-bold text-sm mt-3 mb-2 text-gray-800">{article.title}</h3>
                  <p className="text-gray-600 text-xs mb-2">{article.content.substring(0, 80)}...</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(article.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Crop Prices */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold">🌾 {t('marketPrices.title')}</h2>
            <Link to="/prices" className="text-green-600 hover:text-green-700 font-medium text-xs sm:text-sm">
              {t('common.view')} {t('common.actions')} →
            </Link>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-700 font-semibold text-xs sm:text-sm">{t('marketPrices.crop')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-700 font-semibold text-xs sm:text-sm">{t('marketPrices.market')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-700 font-semibold text-xs sm:text-sm">{t('marketPrices.price')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-gray-700 font-semibold text-xs sm:text-sm hidden sm:table-cell">{t('marketPrices.updated')}</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-2 sm:px-4 font-medium text-gray-800 text-xs sm:text-sm">{price.crop_name}</td>
                    <td className="py-3 px-2 sm:px-4 text-gray-600 text-xs sm:text-sm">{price.market_name}</td>
                    <td className="py-3 px-2 sm:px-4 font-bold text-green-600 text-xs sm:text-sm">{price.price} ETB</td>
                    <td className="py-3 px-2 sm:px-4 text-xs text-gray-500 hidden sm:table-cell">{formatDate(price.date_updated)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default FarmerDashboard;
