import axios from 'axios';

// Local testing ke liye local URL, production ke liye Render URL
const API_URL = import.meta.env.MODE === 'development' 
  ? "http://localhost:8000/api" 
  : "https://pollit-11av.onrender.com/api";

const api = axios.create({ 
  baseURL: API_URL 
});

// To attach jwt token to any request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;