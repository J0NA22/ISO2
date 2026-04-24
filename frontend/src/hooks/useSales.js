// src/hooks/useSales.js
// Hook para gestión del listado de ventas

import { useState, useEffect, useCallback } from 'react';
import { salesAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function useSales({ initialStatus = '' } = {}) {
  const [sales, setSales]   = useState([]);
  const [meta, setMeta]     = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState(initialStatus);
  const [from, setFrom]     = useState('');
  const [to, setTo]         = useState('');

  const fetchSales = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20 };
      if (status) params.status = status;
      if (from)   params.from = from;
      if (to)     params.to = to;
      const res = await salesAPI.list(params);
      setSales(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, page: p });
    } catch {
      toast.error('Error cargando ventas');
    } finally {
      setLoading(false);
    }
  }, [page, status, from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchSales(page);
  }, [page, status, from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancelSale = async (id, reason) => {
    await salesAPI.cancel(id, { cancellationReason: reason });
    toast.success('Venta cancelada');
    fetchSales(page);
  };

  return {
    sales, meta, loading, page, status, from, to,
    setPage, setStatus, setFrom, setTo,
    cancelSale,
    refresh: () => fetchSales(page),
  };
}
