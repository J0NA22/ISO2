// src/hooks/useInventory.js
// Hook para gestión del inventario y entradas

import { useState, useEffect, useCallback } from 'react';
import { inventoryAPI } from '../api/endpoints';
import toast from 'react-hot-toast';

export default function useInventory() {
  const [stock, setStock]     = useState([]);
  const [entries, setEntries] = useState([]);
  const [meta, setMeta]       = useState({ total: 0, totalPages: 1, page: 1 });
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const [stockRes, alertRes] = await Promise.all([
        inventoryAPI.getStock({ lowStock: lowStockOnly ? 'true' : undefined }),
        inventoryAPI.getLowStockAlerts(),
      ]);
      setStock(stockRes.data || []);
      setAlerts(alertRes.data || []);
    } catch {
      toast.error('Error cargando inventario');
    } finally {
      setLoading(false);
    }
  }, [lowStockOnly]);

  const fetchEntries = useCallback(async (p = 1) => {
    try {
      const res = await inventoryAPI.listEntries({ page: p, limit: 20 });
      setEntries(res.data || []);
      setMeta(res.meta || { total: 0, totalPages: 1, page: p });
    } catch {
      toast.error('Error cargando entradas');
    }
  }, []);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  useEffect(() => {
    fetchEntries(page);
  }, [page, fetchEntries]);

  const registerEntry = async (data) => {
    await inventoryAPI.createEntry(data);
    toast.success('Entrada de inventario registrada');
    fetchStock();
    fetchEntries(page);
  };

  return {
    stock, entries, alerts, meta, loading, page, lowStockOnly,
    setPage, setLowStockOnly,
    registerEntry,
    refresh: fetchStock,
  };
}
