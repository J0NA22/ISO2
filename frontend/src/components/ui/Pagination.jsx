// src/components/ui/Pagination.jsx
// Componente de paginación reutilizable

/**
 * @param {object} props
 * @param {number} props.page - Página actual
 * @param {number} props.totalPages - Total de páginas
 * @param {function} props.onPageChange - Callback con nueva página
 * @param {number} [props.total] - Total de registros (opcional, para etiqueta)
 */
export default function Pagination({ page, totalPages, onPageChange, total }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination" role="navigation" aria-label="Paginación">
      {total !== undefined && (
        <span className="text-muted text-sm" style={{ flex: 1 }}>
          {total} registros totales
        </span>
      )}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        <button
          id="pagination-prev"
          className="btn btn-ghost btn-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
        >
          ‹
        </button>

        {start > 1 && (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => onPageChange(1)}>1</button>
            {start > 2 && <span className="text-muted" style={{ padding: '0 4px' }}>…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            id={`page-btn-${p}`}
            className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="text-muted" style={{ padding: '0 4px' }}>…</span>}
            <button className="btn btn-ghost btn-sm" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
          </>
        )}

        <button
          id="pagination-next"
          className="btn btn-ghost btn-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}
