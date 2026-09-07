import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Alert } from '../components/Alert';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redireciona se já estiver autenticado
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e sua senha de acesso.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Não foi possível autenticar. Verifique suas credenciais e tente novamente.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="bg-mesh" aria-hidden="true"></div>
      <Header />

      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container-custom">
          <div className="row justify-content-center">
            <div className="col-12 col-sm-10 col-md-8 col-lg-5">
              <div className="form-card-wrapper">
                <div className="text-center mb-4">
                  <div
                    className="brand-logo-icon mx-auto mb-3"
                    style={{ width: '54px', height: '54px', fontSize: '1.75rem' }}
                  >
                    <i className="bi bi-shield-lock-fill"></i>
                  </div>
                  <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Área Administrativa</h1>
                  <p className="small" style={{ color: 'var(--text-secondary)' }}>
                    Autenticação exclusiva para moderadores e administradores
                  </p>
                </div>

                {errorMessage && (
                  <Alert
                    type="danger"
                    message={errorMessage}
                    onClose={() => setErrorMessage(null)}
                    className="mb-4"
                  />
                )}

                <form onSubmit={handleSubmit} noValidate>
                  {/* Campo E-mail */}
                  <div className="custom-form-group">
                    <label htmlFor="login-email">E-mail administrativo</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="login-email"
                        className="form-control-custom"
                        placeholder="admin@gamerequests.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        autoComplete="email"
                        required
                      />
                      <i className="bi bi-envelope input-icon"></i>
                    </div>
                  </div>

                  {/* Campo Senha */}
                  <div className="custom-form-group">
                    <label htmlFor="login-password">Senha de acesso</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        id="login-password"
                        className="form-control-custom"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isSubmitting}
                        autoComplete="current-password"
                        required
                      />
                      <i className="bi bi-key input-icon"></i>
                    </div>
                  </div>

                  {/* Botão de Entrar */}
                  <button
                    type="submit"
                    className="btn btn-submit-action rounded-3 mt-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Autenticando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-1"></i>
                        Entrar no painel
                      </>
                    )}
                  </button>

                  <div className="text-center mt-4">
                    <Link to="/" className="text-muted small text-decoration-none">
                      <i className="bi bi-arrow-left me-1"></i>
                      Voltar para a página pública
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
