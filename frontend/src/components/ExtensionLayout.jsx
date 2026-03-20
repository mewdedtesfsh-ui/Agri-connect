import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';

const ExtensionLayout = ({ children }) => {
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
      path: '/extension',
      label: t('nav.dashboard'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      path: '/extension/crops-prices',
      label: t('nav.cropsAndPrices'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: '/extension/advice',
      label: t('extension.manageAdvice'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/extension/questions',
      label: t('extension.manageQuestions'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      path: '/forum',
      label: t('nav.forum'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
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
          <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 flex-shrink-0">
            <Link to="/profile" className="block group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden ring-2 ring-white transition-transform group-hover:scale-105" style={{ background: profilePhotoUrl ? 'transparent' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                  {profilePhotoUrl ? (
                    <img 
                      src={profilePhotoUrl} 
                      alt={user?.name || t('auth.extensionOfficer')} 
                      className="w-full h-full object-cover"
                      key={profilePhotoUrl}
                    />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'O'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate text-base group-hover:text-blue-700 transition-colors">{user?.name || t('auth.extensionOfficer')}</p>
                  <p className="text-xs text-blue-700 font-medium bg-blue-100 px-2 py-0.5 rounded-full inline-block mt-1">{t('auth.extensionOfficer')}</p>
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
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md font-medium'
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

export default ExtensionLayout;
