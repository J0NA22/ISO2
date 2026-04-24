// src/hooks/useCustomers.js
// Hook para gestión del directorio de clientes

import { useState, useEffect, useCallback } from 'react';
import { customersAPI } from '../api/endpoints';
import toast from 'react-hot-toast';
import useDebounce from './useDebounce';

export default function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta]           = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  const fetchCustomers = useCallback(async (q = '', p = 1) => {
    setLoading(true);
    try {
      const res = await customersAPI.list({ search: q, page: p, limit: 20 });
      setCustomers(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, page: p });
    } catch {
      toast.error('Error cargando clientes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(debouncedSearch, page);
  }, [debouncedSearch, page, fetchCustomers]);

  const createCustomer = async (data) => {
    await customersAPI.create(data);
    toast.success('Cliente registrado');
    fetchCustomers(debouncedSearch, page);
  };

  const updateCustomer = async (id, data) => {
    await customersAPI.update(id, data);
    toast.success('Cliente actualizado');
    fetchCustomers(debouncedSearch, page);
  };

  return {
    customers, meta, loading, search, page,
    setSearch, setPage,
    createCustomer, updateCustomer,
    refresh: () => fetchCustomers(debouncedSearch, page),
  };
}
