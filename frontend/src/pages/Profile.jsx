import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../components/AdminLayout';
import ExtensionLayout from '../components/ExtensionLayout';
import FarmerLayout from '../components/FarmerLayout';
import axios from '../axios.config';

const Profile = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '+251',
        location: user.location || ''
      });
      if (user.profile_photo) {
        setPhotoPreview(`/api/uploads/profiles/${user.profile_photo}`);
      }
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('messages.photoSizeTooLarge'));
        return;
      }
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('location', formData.location);
      
      if (profilePhoto) {
        formDataToSend.append('profile_photo', profilePhoto);
      }

      const response = await axios.put('/api/users/profile', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateUser(response.data.user);
      toast.success(t('messages.profileUpdated'));
    } catch (error) {
      toast.error(error.response?.data?.error || t('messages.failedToUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  // Choose layout based on user role
  const Layout = user?.role === 'admin' ? AdminLayout : 
                user?.role === 'extension_officer' ? ExtensionLayout : 
                FarmerLayout;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">{t('profile.myProfile')}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200 shadow-lg">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      👨‍🌾
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-3">{t('profile.photoUploadHint')}</p>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('profile.fullName')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('profile.emailAddress')}</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('profile.phoneNumber')}</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!value.startsWith('+251')) {
                      setFormData({ ...formData, phone: '+251' });
                    } else {
                      setFormData({ ...formData, phone: value });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && formData.phone === '+251') {
                      e.preventDefault();
                    }
                  }}
                  pattern="\+251\d{9}"
                  maxLength={13}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('profile.location')}</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700"><span className="font-semibold">{t('profile.accountType')}</span> {user.role === 'farmer' ? '🌾 ' + t('dynamic.roles.farmer') : user.role === 'extension_officer' ? '👨‍🌾 ' + t('dynamic.roles.extension_officer') : '⚡ ' + t('dynamic.roles.admin')}</p>
              {user.created_at && (
                <p className="text-sm text-gray-700 mt-1"><span className="font-semibold">{t('profile.memberSince')}</span> {new Date(user.created_at).toLocaleDateString()}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? t('profile.updating') : t('profile.updateButton')}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
