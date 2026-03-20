import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import FarmerLayout from '../components/FarmerLayout';
import { formatCurrency, formatDate } from '../i18n/formatters';

const MarketPrices = () => {
  const { t } = useTranslation();
  const [prices, setPrices] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, cropsRes] = await Promise.all([
        axios.get('/api/prices'),
        axios.get('/api/crops')
      ]);

      setPrices(pricesRes.data);
      setCrops(cropsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrices = prices.filter(p => {
    const matchesCrop = selectedCrop === 'all' || p.crop_id === parseInt(selectedCrop);
    const matchesSearch = searchTerm === '' || 
      p.crop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.market_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.market_region.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  const getPriceChange = (price) => {
    const change = Math.random() * 10 - 5;
    return change;
  };

  const getCropPriceStats = (cropId) => {
    const cropPrices = prices.filter(p => p.crop_id === cropId);
    if (cropPrices.length <= 1) {
      return { highest: null, lowest: null, hasMultiplePrices: false };
    }
    
    const priceValues = cropPrices.map(p => parseFloat(p.price));
    return {
      highest: Math.max(...priceValues),
      lowest: Math.min(...priceValues),
      hasMultiplePrices: true
    };
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
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">{t('marketPrices.title')}</h1>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">{t('marketPrices.filterByMarket')}</label>
            <select
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="all">{t('marketPrices.allMarkets')}</option>
              {crops.map(crop => (
                <option key={crop.id} value={crop.id}>{t(`dynamic.crops.${crop.name.toLowerCase()}`)}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 text-sm sm:text-base">{t('common.search')}</label>
            <input
              type="text"
              className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
              placeholder={t('marketPrices.searchCrop')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">{t('marketPrices.crop')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">{t('marketPrices.market')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">{t('marketPrices.region')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">{t('marketPrices.price')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">{t('marketPrices.change')}</th>
                  <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm hidden lg:table-cell">{t('marketPrices.updated')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                      {searchTerm || selectedCrop !== 'all' 
                        ? t('tables.noResults')
                        : t('marketPrices.noData')}
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((price) => {
                    const change = getPriceChange(price);
                    const { highest, lowest, hasMultiplePrices } = getCropPriceStats(price.crop_id);
                    const currentPrice = parseFloat(price.price);
                    const isHighest = hasMultiplePrices && currentPrice === highest;
                    const isLowest = hasMultiplePrices && currentPrice === lowest;
                    const isOld = new Date() - new Date(price.date_updated) > 7 * 24 * 60 * 60 * 1000;

                    return (
                      <tr key={price.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 sm:px-4 font-semibold text-xs sm:text-sm">{t(`dynamic.crops.${price.crop_name.toLowerCase()}`)}</td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">{t(`dynamic.markets.${price.market_name.toLowerCase()}`)}</td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden md:table-cell">{t(`dynamic.regions.${price.market_region.toLowerCase()}`)}</td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm">
                          <span className={`font-bold ${isHighest ? 'text-green-600' : isLowest ? 'text-red-600' : ''}`}>
                            {formatCurrency(price.price)}
                          </span>
                          {isHighest && <span className="ml-1 text-xs text-green-600 hidden sm:inline">↑ {t('marketPrices.highestPrice')}</span>}
                          {isLowest && <span className="ml-1 text-xs text-red-600 hidden sm:inline">↓ {t('marketPrices.lowestPrice')}</span>}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm hidden sm:table-cell">
                          <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs hidden lg:table-cell">
                          {formatDate(price.date_updated)}
                          {isOld && <span className="ml-2 text-xs text-orange-600">⚠</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
};

export default MarketPrices;
