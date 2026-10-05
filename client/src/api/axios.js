import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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

    // If 401 unauthorized and token exists, clear expired token
    if (error.response?.status === 401 && localStorage.getItem('stacksentinel_token')) {
      // Don't auto-redirect on login or register check
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('stacksentinel_token');
        localStorage.removeItem('stacksentinel_user');
      }
    }

    return Promise.reject({ ...error, userFriendlyMessage: message });
  }
);

export default api;
