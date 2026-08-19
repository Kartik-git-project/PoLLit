import axios from 'axios';

// Create a single instance with direct production backend URL
const api = axios.create({ 
  baseURL: "https://pollit-11av.onrender.com/api" 
});

// To attach jwt token to any request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;