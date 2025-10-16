import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // optional if you're using cookies
});

// Optional: Add interceptors for auth tokens
api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config!.headers!.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
