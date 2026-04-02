import api from './api';

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
};

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByBarcode: (barcode) => api.get(`/products/barcode/${barcode}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getVariants: (productId) => api.get(`/products/${productId}/variants`),
  createVariant: (productId, data) => api.post(`/products/${productId}/variants`, data),
  updateVariant: (variantId, data) => api.put(`/products/variants/${variantId}`, data),
  deleteVariant: (variantId) => api.delete(`/products/variants/${variantId}`),
};

export const saleService = {
  create: (data) => api.post('/sales', data),
  getAll: (params) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  cancel: (id) => api.put(`/sales/${id}/cancel`),
  getReceipt: (id) => api.get(`/sales/${id}/receipt`),
};

export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  getSummary: () => api.get('/inventory/summary'),
  getLowStock: () => api.get('/inventory/low-stock'),
  addEntry: (data) => api.post('/inventory/entries', data),
  getEntries: (variantId) => api.get(`/inventory/entries/${variantId}`),
};

export const customerService = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
  getPurchaseHistory: (id) => api.get(`/customers/${id}/purchases`),
};

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  changePassword: (id, password) => api.put(`/users/${id}/password`, { password }),
  delete: (id) => api.delete(`/users/${id}`),
  getRoles: () => api.get('/users/roles'),
};

export const providerService = {
  getAll: (params) => api.get('/providers', { params }),
  getById: (id) => api.get(`/providers/${id}`),
  create: (data) => api.post('/providers', data),
  update: (id, data) => api.put(`/providers/${id}`, data),
  delete: (id) => api.delete(`/providers/${id}`),
  getProducts: (id) => api.get(`/providers/${id}/products`),
};

export const reportService = {
  dashboard: () => api.get('/reports/dashboard'),
  sales: (params) => api.get('/reports/sales', { params }),
  topProducts: (params) => api.get('/reports/top-products', { params }),
  inventory: () => api.get('/reports/inventory'),
};

export const cashRegisterService = {
  open: (data) => api.post('/cash-register/open', data),
  close: (data) => api.put('/cash-register/close', data),
  getCurrent: () => api.get('/cash-register/current'),
  getHistory: (params) => api.get('/cash-register/history', { params }),
};

export const configService = {
  getPriceConfigs: () => api.get('/config/price-configs'),
  updatePriceConfig: (id, data) => api.put(`/config/price-configs/${id}`, data),
};

export const exportService = {
  sales: (params) => api.get('/export/sales', { params, responseType: 'blob' }),
  inventory: () => api.get('/export/inventory', { responseType: 'blob' }),
  topProducts: (params) => api.get('/export/top-products', { params, responseType: 'blob' }),
};
