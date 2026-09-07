import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { admin, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="app-navbar">
      <div className="container-custom">
        <div className="d-flex align-items-center justify-content-between">
          {/* Logo Brand */}
          <Link to="/" className="navbar-brand" onClick={closeMenu} aria-label="Game Requests Início">
            <div className="brand-logo-icon">
              <i className="bi bi-controller" aria-hidden="true"></i>
            </div>
            <div>
              <span>Game</span>
              <span className="brand-highlight ms-1">Requests</span>
            </div>
          </Link>

          {/* Área Direita: Botão de Tema + Hambúrguer no Mobile */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
              aria-label="Alternar tema"
            >
              <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill text-primary' : 'bi-sun-fill text-warning'}`}></i>
            </button>

            <button
              className="nav-toggler-btn"
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Alternar menu de navegação"
            >
              <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </button>
          </div>

          {/* Links Desktop */}
          <nav className="d-none d-lg-flex align-items-center gap-2" aria-label="Navegação Principal">
            <Link
              to="/"
              className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="bi bi-house-door"></i>
              Início
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`nav-link-custom ${
                    location.pathname === '/admin/dashboard' || location.pathname.startsWith('/admin/requests')
                      ? 'active'
                      : ''
                  }`}
                >
                  <i className="bi bi-speedometer2"></i>
                  Solicitações
                </Link>

                <Link
                  to="/admin/admins"
                  className={`nav-link-custom ${location.pathname === '/admin/admins' ? 'active' : ''}`}
                >
                  <i className="bi bi-people"></i>
                  Administradores
                </Link>

                <Link
                  to="/admin/account"
                  className={`nav-link-custom ${location.pathname === '/admin/account' ? 'active' : ''}`}
                >
                  <i className="bi bi-person-gear"></i>
                  Minha Conta
                </Link>

                <div className="d-flex align-items-center gap-2 ps-2 border-start border-color">
                  <span className="small fw-semibold d-flex align-items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    <i className="bi bi-person-circle text-primary"></i>
                    {admin?.name || 'Admin'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm btn-outline-danger ms-1 py-1 px-3"
                    title="Encerrar sessão"
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/admin/login"
                className="nav-link-custom admin-badge-link ms-2"
                title="Área Administrativa"
              >
                <i className="bi bi-shield-lock"></i>
                Área Restrita
              </Link>
            )}

            {/* Botão de Alternar Tema no Desktop */}
            <button
              type="button"
              className="theme-toggle-btn ms-2"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Alternar para Modo Escuro' : 'Alternar para Modo Claro'}
              aria-label="Alternar tema claro e escuro"
            >
              <i className={`bi ${theme === 'light' ? 'bi-moon-stars-fill text-primary' : 'bi-sun-fill text-warning'}`}></i>
            </button>
          </nav>
        </div>

        {/* Menu Colapsável Mobile */}
        {isOpen && (
          <div className="nav-menu-collapse d-lg-none">
            <div className="d-flex flex-column gap-2 pt-2 pb-3">
              <Link
                to="/"
                className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <i className="bi bi-house-door"></i>
                Início
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`nav-link-custom ${
                      location.pathname === '/admin/dashboard' || location.pathname.startsWith('/admin/requests')
                        ? 'active'
                        : ''
                    }`}
                    onClick={closeMenu}
                  >
                    <i className="bi bi-speedometer2"></i>
                    Solicitações
                  </Link>

                  <Link
                    to="/admin/admins"
                    className={`nav-link-custom ${location.pathname === '/admin/admins' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <i className="bi bi-people"></i>
                    Administradores
                  </Link>

                  <Link
                    to="/admin/account"
                    className={`nav-link-custom ${location.pathname === '/admin/account' ? 'active' : ''}`}
                    onClick={closeMenu}
                  >
                    <i className="bi bi-person-gear"></i>
                    Minha Conta
                  </Link>

                  <div 
                    className="p-3 mt-2 rounded d-flex align-items-center justify-content-between"
                    style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)' }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-circle text-primary fs-5"></i>
                      <span className="small fw-semibold" style={{ color: 'var(--text-primary)' }}>{admin?.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        closeMenu();
                        handleLogout();
                      }}
                      className="btn btn-sm btn-danger py-1 px-3"
                    >
                      <i className="bi bi-box-arrow-right"></i> Sair
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/admin/login"
                  className="nav-link-custom admin-badge-link mt-1"
                  onClick={closeMenu}
                >
                  <i className="bi bi-shield-lock"></i>
                  Acesso Administrativo
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
