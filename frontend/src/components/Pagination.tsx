import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 pt-3">
      <div className="small" style={{ color: 'var(--text-muted)' }}>
        Exibindo <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{startItem}</span> a{' '}
        <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{endItem}</span> de{' '}
        <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{totalItems}</span> solicitações
      </div>

      <nav aria-label="Navegação das páginas">
        <ul className="pagination pagination-sm mb-0 gap-1">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="btn btn-sm btn-outline-secondary px-2"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
          </li>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((page, index, array) => {
              const prev = array[index - 1];
              return (
                <React.Fragment key={page}>
                  {prev && page - prev > 1 && (
                    <li className="page-item disabled">
                      <span className="page-link bg-transparent border-0 text-muted">...</span>
                    </li>
                  )}
                  <li className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline-secondary'} px-3`}
                      onClick={() => onPageChange(page)}
                      aria-current={currentPage === page ? 'page' : undefined}
                    >
                      {page}
                    </button>
                  </li>
                </React.Fragment>
              );
            })}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="btn btn-sm btn-outline-secondary px-2"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};
