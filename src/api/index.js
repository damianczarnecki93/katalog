import axios from 'axios';

const api = axios.create({
  baseURL: '/.netlify/functions',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  if (response.data.token) localStorage.setItem('token', response.data.token);
  return response.data;
};

export const getProducts = async (indeks) => {
  const response = await api.get('/products', { params: { indeks } });
  return response.data;
};

export const getCatalogs = async () => {
  const response = await api.get('/catalogs');
  return response.data;
};

export const adminAction = async (action, type, data) => {
  const response = await api.post('/admin', { action, type, data });
  return response.data;
};

export default api;