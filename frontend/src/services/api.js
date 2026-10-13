import axios from 'axios';

// Base URL targeting Spring Boot Backend (default port 8081)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT Token if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skywings_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle common global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if token is expired or invalid
      console.warn('Session expired or unauthorized. Clearing credentials.');
      // localStorage.removeItem('skywings_token');
      // localStorage.removeItem('skywings_user');
    }
    return Promise.reject(error);
  }
);

export default api;
