import axios from 'axios';

// to create a single instance.
const api = axios.create({ baseURL: "/api" });

// to attach jwt token to any request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;