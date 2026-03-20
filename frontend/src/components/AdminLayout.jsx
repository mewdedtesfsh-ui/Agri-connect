import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(null);

  // Update profile photo URL whenever user changes
  useEffect(() => {
    if (user?.profile_photo) {
      setProfilePhotoUrl(`/api/uploads/profiles/${user.profile_photo}?t=${Date.now()}`);
    } else {
      setProfilePhotoUrl(null);
    }
  }, [user?.profile_photo]);

  const menuItems = [
    {
      path: '/admin',
      label: t('nav.dashboard'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/admin/users',
      label: t('admin.manageUsers'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      path: '/admin/weather-alerts',
      label: t('admin.weatherAlerts'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      path: '/admin/sms',
      label: t('admin.smsLogs'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: '/admin/analytics',
      label: t('admin.analytics'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed, no scroll */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-indigo-50 flex-shrink-0">
            <Link to="/profile" className="block group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden ring-2 ring-white transition-transform group-hover:scale-105" style={{ background: profilePhotoUrl ? 'transparent' : 'linear-gradient(135deg, #a855f7, #6366f1)' }}>
                  {profilePhotoUrl ? (
                    <img 
                      src={profilePhotoUrl} 
                      alt={user?.name || t('auth.admin')} 
                      className="w-full h-full object-cover"
                      key={profilePhotoUrl}
                    />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'A'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate text-base group-hover:text-purple-700 transition-colors">{user?.name || t('auth.admin')}</p>
                  <p className="text-xs text-purple-700 font-medium bg-purple-100 px-2 py-0.5 rounded-full inline-block mt-1">{t('auth.admin')}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 flex-1 overflow-hidden">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md font-medium'
                        : 'text-gray-700 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className={`${isActive ? 'text-white' : 'text-gray-500'}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
