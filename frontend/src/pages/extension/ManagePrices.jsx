import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../components/Navbar';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../components/ConfirmDialog';

const ManagePrices = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [prices, setPrices] = useState([]);
  const [crops, setCrops] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ crop_id: '', market_id: '', price: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pricesRes, cropsRes, marketsRes] = await Promise.all([
        axios.get('/api/prices'),
        axios.get('/api/crops'),
        axios.get('/api/markets')
      ]);

      setPrices(pricesRes.data);
      setCrops(cropsRes.data);
      setMarkets(marketsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/prices', formData);
      fetchData();
      setShowForm(false);
      setFormData({ crop_id: '', market_id: '', price: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.operationFailed'));
    }
  };

  const handleUpdate = async (id, newPrice) => {
    try {
      await axios.patch(`/api/prices/${id}`, { price: newPrice });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.failedToUpdatePrice'));
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: t('extension.deletePrice'),
      message: t('extension.confirmDeletePrice'),
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/prices/${id}`);
          setPrices(prices.filter(p => p.id !== id));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.error || t('messages.failedToDeletePrice'));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('extension.managePrices')}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
          >
            {showForm ? t('common.cancel') : t('extension.addPrice')}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{t('extension.addNewPrice')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">{t('extension.crop')}</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.crop_id}
                    onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                    required
                  >
                    <option value="">{t('extension.selectCrop')}</option>
                    {crops.map(crop => (
                      <option key={crop.id} value={crop.id}>{crop.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">{t('extension.market')}</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.market_id}
                    onChange={(e) => setFormData({ ...formData, market_id: e.target.value })}
                    required
                  >
                    <option value="">{t('extension.selectMarket')}</option>
                    {markets.map(market => (
                      <option key={market.id} value={market.id}>{market.name} - {market.region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">{t('extension.priceEtb')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary"
              >
                {t('common.create')}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4">{t('extension.crop')}</th>
                  <th className="text-left py-3 px-4">{t('extension.market')}</th>
                  <th className="text-left py-3 px-4">{t('extension.region')}</th>
                  <th className="text-left py-3 px-4">{t('extension.priceEtb')}</th>
                  <th className="text-left py-3 px-4">{t('extension.lastUpdated')}</th>
                  <th className="text-left py-3 px-4">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{price.crop_name}</td>
                    <td className="py-3 px-4">{price.market_name}</td>
                    <td className="py-3 px-4">{price.market_region}</td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 px-2 py-1 border rounded"
                        defaultValue={price.price}
                        onBlur={(e) => {
                          if (e.target.value !== price.price.toString()) {
                            handleUpdate(price.id, e.target.value);
                          }
                        }}
                      />
                    </td>
                    <td className="py-3 px-4">{new Date(price.date_updated).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(price.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default ManagePrices;
