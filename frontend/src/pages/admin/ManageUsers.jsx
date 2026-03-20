import { useState, useEffect } from 'react';
import axios from '../../axios.config';
import AdminLayout from '../../components/AdminLayout';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import ConfirmDialog from '../../components/ConfirmDialog';

const ManageUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [pendingOfficers, setPendingOfficers] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'danger' });
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/users/pending-officers')
      ]);
      setUsers(usersRes.data);
      setPendingOfficers(pendingRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('messages.failedToLoadUsers'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.patch(`/api/users/${id}/approve`);
      toast.success(t('messages.officerApproved'));
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.failedToApproveOfficer'));
    }
  };

  const handleBan = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: t('admin.banUser'),
      message: t('admin.confirmBanUser'),
      type: 'warning',
      onConfirm: async () => {
        try {
          await axios.patch(`/api/users/${id}/ban`);
          toast.success(t('messages.userBanned'));
          fetchData();
        } catch (error) {
          toast.error(error.response?.data?.error || t('messages.failedToBanUser'));
        }
      }
    });
  };

  const handleUnban = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: t('admin.unbanUser'),
      message: t('admin.confirmUnbanUser'),
      type: 'info',
      onConfirm: async () => {
        try {
          await axios.patch(`/api/users/${id}/unban`);
          toast.success(t('messages.userUnbanned'));
          fetchData();
        } catch (error) {
          toast.error(error.response?.data?.error || t('messages.failedToUnbanUser'));
        }
      }
    });
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: t('admin.deleteUser'),
      message: t('admin.confirmDeleteUser'),
      type: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`/api/users/${id}`);
          toast.success(t('messages.userDeleted'));
          fetchData();
        } catch (error) {
          toast.error(error.response?.data?.error || t('messages.failedToDeleteUser'));
        }
      }
    });
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    if (activeTab === 'farmers') return user.role === 'farmer';
    if (activeTab === 'officers') return user.role === 'extension_officer' && user.approval_status !== 'pending';
    if (activeTab === 'banned') return user.approval_status === 'banned';
    return true;
  });

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
        <h1 className="text-3xl font-bold mb-8">{t('admin.manageUsers')}</h1>

        {/* Pending Officers Section */}
        {pendingOfficers.length > 0 && (
          <div className="bg-white border-l-4 border-yellow-400 rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⏳</span>
              <h2 className="text-xl font-bold text-gray-800">{t('admin.pendingOfficers')}</h2>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                {pendingOfficers.length}
              </span>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.name')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.email')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.phone')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.location')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.registered')}</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pendingOfficers.map((officer) => (
                    <tr key={officer.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{officer.name}</td>
                      <td className="py-3 px-4 text-gray-600">{officer.email}</td>
                      <td className="py-3 px-4 text-gray-600">{officer.phone}</td>
                      <td className="py-3 px-4 text-gray-600">{t(`dynamic.regions.${officer.location.toLowerCase()}`)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(officer.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(officer.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-medium"
                          >
                            {t('admin.approve')}
                          </button>
                          <button
                            onClick={() => handleDelete(officer.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            {t('admin.reject')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('admin.allUsers')} ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('farmers')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'farmers' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('admin.farmers')} ({users.filter(u => u.role === 'farmer').length})
          </button>
          <button
            onClick={() => setActiveTab('officers')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'officers' 
                ? 'bg-green-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('admin.extensionOfficers')} ({users.filter(u => u.role === 'extension_officer' && u.approval_status !== 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'banned' 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t('admin.banned')} ({users.filter(u => u.approval_status === 'banned').length})
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-3 px-4">{t('admin.id')}</th>
                  <th className="text-left py-3 px-4">{t('admin.name')}</th>
                  <th className="text-left py-3 px-4">{t('admin.email')}</th>
                  <th className="text-left py-3 px-4">{t('admin.phone')}</th>
                  <th className="text-left py-3 px-4">{t('admin.role')}</th>
                  <th className="text-left py-3 px-4">{t('admin.location')}</th>
                  <th className="text-left py-3 px-4">{t('admin.status')}</th>
                  <th className="text-left py-3 px-4">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">{user.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'extension_officer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {t(`dynamic.roles.${user.role}`)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{t(`dynamic.regions.${user.location.toLowerCase()}`)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.approval_status === 'banned' ? 'bg-red-100 text-red-800' :
                        user.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {t(`dynamic.status.${user.approval_status}`)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {user.approval_status === 'banned' ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="flex items-center justify-center w-8 h-8 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 border border-green-200 transition"
                            title={t('admin.unban')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBan(user.id)}
                            className="flex items-center justify-center w-8 h-8 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 border border-orange-200 transition"
                            title={t('admin.ban')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="flex items-center justify-center w-8 h-8 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 border border-red-200 transition"
                          title={t('common.delete')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

export default ManageUsers;
