// src/components/ui/ConfirmDialog.jsx
// Diálogo de confirmación reutilizable para acciones destructivas

import Modal from './Modal';

/**
 * @param {object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onConfirm
 * @param {string} props.title
 * @param {string} props.message
 * @param {string} [props.confirmLabel] - Texto del botón de confirmación
 * @param {string} [props.variant] - 'danger' | 'warning' (default: 'danger')
 * @param {boolean} [props.loading]
 */
export default function ConfirmDialog({
  open, onClose, onConfirm, title, message,
  confirmLabel = 'Confirmar', variant = 'danger', loading = false,
}) {
  const btnClass = variant === 'danger' ? 'btn-danger' : 'btn-warning';

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="modal-body">
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button
          id="confirm-cancel-btn"
          type="button"
          className="btn btn-ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          id="confirm-action-btn"
          type="button"
          className={`btn ${btnClass}`}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Procesando...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
