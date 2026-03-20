import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/ConfirmDialog';

const ManageCropsAndPrices = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('crops');
  
  // Crops state
  const [crops, setCrops] = useState([]);
  const [showCropForm, setShowCropForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropFormData, setCropFormData] = useState({ name: '', category: '' });
  
  // Prices state
  const [prices, setPrices] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [priceFormData, setPriceFormData] = useState({ crop_id: '', market_id: '', price: '' });
  
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [cropsRes, pricesRes, marketsRes] = await Promise.all([
        axios.get('/api/crops'),
        axios.get('/api/prices'),
        axios.get('/api/markets')
      ]);

      setCrops(cropsRes.data);
      setPrices(pricesRes.data);
      setMarkets(marketsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Crop handlers
  const handleCropSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await axios.patch(`/api/crops/${editingCrop.id}`, cropFormData);
        toast.success('Crop updated successfully');
      } else {
        await axios.post('/api/crops', cropFormData);
        toast.success('Crop created successfully');
      }
      fetchAllData();
      setShowCropForm(false);
      setEditingCrop(null);
      setCropFormData({ name: '', category: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleCropEdit = (crop) => {
    setEditingCrop(crop);
    setCropFormData({ name: crop.name, category: crop.category });
    setShowCropForm(true);
  };

  const handleCropDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Crop',
      message: 'Are you sure? This will delete all associated prices.',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/crops/${id}`);
          setCrops(crops.filter(c => c.id !== id));
          toast.success('Crop deleted successfully');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.error || 'Failed to delete crop');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  // Price handlers
  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/prices', priceFormData);
      toast.success('Price added successfully');
      fetchAllData();
      setShowPriceForm(false);
      setPriceFormData({ crop_id: '', market_id: '', price: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handlePriceUpdate = async (id, newPrice) => {
    try {
      await axios.patch(`/api/prices/${id}`, { price: newPrice });
      toast.success('Price updated successfully');
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update price');
    }
  };

  const handlePriceDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Price',
      message: 'Are you sure you want to delete this price record?',
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/prices/${id}`);
          setPrices(prices.filter(p => p.id !== id));
          toast.success('Price deleted successfully');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.error || 'Failed to delete price');
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Crops & Prices Management</h1>
          <p className="text-gray-600 mt-2">Manage crops and their market prices</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('crops')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'crops'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 7v1a3 3 0 003 3h0a3 3 0 003-3V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2m0 0v1a3 3 0 003 3h0a3 3 0 003-3V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2m-6 0h6m-9 4h0a2 2 0 012 2v7m-2-7h0a2 2 0 00-2 2v7m2-7h2m-2 9h2" />
                </svg>
                Crops ({crops.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab('prices')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'prices'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prices ({prices.length})
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* Crops Tab */}
            {activeTab === 'crops' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Manage Crops</h2>
                  <button
                    onClick={() => {
                      setShowCropForm(!showCropForm);
                      if (showCropForm) {
                        setEditingCrop(null);
                        setCropFormData({ name: '', category: '' });
                      }
                    }}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showCropForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                    </svg>
                    {showCropForm ? 'Cancel' : 'Add Crop'}
                  </button>
                </div>

                {showCropForm && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                    </h3>
                    <form onSubmit={handleCropSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Crop Name</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={cropFormData.name}
                            onChange={(e) => setCropFormData({ ...cropFormData, name: e.target.value })}
                            placeholder="e.g., Wheat, Corn"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Category</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            value={cropFormData.category}
                            onChange={(e) => setCropFormData({ ...cropFormData, category: e.target.value })}
                            placeholder="e.g., Grain, Vegetable"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        {editingCrop ? 'Update Crop' : 'Create Crop'}
                      </button>
                    </form>
                  </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {crops.map((crop) => (
                          <tr key={crop.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 text-sm text-gray-600">{crop.id}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-800">{crop.name}</span>
                            </td>
                            <td className="py-3 px-4">
                              {crop.category && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {crop.category}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleCropEdit(crop)}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleCropDelete(crop.id)}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Prices Tab */}
            {activeTab === 'prices' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Manage Prices</h2>
                  <button
                    onClick={() => {
                      setShowPriceForm(!showPriceForm);
                      if (showPriceForm) {
                        setPriceFormData({ crop_id: '', market_id: '', price: '' });
                      }
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPriceForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                    </svg>
                    {showPriceForm ? 'Cancel' : 'Add Price'}
                  </button>
                </div>

                {showPriceForm && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Price</h3>
                    <form onSubmit={handlePriceSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Crop</label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={priceFormData.crop_id}
                            onChange={(e) => setPriceFormData({ ...priceFormData, crop_id: e.target.value })}
                            required
                          >
                            <option value="">Select Crop</option>
                            {crops.map(crop => (
                              <option key={crop.id} value={crop.id}>{crop.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Market</label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={priceFormData.market_id}
                            onChange={(e) => setPriceFormData({ ...priceFormData, market_id: e.target.value })}
                            required
                          >
                            <option value="">Select Market</option>
                            {markets.map(market => (
                              <option key={market.id} value={market.id}>{market.name} - {market.region}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-700 font-medium mb-2">Price (ETB)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={priceFormData.price}
                            onChange={(e) => setPriceFormData({ ...priceFormData, price: e.target.value })}
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Create Price
                      </button>
                    </form>
                  </div>
                )}

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Crop</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Market</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Region</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Price (ETB)</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Updated</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {prices.map((price) => (
                          <tr key={price.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-semibold text-gray-800">{price.crop_name}</span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{price.market_name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{price.market_region}</td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                step="0.01"
                                className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                defaultValue={price.price}
                                onBlur={(e) => {
                                  if (e.target.value !== price.price.toString()) {
                                    handlePriceUpdate(price.id, e.target.value);
                                  }
                                }}
                              />
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(price.date_updated).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handlePriceDelete(price.id)}
                                className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
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
    </AdminLayout>
  );
};

export default ManageCropsAndPrices;
