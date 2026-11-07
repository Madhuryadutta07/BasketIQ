import axios from 'axios';

// Get or set guest session ID
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('basketiq_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('basketiq_session_id', sessionId);
  }
  return sessionId;
};

// Where the backend lives.
// - Default '/api': same server in production (backend serves this frontend), Vite proxy in dev.
// - Set VITE_API_URL (e.g. https://basketiq-api.onrender.com/api) only if you host the frontend separately.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('basketiq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['x-session-id'] = getSessionId();
  return config;
});

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};
