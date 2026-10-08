import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // When running in production / HTTPS (like Vercel), default to relative /api to avoid mixed content
  if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
    return '/api';
  }
  return '/api'; // Use Vite proxy on local dev and relative in prod
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});


// Request interceptor: attach JWT bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('stacksentinel_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract clean error message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors ? error.response.data.errors.join(', ') : null) ||
      error.message ||
      'An unexpected network error occurred';

    // If 401 unauthorized and regular token exists, clear expired token
    if (error.response?.status === 401 && localStorage.getItem('stacksentinel_token')) {
      const storedToken = localStorage.getItem('stacksentinel_token');
      // If it's a demo token, do not strip session
      if (!storedToken?.includes('demo')) {
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          localStorage.removeItem('stacksentinel_token');
          localStorage.removeItem('stacksentinel_user');
        }
      }
    }

    return Promise.reject({ ...error, userFriendlyMessage: message });
  }
);

export default api;
