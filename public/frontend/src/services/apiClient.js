// frontend/src/services/apiClient.js

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8012',   // 🔥 TU BACKEND REAL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // seguimos usando JWT, no cookies
});

// Interceptor para agregar el JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // mismo nombre que en AuthContext
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para capturar 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
