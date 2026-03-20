import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import RatingDisplay from '../components/RatingDisplay';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    users: 0
  });
  const [officerStats, setOfficerStats] = useState({
    officers: [],
    stats: {}
  });
  const [analyticsData, setAnalyticsData] = useState({
    userStats: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchOfficerStats();
    fetchAnalytics();
  }, []);

  const fetchStats = async () => {
    try {
      const usersRes = await axios.get('/api/users');
      const users = usersRes.data;
      
      // Calculate officer stats from users data as fallback
      const officers = users.filter(u => u.role === 'extension_officer');
      const totalOfficers = officers.length;
      const approvedOfficers = officers.filter(o => o.approval_status === 'approved').length;
      const pendingOfficers = officers.filter(o => o.approval_status === 'pending').length;
      const bannedOfficers = officers.filter(o => o.approval_status === 'banned').length;
      const totalFarmers = users.filter(u => u.role === 'farmer').length;

      setStats({
        users: users.length,
        fallbackOfficerStats: {
          total_officers: totalOfficers,
          approved_officers: approvedOfficers,
          pending_officers: pendingOfficers,
          banned_officers: bannedOfficers
        },
        fallbackFarmerStats: {
          total_farmers: totalFarmers
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficerStats = async () => {
    try {
      const response = await axios.get('/api/analytics/officer-stats');
      console.log('Officer stats response:', response.data);
      setOfficerStats(response.data);
    } catch (error) {
      console.error('Error fetching officer stats:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics');
      console.log('Analytics response:', response.data);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
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
      <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('dashboard.adminDashboard')}</h1>
            </div>



            {/* Officer Stats Grid */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.statistics')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Officers */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 opacity-30 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-blue-700 text-xs font-medium mb-2 uppercase tracking-wide">{t('admin.officers')}</p>
                      <p className="text-3xl font-bold text-blue-900 mb-1">
                        {Number(officerStats.stats.total_officers || stats.fallbackOfficerStats?.total_officers || 0)}
                      </p>
                      <p className="text-blue-600 text-xs">{t('auth.extensionOfficer')}</p>
                    </div>
                    <div className="bg-blue-200 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Approved Officers */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 opacity-30 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-green-700 text-xs font-medium mb-2 uppercase tracking-wide">{t('admin.approved')}</p>
                      <p className="text-3xl font-bold text-green-900 mb-1">
                        {Number(officerStats.stats.approved_officers || stats.fallbackOfficerStats?.approved_officers || 0)}
                      </p>
                      <p className="text-green-600 text-xs">{t('dynamic.status.active')}</p>
                    </div>
                    <div className="bg-green-200 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Pending Officers */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg p-6 border border-orange-200 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 opacity-30 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-orange-700 text-xs font-medium mb-2 uppercase tracking-wide">{t('admin.pending')}</p>
                      <p className="text-3xl font-bold text-orange-900 mb-1">
                        {Number(officerStats.stats.pending_officers || stats.fallbackOfficerStats?.pending_officers || 0)}
                      </p>
                      <p className="text-orange-600 text-xs">{t('dynamic.status.pending')}</p>
                    </div>
                    <div className="bg-orange-200 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Farmers */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-lg p-6 border border-emerald-200 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200 opacity-30 rounded-full -mr-10 -mt-10"></div>
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-emerald-700 text-xs font-medium mb-2 uppercase tracking-wide">{t('auth.farmer')}</p>
                      <p className="text-3xl font-bold text-emerald-900 mb-1">
                        {Number(analyticsData.userStats.total_farmers || stats.fallbackFarmerStats?.total_farmers || 0)}
                      </p>
                      <p className="text-emerald-600 text-xs">{t('dashboard.totalUsers')}</p>
                    </div>
                    <div className="bg-emerald-200 p-2 rounded-lg">
                      <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performing Officers */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.officers')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {officerStats.officers && officerStats.officers.filter(officer => parseFloat(officer.avg_rating) > 0).slice(0, 3).map((officer) => {
                  const rating = parseFloat(officer.avg_rating);
                  
                  const getRatingColor = (rating) => {
                    const numRating = Number(rating);
                    if (numRating >= 4.0) return 'text-green-500';
                    else if (numRating >= 3.0) return 'text-yellow-400';
                    else return 'text-red-500';
                  };

                  return (
                    <div key={officer.id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md border border-gray-200 p-4">
                      {/* Profile Section */}
                      <div className="flex items-center space-x-3 mb-3">
                        {/* Profile Photo */}
                        <div className="relative">
                          {officer.profile_photo ? (
                            <img 
                              src={`/api/uploads/profiles/${officer.profile_photo}`} 
                              alt={officer.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-white shadow-md ${officer.profile_photo ? 'hidden' : 'flex'}`}
                          >
                            <span className="text-white font-bold text-sm">
                              {officer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Officer Info */}
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base mb-1">{officer.name}</h3>
                          <p className="text-xs text-gray-600 flex items-center">
                            <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {t(`dynamic.regions.${officer.location.toLowerCase()}`)}
                          </p>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <RatingDisplay rating={rating} size="sm" showValue={false} compact={true} />
                          <span className={`text-sm font-bold ${getRatingColor(rating)}`}>
                            {rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Stats Section */}
                      <div className="bg-white rounded-lg p-2 border border-gray-100">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              <span className="text-sm font-bold text-gray-900">{officer.total_ratings}</span>
                            </div>
                            <p className="text-xs text-gray-500">{t('advice.rating')}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <svg className="w-3 h-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span className="text-sm font-bold text-gray-900">{officer.total_advice}</span>
                            </div>
                            <p className="text-xs text-gray-500">{t('advice.title')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!officerStats.officers || officerStats.officers.filter(officer => parseFloat(officer.avg_rating) > 0).length === 0) && (
                  <div className="col-span-3 text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="max-w-sm mx-auto">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('common.noData')}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">
                        {t('admin.officers')} {t('common.loading')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('dashboard.quickActions')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/admin/users" className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{t('admin.manageUsers')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('common.view')} {t('dashboard.totalUsers')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>{t('common.view')}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link to="/admin/weather-alerts" className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-orange-400 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-orange-50 p-3 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">{t('admin.weatherAlerts')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('admin.createAlert')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-orange-600 group-hover:translate-x-1 transition-transform">
                  <span>{t('common.view')}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link to="/admin/sms" className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
                    <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">{t('admin.smsLogs')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('admin.viewLogs')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-purple-600 group-hover:translate-x-1 transition-transform">
                  <span>{t('common.view')}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              <Link to="/admin/analytics" className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:border-green-400 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{t('admin.analytics')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('dashboard.statistics')}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-green-600 group-hover:translate-x-1 transition-transform">
                  <span>{t('common.view')}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
