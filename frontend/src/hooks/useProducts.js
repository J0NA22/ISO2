// src/hooks/useProducts.js
// Hook para gestión de estado del catálogo de productos

import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import useDebounce from './useDebounce';

/**
 * Encapsula el estado y las operaciones del catálogo de productos.
 * Separa la lógica de datos de los componentes de presentación.
 */
export default function useProducts() {
  const [products, setProducts]   = useState([]);
  const [meta, setMeta]           = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes]         = useState([]);
  const [colors, setColors]       = useState([]);

  const debouncedSearch = useDebounce(search, 350);

  const fetchProducts = useCallback(async (q = '', p = 1) => {
    setLoading(true);
    try {
      const res = await productsAPI.list({ search: q, status: 'ACTIVE', page: p, limit: 20 });
      setProducts(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, page: p });
    } catch {
      toast.error('Error cargando productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar catálogos una sola vez
  useEffect(() => {
    productsAPI.categories().then((r) => setCategories(r.data || [])).catch(() => {});
    productsAPI.sizes().then((r) => setSizes(r.data || [])).catch(() => {});
    productsAPI.colors().then((r) => setColors(r.data || [])).catch(() => {});
  }, []);

  // Re-fetch al cambiar búsqueda o página
  useEffect(() => {
    fetchProducts(debouncedSearch, page);
  }, [debouncedSearch, page, fetchProducts]);

  const createProduct = async (data) => {
    await productsAPI.create(data);
    toast.success('Producto creado');
    fetchProducts(debouncedSearch, page);
  };

  const updateProduct = async (id, data) => {
    await productsAPI.update(id, data);
    toast.success('Producto actualizado');
    fetchProducts(debouncedSearch, page);
  };

  const deleteProduct = async (id) => {
    await productsAPI.delete(id);
    toast.success('Producto desactivado');
    fetchProducts(debouncedSearch, page);
  };

  const createVariant = async (productId, data) => {
    await productsAPI.createVariant(productId, data);
    toast.success('Variante creada');
    fetchProducts(debouncedSearch, page);
  };

  return {
    products, meta, loading, search, page,
    categories, sizes, colors,
    setSearch, setPage,
    createProduct, updateProduct, deleteProduct, createVariant,
    refresh: () => fetchProducts(debouncedSearch, page),
  };
}
