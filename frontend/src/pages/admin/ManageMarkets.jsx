import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../components/ConfirmDialog';

const ManageMarkets = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  const [formData, setFormData] = useState({ name: '', region: '' });
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get('/api/markets');
      setMarkets(response.data);
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMarket) {
        await axios.patch(`/api/markets/${editingMarket.id}`, formData);
      } else {
        await axios.post('/api/markets', formData);
      }
      fetchMarkets();
      setShowForm(false);
      setEditingMarket(null);
      setFormData({ name: '', region: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.operationFailed'));
    }
  };

  const handleEdit = (market) => {
    setEditingMarket(market);
    setFormData({ name: market.name, region: market.region });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: t('admin.deleteMarket'),
      message: t('admin.confirmDeleteMarket'),
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/markets/${id}`);
          setMarkets(markets.filter(m => m.id !== id));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.error || t('messages.failedToDeleteMarket'));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('admin.manageMarkets')}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
          >
            {showForm ? t('common.cancel') : t('admin.addMarket')}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">{editingMarket ? t('admin.editMarket') : t('admin.addNewMarket')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">{t('admin.marketName')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">{t('admin.region')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded hover:bg-secondary"
              >
                {editingMarket ? t('common.update') : t('common.create')}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4">{t('admin.id')}</th>
                  <th className="text-left py-3 px-4">{t('admin.name')}</th>
                  <th className="text-left py-3 px-4">{t('admin.region')}</th>
                  <th className="text-left py-3 px-4">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market) => (
                  <tr key={market.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{market.id}</td>
                    <td className="py-3 px-4 font-semibold">{market.name}</td>
                    <td className="py-3 px-4">{market.region}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(market)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        {t('common.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(market.id)}
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
    </AdminLayout>
  );
};

export default ManageMarkets;
