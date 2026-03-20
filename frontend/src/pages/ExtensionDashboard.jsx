import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ExtensionLayout from '../components/ExtensionLayout';
import { Link } from 'react-router-dom';

const ExtensionDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalArticles: 0,
    pendingQuestions: 0,
    totalAnswers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/extension/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ExtensionLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-xl">{t('common.loading')}</div>
        </div>
      </ExtensionLayout>
    );
  }

  return (
    <ExtensionLayout>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('extension.dashboard')}</h1>
          <p className="text-gray-600">{t('extension.manageAdvice')}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('extension.totalAdvice')}</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalArticles}</p>
                <p className="text-xs text-gray-500 mt-2">{t('dynamic.status.active')} {t('advice.title').toLowerCase()}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('questions.pending')} {t('questions.title')}</p>
                <p className="text-4xl font-bold text-orange-600">{stats.pendingQuestions}</p>
                <p className="text-xs text-gray-500 mt-2">{t('extension.answerQuestion')}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{t('extension.totalAnswers')}</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalAnswers}</p>
                <p className="text-xs text-gray-500 mt-2">{t('questions.answered')}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/extension/advice" className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-green-400 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{t('extension.manageAdvice')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('extension.createAdvice')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-green-600 group-hover:translate-x-1 transition-transform">
              <span>{t('common.view')} {t('advice.title')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link to="/extension/questions" className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-orange-400 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="bg-orange-50 p-3 rounded-lg group-hover:bg-orange-100 transition-colors">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{t('extension.answerQuestion')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('extension.manageQuestions')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-orange-600 group-hover:translate-x-1 transition-transform">
              <span>{t('common.view')} {t('questions.title')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link to="/extension/crops-prices" className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M3 7v1a3 3 0 003 3h0a3 3 0 003-3V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2m0 0v1a3 3 0 003 3h0a3 3 0 003-3V7m0 0V5a2 2 0 012-2h0a2 2 0 012 2v2m-6 0h6m-9 4h0a2 2 0 012 2v7m-2-7h0a2 2 0 00-2 2v7m2-7h2m-2 9h2" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{t('admin.crops')} & {t('admin.prices')}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t('admin.manageCrops')}, {t('admin.managePrices')}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
              <span>{t('common.manage')}</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </ExtensionLayout>
  );
};

export default ExtensionDashboard;
