import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Alert } from '../components/Alert';

export const MyAccount: React.FC = () => {
  const { admin, checkAuth } = useAuth();

  // Estados do formulário de Perfil
  const [profileForm, setProfileForm] = useState({
    name: admin?.name || '',
    email: admin?.email || ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileAlert, setProfileAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Estados do formulário de Alteração de Senha
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Não registrado';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileAlert(null);

    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      setProfileAlert({ type: 'danger', text: 'O nome deve possuir no mínimo 2 caracteres.' });
      return;
    }

    if (!profileForm.email.trim()) {
      setProfileAlert({ type: 'danger', text: 'O e-mail é obrigatório.' });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await authService.updateProfile(profileForm.name.trim(), profileForm.email.trim());
      await checkAuth();
      setProfileAlert({ type: 'success', text: 'Dados cadastrais atualizados com sucesso!' });
    } catch (err: any) {
      setProfileAlert({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao atualizar dados do perfil.'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (!passwordForm.currentPassword) {
      setPasswordAlert({ type: 'danger', text: 'Por favor, informe sua senha atual.' });
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordAlert({ type: 'danger', text: 'A nova senha deve possuir no mínimo 6 caracteres.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordAlert({ type: 'danger', text: 'A confirmação de senha não coincide com a nova senha.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setPasswordAlert({ type: 'success', text: 'Sua senha foi alterada com sucesso!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordAlert({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao alterar sua senha.'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="bg-mesh" aria-hidden="true"></div>
      <Header />

      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container-custom">
          {/* Header */}
          <div className="dashboard-header">
            <div className="dashboard-title-area">
              <div>
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Minha Conta</h1>
                <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Gerencie suas credenciais de acesso e informações pessoais no sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="row g-4">
            {/* Coluna 1: Dados do Perfil e Resumo */}
            <div className="col-12 col-lg-6">
              <div className="form-card-wrapper mb-4">
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                  <div
                    className="brand-logo-icon"
                    style={{ width: '56px', height: '56px', fontSize: '1.75rem' }}
                  >
                    <i className="bi bi-person-circle"></i>
                  </div>
                  <div>
                    <h2 className="h5 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{admin?.name}</h2>
                    <span className="badge rounded-pill bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1">
                      ● Administrador Ativo
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="small mb-1" style={{ color: 'var(--text-muted)' }}>Último Acesso ao Sistema</div>
                  <div className="fw-medium d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <i className="bi bi-clock-history text-primary"></i>
                    {formatDate(admin?.last_login)}
                  </div>
                </div>

                {profileAlert && (
                  <Alert
                    type={profileAlert.type}
                    message={profileAlert.text}
                    onClose={() => setProfileAlert(null)}
                    className="mb-4"
                  />
                )}

                <h3 className="h6 fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Atualizar Informações</h3>

                <form onSubmit={handleProfileSubmit} noValidate>
                  <div className="custom-form-group">
                    <label htmlFor="account-name">Nome Completo</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        id="account-name"
                        className="form-control-custom"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        disabled={isUpdatingProfile}
                        required
                      />
                      <i className="bi bi-person input-icon"></i>
                    </div>
                  </div>

                  <div className="custom-form-group">
                    <label htmlFor="account-email">E-mail de Acesso</label>
                    <div className="input-wrapper">
                      <input
                        type="email"
                        id="account-email"
                        className="form-control-custom"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        disabled={isUpdatingProfile}
                        required
                      />
                      <i className="bi bi-envelope input-icon"></i>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 w-100 mt-2"
                    disabled={isUpdatingProfile}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span> Salvando...
                      </>
                    ) : (
                      'Salvar Dados Pessoais'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Coluna 2: Alteração de Senha */}
            <div className="col-12 col-lg-6">
              <div className="form-card-wrapper h-100">
                <div className="d-flex align-items-center gap-2 mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
                  <i className="bi bi-shield-lock text-primary fs-4"></i>
                  <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Alterar Senha</h2>
                </div>

                <p className="small mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Para maior segurança, utilize senhas fortes com números e caracteres especiais.
                </p>

                {passwordAlert && (
                  <Alert
                    type={passwordAlert.type}
                    message={passwordAlert.text}
                    onClose={() => setPasswordAlert(null)}
                    className="mb-4"
                  />
                )}

                <form onSubmit={handlePasswordSubmit} noValidate>
                  <div className="custom-form-group">
                    <label htmlFor="current-password">Senha Atual</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        id="current-password"
                        className="form-control-custom"
                        placeholder="Informe sua senha atual"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                        }
                        disabled={isUpdatingPassword}
                        required
                      />
                      <i className="bi bi-key input-icon"></i>
                    </div>
                  </div>

                  <div className="custom-form-group">
                    <label htmlFor="new-password">Nova Senha</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        id="new-password"
                        className="form-control-custom"
                        placeholder="Mínimo 6 caracteres"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                        disabled={isUpdatingPassword}
                        required
                      />
                      <i className="bi bi-lock input-icon"></i>
                    </div>
                  </div>

                  <div className="custom-form-group">
                    <label htmlFor="confirm-new-password">Confirmar Nova Senha</label>
                    <div className="input-wrapper">
                      <input
                        type="password"
                        id="confirm-new-password"
                        className="form-control-custom"
                        placeholder="Repita a nova senha"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                        disabled={isUpdatingPassword}
                        required
                      />
                      <i className="bi bi-shield-check input-icon"></i>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-submit-action rounded-3 mt-3"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span> Atualizando...
                      </>
                    ) : (
                      'Atualizar Minha Senha'
                    )}
                  </button>
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
