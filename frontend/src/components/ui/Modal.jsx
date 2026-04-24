// src/components/ui/Modal.jsx
// Modal reutilizable con overlay y cierre por tecla Escape

import { useEffect } from 'react';

/**
 * @param {object} props
 * @param {boolean} props.open - Si el modal está visible
 * @param {function} props.onClose - Handler para cerrar
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {string} [props.size] - 'sm' | 'md' | 'lg' (default: 'md')
 */
export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth = { sm: 400, md: 560, lg: 760 }[size] || 560;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h2 id="modal-title" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h2>
          <button
            id="modal-close-btn"
            className="btn btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
