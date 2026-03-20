import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+251',
    password: '',
    location: '',
    role: 'farmer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState('');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Ethiopian cities and regions
  const ethiopianLocations = [
    'Addis Ababa',
    'Dire Dawa',
    'Mekelle, Tigray',
    'Gondar, Amhara',
    'Bahir Dar, Amhara',
    'Dessie, Amhara',
    'Hawassa, Sidama',
    'Jimma, Oromia',
    'Adama, Oromia',
    'Bishoftu, Oromia',
    'Shashamane, Oromia',
    'Nekemte, Oromia',
    'Harar',
    'Jijiga, Somali',
    'Arba Minch, South Ethiopia',
    'Wolaita Sodo, South Ethiopia',
    'Dilla, South Ethiopia',
    'Gambela',
    'Assosa, Benishangul-Gumuz'
  ];

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, location: value });

    if (value.length > 0) {
      const filtered = ethiopianLocations.filter(loc =>
        loc.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (location) => {
    setFormData({ ...formData, location });
    setShowSuggestions(false);
  };

  const checkPasswordStrength = (password) => {
    if (password.length === 0) {
      setPasswordStrength('');
      return;
    }

    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++; // lowercase
    if (/[A-Z]/.test(password)) strength++; // uppercase
    if (/[0-9]/.test(password)) strength++; // numbers
    if (/[^a-zA-Z0-9]/.test(password)) strength++; // special chars

    if (strength <= 2) {
      setPasswordStrength('weak');
    } else if (strength <= 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address with @');
      toast.error('Invalid email format');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+251\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setError('Phone number must be in format: +251xxxxxxxxx (9 digits after +251)');
      toast.error('Invalid phone number format');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">🌾</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{t('home.title')}</h2>
              <p className="text-gray-600">{t('auth.registerButton')}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">{t('auth.name')}</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">{t('auth.email')}</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">{t('auth.phone')}</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="+251911234567"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Always keep +251 at the start
                      if (!value.startsWith('+251')) {
                        setFormData({ ...formData, phone: '+251' });
                      } else {
                        setFormData({ ...formData, phone: value });
                      }
                    }}
                    onKeyDown={(e) => {
                      // Prevent deleting +251
                      if (e.key === 'Backspace' && formData.phone === '+251') {
                        e.preventDefault();
                      }
                    }}
                    pattern="\+251\d{9}"
                    title="Phone number must start with +251 followed by 9 digits"
                    maxLength={13}
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: +251xxxxxxxxx (9 digits)</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2 text-sm">{t('auth.role')}</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="farmer">🌾 {t('auth.farmer')}</option>
                    <option value="extension_officer">👨‍🌾 {t('auth.extensionOfficer')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('auth.location')}</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Start typing city name..."
                    value={formData.location}
                    onChange={handleLocationChange}
                    onFocus={() => formData.location && setShowSuggestions(true)}
                    autoComplete="off"
                  />
                  {showSuggestions && filteredLocations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredLocations.map((location, index) => (
                        <div
                          key={index}
                          className="px-4 py-3 hover:bg-green-50 cursor-pointer transition border-b last:border-b-0"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            selectLocation(location);
                          }}
                        >
                          <span className="text-gray-800">📍 {t(`dynamic.markets.${location.toLowerCase()}`)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Select from Ethiopian cities</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">{t('auth.password')}</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    checkPasswordStrength(e.target.value);
                  }}
                  required
                  minLength={8}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">Minimum 8 characters</p>
                  {passwordStrength && (
                    <span className={`text-xs ${
                      passwordStrength === 'weak' ? 'text-red-600' :
                      passwordStrength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength === 'weak' ? 'Weak' :
                       passwordStrength === 'medium' ? 'Medium' :
                       'Strong'}
                    </span>
                  )}
                </div>
              </div>

              {formData.role === 'extension_officer' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">ℹ️</span>
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Extension Officer Registration</p>
                      <p className="text-xs text-blue-700 mt-1">Your account will be pending until approved by an administrator.</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? `${t('common.loading')}` : t('auth.registerButton')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                {t('auth.haveAccount')}{' '}
                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                  {t('auth.signIn')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Register;
