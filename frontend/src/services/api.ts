import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

console.log('[API] Initializing with baseURL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API] Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.status, error.config?.url, error.config?.baseURL);
    if (error.response?.status === 401) {
      // Don't redirect if we're already on the login page or if it's a login request
      if (!window.location.pathname.includes('/login') && !error.config.url.includes('/auth')) {
        console.warn('[API] 401 Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
