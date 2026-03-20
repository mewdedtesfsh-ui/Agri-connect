import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isHomePage = location.pathname === '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.logout('You have been logged out');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🌾</span>
          <span className="text-xl font-bold text-green-700">AgriConnect</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-6">
          {(isAuthenticated && !isHomePage) ? (
            <>
              {!isHomePage && (
                <>
                  {user?.role === 'farmer' && (
                    <>
                      <Link to="/dashboard" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.dashboard')}</Link>
                      <Link to="/prices" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.marketPrices')}</Link>
                      <Link to="/weather" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.weather')}</Link>
                      <Link to="/advice" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.advice')}</Link>
                      <Link to="/questions" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.questions')}</Link>
                      <Link to="/forum" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.forum')}</Link>
                      <NotificationBell />
                    </>
                  )}

                  {user?.role === 'extension_officer' && (
                    <>
                      <Link to="/extension" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.dashboard')}</Link>
                      <Link to="/extension/advice" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.advice')}</Link>
                      <Link to="/extension/questions" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.questions')}</Link>
                      <Link to="/extension/crops-prices" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.cropsAndPrices')}</Link>
                      <Link to="/forum" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.forum')}</Link>
                      <NotificationBell />
                    </>
                  )}

                  {user?.role === 'admin' && (
                    <>
                      <Link to="/admin" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.dashboard')}</Link>
                      <Link to="/admin/users" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.users')}</Link>
                      <Link to="/admin/officers" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.officers')}</Link>
                      <Link to="/admin/weather-alerts" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.alerts')}</Link>
                      <Link to="/admin/sms" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.sms')}</Link>
                      <Link to="/admin/analytics" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.analytics')}</Link>
                    </>
                  )}
                </>
              )}

              <div className="flex items-center space-x-4 pl-4 ml-4 border-l border-gray-200">
                <LanguageSwitcher />
                <Link to="/profile" className="hover:opacity-70 transition-opacity">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{t(`dynamic.roles.${user?.role}`)}</div>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
                >
                  {t('nav.logout')}
                </button>
              </div>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <Link to="/login" className="text-gray-600 hover:text-green-600 font-medium relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-green-600 after:transition-all after:duration-300 hover:after:w-full transition-colors duration-200">{t('nav.login')}</Link>
              <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-100 transition-colors"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            {(isAuthenticated && !isHomePage) ? (
              <>
                {!isHomePage && (
                  <>
                    {user?.role === 'farmer' && (
                      <>
                        <Link to="/dashboard" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.dashboard')}</Link>
                        <Link to="/prices" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.marketPrices')}</Link>
                        <Link to="/weather" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.weather')}</Link>
                        <Link to="/advice" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.advice')}</Link>
                        <Link to="/questions" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.questions')}</Link>
                        <Link to="/forum" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.forum')}</Link>
                      </>
                    )}

                    {user?.role === 'extension_officer' && (
                      <>
                        <Link to="/extension" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.dashboard')}</Link>
                        <Link to="/extension/advice" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.advice')}</Link>
                        <Link to="/extension/questions" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.questions')}</Link>
                        <Link to="/extension/crops-prices" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.cropsAndPrices')}</Link>
                        <Link to="/forum" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.forum')}</Link>
                      </>
                    )}

                    {user?.role === 'admin' && (
                      <>
                        <Link to="/admin" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.dashboard')}</Link>
                        <Link to="/admin/users" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.users')}</Link>
                        <Link to="/admin/officers" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.officers')}</Link>
                        <Link to="/admin/weather-alerts" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.alerts')}</Link>
                        <Link to="/admin/sms" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.sms')}</Link>
                        <Link to="/admin/analytics" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.analytics')}</Link>
                      </>
                    )}
                  </>
                )}

                <div className="pt-3 border-t border-gray-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Link to="/profile" onClick={closeMobileMenu} className="block py-2">
                      <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{t(`dynamic.roles.${user?.role}`)}</div>
                    </Link>
                    <LanguageSwitcher />
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors text-left"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <Link to="/login" onClick={closeMobileMenu} className="block text-gray-600 hover:text-green-600 font-medium py-2">{t('nav.login')}</Link>
                  <LanguageSwitcher />
                </div>
                <Link to="/register" onClick={closeMobileMenu} className="block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-center">
                  {t('nav.getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
