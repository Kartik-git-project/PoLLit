import axios from 'axios';

// to create a single instance.
const api = axios.create({ 
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://pollit-11av.onrender.com/api" 
});

// to attach jwt token to any request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;