import { createContext, useState, useContext, useEffect } from 'react';
import axios from '../axios.config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token');
    return (t === 'undefined' || t === 'null') ? null : t;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (token && token !== 'undefined' && token !== 'null') {
        const userDataString = localStorage.getItem('user');
        if (userDataString && userDataString !== 'undefined' && userDataString !== 'null') {
          try {
            const userData = JSON.parse(userDataString);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } catch (error) {
            console.error('Failed to parse user data:', error);
            logout();
          }
        } else {
          // Token exists but user data is missing/invalid
          logout();
        }
      } else {
        // Ensure everything is clean if no valid token
        if (token) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    console.log('Login attempt:', email);
    console.log('API URL:', axios.defaults.baseURL);
    const response = await axios.post('/api/auth/login', { email, password });
    console.log('Login response:', response.data);
    const { token: newToken, user: newUser } = response.data;
    
    if (newToken && newUser) {
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return newUser;
    } else {
      throw new Error('Invalid response from server');
    }
  };

  const register = async (userData) => {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    // Force reload to clear all states if necessary, or just rely on state
  };

  const updateUser = (updatedUser) => {
    // Create a new object to ensure React detects the change
    const newUser = { ...updatedUser };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isExtensionOfficer: user?.role === 'extension_officer',
    isFarmer: user?.role === 'farmer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
