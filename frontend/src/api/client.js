// src/api/client.js
// Cliente Axios configurado con interceptores para JWT y errores

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const client = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: agregar JWT automáticamente ──────────
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: manejo de errores globalizado ───────
client.interceptors.response.use(
  (response) => response.data, // Retorna solo .data para simplificar
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Error de red';

    if (status === 401) {
      // Token expirado — limpiar sesión y redirigir
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('No tienes permiso para esta acción');
    } else if (status === 422) {
      // Errores de validación — mostrar el primer error
      const details = error.response?.data?.details;
      if (details?.length) {
        toast.error(details[0].message);
      } else {
        toast.error(message);
      }
    } else if (status === 429) {
      toast.error('Demasiadas solicitudes. Espera un momento.');
    } else if (status >= 500) {
      toast.error('Error del servidor. Intenta de nuevo.');
    }

    return Promise.reject(error);
  }
);

export default client;
