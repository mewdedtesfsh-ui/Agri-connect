import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import ExtensionRoute from './components/ExtensionRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import ResetPassword from './pages/ResetPassword';
import FarmerDashboard from './pages/FarmerDashboard';
import MarketPrices from './pages/MarketPrices';
import Weather from './pages/Weather';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOfficers from './pages/admin/ManageOfficers';
import ManageWeatherAlerts from './pages/admin/ManageWeatherAlerts';
import SMSLogs from './pages/admin/SMSLogs';
import Analytics from './pages/admin/Analytics';
import ExtensionDashboard from './pages/ExtensionDashboard';
import ManageAdvice from './pages/extension/ManageAdvice';
import ManageQuestions from './pages/extension/ManageQuestions';
import ExtensionManageCropsAndPrices from './pages/extension/ManageCropsAndPrices';
import FarmerAdvice from './pages/FarmerAdvice';
import FarmerQuestions from './pages/FarmerQuestions';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route path="/dashboard" element={<PrivateRoute><FarmerDashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/prices" element={<PrivateRoute><MarketPrices /></PrivateRoute>} />
            <Route path="/weather" element={<PrivateRoute><Weather /></PrivateRoute>} />
            <Route path="/advice" element={<PrivateRoute><FarmerAdvice /></PrivateRoute>} />
            <Route path="/questions" element={<PrivateRoute><FarmerQuestions /></PrivateRoute>} />
            <Route path="/forum" element={<PrivateRoute><Forum /></PrivateRoute>} />
            <Route path="/forum/:id" element={<PrivateRoute><ForumPost /></PrivateRoute>} />
            
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><ManageUsers /></AdminRoute>} />
            <Route path="/admin/officers" element={<AdminRoute><ManageOfficers /></AdminRoute>} />
            <Route path="/admin/weather-alerts" element={<AdminRoute><ManageWeatherAlerts /></AdminRoute>} />
            <Route path="/admin/sms" element={<AdminRoute><SMSLogs /></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><Analytics /></AdminRoute>} />
            
            <Route path="/extension" element={<ExtensionRoute><ExtensionDashboard /></ExtensionRoute>} />
            <Route path="/extension/advice" element={<ExtensionRoute><ManageAdvice /></ExtensionRoute>} />
            <Route path="/extension/questions" element={<ExtensionRoute><ManageQuestions /></ExtensionRoute>} />
            <Route path="/extension/crops-prices" element={<ExtensionRoute><ExtensionManageCropsAndPrices /></ExtensionRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
