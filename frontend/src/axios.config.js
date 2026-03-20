import axios from 'axios';

// Use environment variable for API URL in production, empty string for development (uses Vite proxy)
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

export default axios;
