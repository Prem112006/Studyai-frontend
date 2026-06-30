import axios from 'axios';

const getBaseURL = () => {
  // Use env variable if provided at build time
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Dynamic fallback for Vercel production hosting
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://studyai-backend-five.vercel.app/api';
  }
  return 'http://localhost:5001/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 45000, // 45 seconds timeout for slower AI generations
});

// Request interceptor to automatically attach authorization header
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;
    
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated requests
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear userInfo and redirect on authorization failure
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
