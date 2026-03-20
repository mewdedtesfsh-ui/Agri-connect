import { useState, useEffect } from 'react';
import axios from '../../axios.config';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/AdminLayout';
import ConfirmDialog from '../../components/ConfirmDialog';

const ManageOfficers = () => {
  const { t } = useTranslation();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      const response = await axios.get('/api/users');
      const extensionOfficers = response.data.filter(u => u.role === 'extension_officer');
      setOfficers(extensionOfficers);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(t('messages.failedToLoadOfficers'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      console.log('Approving officer:', id);
      const response = await axios.patch(`/api/users/${id}/approve`);
      console.log('Approve response:', response.data);
      toast.success(t('messages.officerApproved'));
      await fetchOfficers();
    } catch (error) {
      console.error('Approve error:', error);
      toast.error(error.response?.data?.error || t('messages.failedToApproveOfficer'));
    }
  };

  const handleBan = async (id) => {
    try {
      console.log('Banning officer:', id);
      const response = await axios.patch(`/api/users/${id}/ban`);
      console.log('Ban response:', response.data);
      toast.success(t('messages.officerBanned'));
      await fetchOfficers();
    } catch (error) {
      console.error('Ban error:', error);
      toast.error(error.response?.data?.error || t('messages.failedToBanOfficer'));
    }
  };

  const handleUnban = async (id) => {
    try {
      console.log('Unbanning officer:', id);
      const response = await axios.patch(`/api/users/${id}/unban`);
      console.log('Unban response:', response.data);
      toast.success(t('messages.officerUnbanned'));
      await fetchOfficers();
    } catch (error) {
      console.error('Unban error:', error);
      toast.error(error.response?.data?.error || t('messages.failedToUnbanOfficer'));
    }
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: t('admin.deleteOfficer'),
      message: t('admin.confirmDeleteOfficer'),
      type: 'danger',
      onConfirm: async () => {
        try {
          console.log('Deleting officer:', id);
          const response = await axios.delete(`/api/users/${id}`);
          console.log('Delete response:', response.data);
          toast.success(t('messages.officerDeleted'));
          await fetchOfficers();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (error) {
          console.error('Delete error:', error);
          toast.error(error.response?.data?.error || t('messages.failedToDeleteOfficer'));
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      banned: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {t(`dynamic.status.${status}`)}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">{t('common.loading')}</div>
      </AdminLayout>
    );
  }

  const pendingOfficers = officers.filter(o => o.approval_status === 'pending');
  const approvedOfficers = officers.filter(o => o.approval_status === 'approved');
  const bannedOfficers = officers.filter(o => o.approval_status === 'banned');

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('admin.manageOfficers')}</h1>

        {pendingOfficers.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('admin.pendingApprovals')} ({pendingOfficers.length})</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.email')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.phone')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.location')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingOfficers.map(officer => (
                    <tr key={officer.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{officer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{officer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{officer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t(`dynamic.regions.${officer.location.toLowerCase()}`)}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleApprove(officer.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => handleDelete(officer.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('admin.approvedOfficers')} ({approvedOfficers.length})</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.name')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.email')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.phone')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.location')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {approvedOfficers.map(officer => (
                  <tr key={officer.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{officer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{officer.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{officer.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t(`dynamic.regions.${officer.location.toLowerCase()}`)}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(officer.approval_status)}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleBan(officer.id)}
                        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                      >
                        {t('admin.ban')}
                      </button>
                      <button
                        onClick={() => handleDelete(officer.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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

        {bannedOfficers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('admin.bannedOfficers')} ({bannedOfficers.length})</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.email')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.phone')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.location')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.status')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bannedOfficers.map(officer => (
                    <tr key={officer.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{officer.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{officer.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{officer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{t(`dynamic.regions.${officer.location.toLowerCase()}`)}</td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(officer.approval_status)}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleUnban(officer.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          {t('admin.unban')}
                        </button>
                        <button
                          onClick={() => handleDelete(officer.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
        )}
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

export default ManageOfficers;
