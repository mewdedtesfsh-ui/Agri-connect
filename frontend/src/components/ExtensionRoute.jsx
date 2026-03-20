import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ExtensionRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('common.loading')}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return user?.role === 'extension_officer' ? children : <Navigate to="/dashboard" />;
};

export default ExtensionRoute;
