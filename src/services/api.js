import axios from 'axios';
import { toast } from 'react-hot-toast';

// Use /api to leverage Vite proxy in dev and absolute URL in production
const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zinda_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle Network Errors (ERR_CONNECTION_REFUSED, etc.)
    if (!error.response) {
      toast.error('Server is currently unavailable. Please check your connection.', {
        id: 'network-error'
      });
      return Promise.reject(error);
    }

    // Handle Token Expiration
    if (error.response?.status === 401) {
      const token = localStorage.getItem('zinda_token');
      if (token) {
        localStorage.removeItem('zinda_token');
        localStorage.removeItem('zinda_user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          toast.error('Session expired. Please login again.');
          window.location.href = '/login?expired=true';
        }
      }
    }

    // Handle Blocked Account
    if (error.response?.status === 403 && error.response?.data?.blocked) {
      if (!window.location.pathname.includes('/account-blocked')) {
        toast.error('Your account has been suspended.');
        window.location.href = '/account-blocked';
      }
    }

    // Handle Maintenance Mode
    if ((error.response?.status === 503 || error.response?.data?.maintenance) && !window.location.pathname.includes('/maintenance')) {
      const userStr = localStorage.getItem('zinda_user');
      let isAdmin = false;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          isAdmin = user.role === 'admin';
        } catch (e) {}
      }
      
      if (!isAdmin) {
        window.location.href = '/maintenance';
      }
    }

    // Global error message extraction
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Standardize error return
    return Promise.reject(error);
  }
);

export default api;
