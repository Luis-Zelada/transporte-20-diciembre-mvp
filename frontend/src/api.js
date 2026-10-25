import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // <-- Cambiado de 127.0.0.1 a localhost
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;