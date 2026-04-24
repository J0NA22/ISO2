// src/components/ui/Badge.jsx
// Badge de estado reutilizable

const VARIANTS = {
  success:  { className: 'badge-success',  label: null },
  danger:   { className: 'badge-danger',   label: null },
  warning:  { className: 'badge-warning',  label: null },
  purple:   { className: 'badge-purple',   label: null },
  teal:     { className: 'badge-teal',     label: null },
  default:  { className: '',              label: null },
};

// Mapas de estado predefinidos
const STATUS_MAP = {
  ACTIVE:      { variant: 'success', label: 'Activo' },
  INACTIVE:    { variant: 'danger',  label: 'Inactivo' },
  COMPLETED:   { variant: 'success', label: 'Completada' },
  CANCELLED:   { variant: 'danger',  label: 'Cancelada' },
  IN_PROGRESS: { variant: 'warning', label: 'En curso' },
};

/**
 * @param {object} props
 * @param {string} [props.status] - Estado predefinido (ACTIVE, COMPLETED, etc.)
 * @param {string} [props.variant] - Variante manual: 'success' | 'danger' | 'warning' | 'purple' | 'teal'
 * @param {string} [props.label] - Etiqueta personalizada
 * @param {string} [props.icon] - Emoji/icono opcional
 */
export default function Badge({ status, variant, label, icon }) {
  const resolved = status ? (STATUS_MAP[status] || { variant: 'default', label: status }) : { variant, label };
  const cls = VARIANTS[resolved.variant]?.className || '';
  const text = label || resolved.label || status || '';

  return (
    <span className={`badge ${cls}`}>
      {icon && <span style={{ marginRight: 3 }}>{icon}</span>}
      {text}
    </span>
  );
}
