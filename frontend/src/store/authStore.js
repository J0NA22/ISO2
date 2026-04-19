// src/store/authStore.js
// Estado global de autenticación con Zustand — Singleton Pattern

import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('pos_user') || 'null'),
  token: localStorage.getItem('pos_token') || null,
  isAuthenticated: !!localStorage.getItem('pos_token'),

  login: (userData, token) => {
    localStorage.setItem('pos_token', token);
    localStorage.setItem('pos_user', JSON.stringify(userData));
    set({ user: userData, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  hasPermission: (permission) => {
    const state = useAuthStore.getState();
    return state.user?.permissions?.[permission] === true;
  },
}));

export default useAuthStore;
