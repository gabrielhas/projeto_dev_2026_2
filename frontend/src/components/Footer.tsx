import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="mt-auto py-4 border-top" 
      style={{ 
        background: 'var(--navbar-bg)', 
        borderColor: 'var(--border-color)',
        transition: 'background-color 0.25s ease, border-color 0.25s ease'
      }}
    >
      <div className="container-custom">
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center text-md-start">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-logo-icon" style={{ width: '28px', height: '28px', fontSize: '0.9rem', borderRadius: '6px', background: 'linear-gradient(135deg, #6366f1, #ec4899)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <i className="bi bi-controller"></i>
            </span>
            <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>Game Requests System</span>
            <span className="small" style={{ color: 'var(--text-muted)' }}>| Mupi Systems</span>
          </div>

          <div className="small" style={{ color: 'var(--text-muted)' }}>
            &copy; {currentYear} Todos os direitos reservados. Desenvolvido com React, TypeScript & Node.js.
          </div>

          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="small text-decoration-none" style={{ color: 'var(--text-muted)' }}>
              Início
            </Link>
            <span style={{ color: 'var(--border-color)' }}>&bull;</span>
            <Link to="/admin/login" className="small text-decoration-none" style={{ color: 'var(--text-muted)' }}>
              Painel Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
