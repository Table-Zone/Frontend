import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const MARKETER_TOKEN_KEY = 'marketer_token';

// Isolated axios instance for the marketer portal — its own token and 401 handling,
// so it never interferes with the main app / admin session.
export const marketerApi = axios.create({
  baseURL: `${API_BASE_URL}/v1`,
  headers: { 'Content-Type': 'application/json' },
});

marketerApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(MARKETER_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

marketerApi.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      const url = error.config?.url;
      // Don't bounce on the login call itself
      if (url !== '/marketer/auth/login' && path.startsWith('/marketer') && path !== '/marketer/login') {
        localStorage.removeItem(MARKETER_TOKEN_KEY);
        window.location.href = '/marketer/login';
      }
    }
    return Promise.reject(error);
  }
);

export const marketerAPI = {
  login: (data: { email: string; password: string }) =>
    marketerApi.post('/marketer/auth/login', data),
  getMe: () => marketerApi.get('/marketer/me'),
  getCodes: () => marketerApi.get('/marketer/codes'),
  getRedemptions: () => marketerApi.get('/marketer/redemptions'),
  getEarnings: () => marketerApi.get('/marketer/earnings'),
};

export default marketerApi;
