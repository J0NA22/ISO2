// src/hooks/useDebounce.js
// Hook de retardo para búsquedas — evita llamadas excesivas al API

import { useState, useEffect } from 'react';

/**
 * Retarda el valor hasta que el usuario deja de escribir.
 * @param {*} value - Valor a retardar
 * @param {number} delay - Milisegundos de espera (default: 300ms)
 * @returns El valor retardado
 */
export default function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
