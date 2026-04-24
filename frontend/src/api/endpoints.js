// src/api/endpoints.js
// Todas las llamadas a la API centralizadas — Facade Pattern

import client from './client';

// ── AUTH ────────────────────────────────────────────────────
export const authAPI = {
  login:  (data) => client.post('/auth/login', data),
  logout: ()     => client.post('/auth/logout'),
  me:     ()     => client.get('/auth/me'),
};

// ── PRODUCTOS ──────────────────────────────────────────────
export const productsAPI = {
  list:            (params)       => client.get('/products', { params }),
  getById:         (id)           => client.get(`/products/${id}`),
  create:          (data)         => client.post('/products', data),
  update:          (id, data)     => client.put(`/products/${id}`, data),
  delete:          (id)           => client.delete(`/products/${id}`),
  searchByBarcode: (code)         => client.get(`/products/barcode/${code}`),
  createVariant:   (pid, data)    => client.post(`/products/${pid}/variants`, data),

  // Catálogos — lectura
  categories: ()         => client.get('/products/categories'),
  sizes:      ()         => client.get('/products/sizes'),
  colors:     ()         => client.get('/products/colors'),

  // Catálogos — escritura
  createCategory: (data)    => client.post('/products/categories', data),
  updateCategory: (id, data)=> client.put(`/products/categories/${id}`, data),
  createSize:     (data)    => client.post('/products/sizes', data),
  updateSize:     (id, data)=> client.put(`/products/sizes/${id}`, data),
  createColor:    (data)    => client.post('/products/colors', data),
  updateColor:    (id, data)=> client.put(`/products/colors/${id}`, data),
};

// ── VENTAS ─────────────────────────────────────────────────
export const salesAPI = {
  list:            (params)    => client.get('/sales', { params }),
  getById:         (id)        => client.get(`/sales/${id}`),
  create:          (data)      => client.post('/sales', data),
  complete:        (id, data)  => client.patch(`/sales/${id}/complete`, data),
  cancel:          (id, data)  => client.patch(`/sales/${id}/cancel`, data),
  calculateTotals: (data)      => client.post('/sales/calculate', data),
};

// ── INVENTARIO ─────────────────────────────────────────────
export const inventoryAPI = {
  getStock:        (params) => client.get('/inventory/stock', { params }),
  getLowStockAlerts: ()     => client.get('/inventory/stock/alerts'),
  listEntries:     (params) => client.get('/inventory/entries', { params }),
  getEntry:        (id)     => client.get(`/inventory/entries/${id}`),
  createEntry:     (data)   => client.post('/inventory/entries', data),
};

// ── CLIENTES ───────────────────────────────────────────────
export const customersAPI = {
  list:            (params)    => client.get('/customers', { params }),
  getById:         (id)        => client.get(`/customers/${id}`),
  create:          (data)      => client.post('/customers', data),
  update:          (id, data)  => client.put(`/customers/${id}`, data),
  delete:          (id)        => client.delete(`/customers/${id}`),
  purchaseHistory: (id)        => client.get(`/customers/${id}/purchases`),
};

// ── USUARIOS ───────────────────────────────────────────────
export const usersAPI = {
  list:           (params)   => client.get('/users', { params }),
  getById:        (id)       => client.get(`/users/${id}`),
  create:         (data)     => client.post('/users', data),
  update:         (id, data) => client.put(`/users/${id}`, data),
  changePassword: (data)     => client.post('/users/change-password', data),
  roles:          ()         => client.get('/users/roles'),
};

// ── PROVEEDORES ────────────────────────────────────────────
export const suppliersAPI = {
  list:   (params)   => client.get('/suppliers', { params }),
  getById:(id)       => client.get(`/suppliers/${id}`),
  create: (data)     => client.post('/suppliers', data),
  update: (id, data) => client.put(`/suppliers/${id}`, data),
};

// ── REPORTES ───────────────────────────────────────────────
export const reportsAPI = {
  dashboard:   ()       => client.get('/reports/dashboard'),
  sales:       (params) => client.get('/reports/sales', { params }),
  topProducts: (params) => client.get('/reports/top-products', { params }),
  inventory:   ()       => client.get('/reports/inventory'),
};

// ── CIERRE DE CAJA ─────────────────────────────────────────
export const cashAPI = {
  list:    (params) => client.get('/cash', { params }),
  getById: (id)     => client.get(`/cash/${id}`),
  create:  (data)   => client.post('/cash', data),
};

// ── DESCUENTOS ─────────────────────────────────────────────
export const discountsAPI = {
  list:   (params)   => client.get('/discounts', { params }),
  getById:(id)       => client.get(`/discounts/${id}`),
  create: (data)     => client.post('/discounts', data),
  update: (id, data) => client.put(`/discounts/${id}`, data),
  delete: (id)       => client.delete(`/discounts/${id}`),
};

// ── CONFIGURACIÓN DE IMPUESTOS ─────────────────────────────
export const taxConfigAPI = {
  getActive: ()         => client.get('/tax-config/active'),
  listAll:   ()         => client.get('/tax-config'),
  create:    (data)     => client.post('/tax-config', data),
  update:    (id, data) => client.put(`/tax-config/${id}`, data),
};
