import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
const Home = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section with Background Image */}
      <div className="relative bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center" 
           style={{ backgroundImage: 'url(/landingpagebackground.png)' }}>
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
        
        {/* Content */}
        <div className="max-w-6xl mx-auto relative z-10 px-5 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg tracking-tight">
            {t('home.subtitle')}
          </h1>
          <p className="text-xl mb-12 leading-relaxed text-white drop-shadow-md font-normal max-w-3xl mx-auto">
            {t('home.description')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              to="/register"
              className="bg-green-800 hover:bg-green-900 text-white px-10 py-4 rounded-xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {t('home.cta')}
            </Link>
            <Link 
              to="/login"
              className="bg-white hover:bg-gray-50 text-green-800 px-10 py-4 rounded-xl text-lg font-bold border-2 border-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </div>

      <div className="py-20 px-5 bg-gradient-to-br from-gray-50 via-green-50 to-blue-50 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('home.featuresSubtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <Link to="/register" className="no-underline">
              <div className="bg-gray-50 hover:bg-white p-10 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 cursor-pointer h-full transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t('home.features.marketPrices')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('home.features.marketPricesDesc')}
                </p>
              </div>
            </Link>

            <Link to="/register" className="no-underline">
              <div className="bg-gray-50 hover:bg-white p-10 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 cursor-pointer h-full transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t('home.features.weather')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('home.features.weatherDesc')}
                </p>
              </div>
            </Link>

            <Link to="/register" className="no-underline">
              <div className="bg-gray-50 hover:bg-white p-10 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 cursor-pointer h-full transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t('home.features.advice')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('home.features.adviceDesc')}
                </p>
              </div>
            </Link>

            <Link to="/register" className="no-underline">
              <div className="bg-gray-50 hover:bg-white p-10 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 cursor-pointer h-full transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l.917-3.917A6.982 6.982 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t('home.communityForum')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('home.communityForumDesc')}
                </p>
              </div>
            </Link>

            <Link to="/register" className="no-underline">
              <div className="bg-gray-50 hover:bg-white p-10 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 cursor-pointer h-full transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t('home.features.sms')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('home.features.smsDesc')}
                </p>
              </div>
            </Link>

            <Link to="/register" className="no-underline">
              <div className="bg-gray-50 hover:bg-white p-10 rounded-xl shadow-sm hover:shadow-lg border border-gray-200 cursor-pointer h-full transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  {t('home.priceTrends')}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {t('home.priceTrendsDesc')}
                </p>
              </div>
            </Link>

          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-20 px-5 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-5 text-gray-900">
            {t('home.readyTitle')}
          </h2>
          <p className="text-xl mb-10 text-gray-600">
            {t('home.readyDesc')}
          </p>
          <Link 
            to="/register"
            className="bg-green-800 hover:bg-green-900 text-white px-12 py-5 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 inline-block"
          >
            {t('home.createAccount')}
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
