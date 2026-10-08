import axios from 'axios';
import { handleMockRequest } from './mockApi';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  return '/api';
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

// Response interceptor: extract clean error message or route through client-side API simulator
api.interceptors.response.use(
  async (response) => {
    // If response returned HTML, Vercel SPA rewrote /api to index.html -> use mock API handler
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!doctype html>') || response.data.includes('<div id="root">') || response.data.includes('<html'))
    ) {
      return await handleMockRequest(response.config);
    }
    return response;
  },
  async (error) => {
    // If cloud host has no live backend or returns 404/405/500 on /api, route through client-side simulator
    if (
      !error.response ||
      error.response.status === 404 ||
      error.response.status === 405 ||
      error.response.status === 502 ||
      error.response.status === 500
    ) {
      try {
        return await handleMockRequest(error.config);
      } catch (mockErr) {
        // Fall through
      }
    }

    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors ? error.response.data.errors.join(', ') : null) ||
      error.message ||
      'An unexpected network error occurred';

    return Promise.reject({ ...error, userFriendlyMessage: message });
  }
);

export default api;
