import React, { useState, useEffect, useCallback } from 'react';
import { adminService, CreateAdminDto } from '../services/adminService';
import { AdminUser } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';
import { ConfirmModal } from '../components/ConfirmModal';

export const AdminsManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Modal de Criação de Admin
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateAdminDto>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isActive: true
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Modal de Edição de Admin
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string }>({ name: '', email: '' });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  // Modal de Redefinição de Senha
  const [passwordModalAdmin, setPasswordModalAdmin] = useState<AdminUser | null>(null);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Modal de Confirmação de Desativação
  const [statusToggleTarget, setStatusToggleTarget] = useState<AdminUser | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadAdmins = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdmins();
      setAdmins(data);
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao carregar lista de administradores.'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  // Formatação de data
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Nunca acessou';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Submissão de Criação de Admin
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!createForm.name.trim() || createForm.name.trim().length < 2) {
      errors.name = 'O nome deve ter no mínimo 2 caracteres.';
    }
    if (!createForm.email.trim()) {
      errors.email = 'O e-mail é obrigatório.';
    }
    if (!createForm.password || createForm.password.length < 6) {
      errors.password = 'A senha deve possuir no mínimo 6 caracteres.';
    }
    if (createForm.password !== createForm.confirmPassword) {
      errors.confirmPassword = 'A confirmação de senha não coincide.';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setIsCreating(true);
    try {
      await adminService.createAdmin(createForm);
      setAlertMessage({ type: 'success', text: 'Administrador cadastrado com sucesso no MySQL!' });
      setIsCreateModalOpen(false);
      setCreateForm({ name: '', email: '', password: '', confirmPassword: '', isActive: true });
      setCreateErrors({});
      loadAdmins();
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao cadastrar administrador.'
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Submissão de Edição de Admin
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    const errors: Record<string, string> = {};
    if (!editForm.name.trim() || editForm.name.trim().length < 2) {
      errors.name = 'O nome deve ter no mínimo 2 caracteres.';
    }
    if (!editForm.email.trim()) {
      errors.email = 'O e-mail é obrigatório.';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setIsEditing(true);
    try {
      await adminService.updateAdmin(editingAdmin.id, editForm);
      setAlertMessage({ type: 'success', text: 'Dados do administrador atualizados com sucesso!' });
      setEditingAdmin(null);
      loadAdmins();
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao atualizar administrador.'
      });
    } finally {
      setIsEditing(false);
    }
  };

  // Submissão de Alteração de Senha
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalAdmin) return;

    const errors: Record<string, string> = {};
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      errors.newPassword = 'A senha deve possuir no mínimo 6 caracteres.';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'A confirmação não coincide com a nova senha.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await adminService.updatePassword(
        passwordModalAdmin.id,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setAlertMessage({ type: 'success', text: 'Senha do administrador redefinida com sucesso!' });
      setPasswordModalAdmin(null);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao alterar senha.'
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Confirmação de Ativação / Desativação
  const handleConfirmStatusToggle = async () => {
    if (!statusToggleTarget) return;

    setIsUpdatingStatus(true);
    const newStatus = !statusToggleTarget.is_active;

    try {
      await adminService.updateStatus(statusToggleTarget.id, newStatus);
      setAlertMessage({
        type: 'success',
        text: `Administrador ${newStatus ? 'ativado' : 'desativado'} com sucesso no banco de dados!`
      });
      setStatusToggleTarget(null);
      loadAdmins();
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao alterar status do administrador.'
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="bg-mesh" aria-hidden="true"></div>
      <Header />

      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container-custom">
          {/* Header da Página */}
          <div className="dashboard-header">
            <div className="dashboard-title-area">
              <div>
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Gerenciamento de Administradores</h1>
                <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Cadastre novos moderadores, controle status de ativação e gerencie acessos ao painel.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3 mt-sm-0">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <i className="bi bi-person-plus-fill me-1"></i> Novo Administrador
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={loadAdmins}
                  title="Atualizar lista"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>

          {alertMessage && (
            <Alert
              type={alertMessage.type}
              message={alertMessage.text}
              onClose={() => setAlertMessage(null)}
              className="mb-4"
            />
          )}

          {isLoading ? (
            <div className="table-responsive-wrapper p-5">
              <Loading message="Carregando lista de administradores..." />
            </div>
          ) : admins.length === 0 ? (
            <div className="table-responsive-wrapper empty-state-box">
              <i className="bi bi-people"></i>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhum administrador encontrado</h2>
              <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                Cadastre o primeiro administrador clicando no botão acima.
              </p>
            </div>
          ) : (
            <>
              {/* Visualização Desktop: Tabela */}
              <div className="d-none d-lg-block table-responsive-wrapper">
                <div className="table-responsive-scroll">
                  <table className="custom-admin-table" aria-label="Tabela de administradores">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Nome</th>
                        <th scope="col">E-mail</th>
                        <th scope="col">Status</th>
                        <th scope="col">Último Login</th>
                        <th scope="col">Data de Criação</th>
                        <th scope="col" className="text-end">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((adm) => (
                        <tr key={adm.id}>
                          <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>#{adm.id}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-person-circle text-primary"></i>
                              <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{adm.name}</span>
                            </div>
                          </td>
                          <td className="text-secondary">{adm.email}</td>
                          <td>
                            {adm.is_active ? (
                              <span className="badge rounded-pill bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-1">
                                <i className="bi bi-circle-fill me-1 small"></i> Ativo
                              </span>
                            ) : (
                              <span className="badge rounded-pill bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-3 py-1">
                                <i className="bi bi-circle me-1 small"></i> Inativo
                              </span>
                            )}
                          </td>
                          <td className="text-secondary small">{formatDate(adm.last_login)}</td>
                          <td className="text-secondary small">{formatDate(adm.created_at)}</td>
                          <td className="text-end">
                            <div className="d-inline-flex align-items-center gap-2">
                              {/* Botão Ativar/Desativar */}
                              <button
                                type="button"
                                className={`btn btn-sm ${
                                  adm.is_active ? 'btn-outline-warning' : 'btn-outline-success'
                                }`}
                                onClick={() => setStatusToggleTarget(adm)}
                                title={adm.is_active ? 'Desativar administrador' : 'Ativar administrador'}
                              >
                                <i className={`bi ${adm.is_active ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                              </button>

                              {/* Botão Editar Dados */}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => {
                                  setEditingAdmin(adm);
                                  setEditForm({ name: adm.name, email: adm.email });
                                  setEditErrors({});
                                }}
                                title="Editar dados cadastrais"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>

                              {/* Botão Alterar Senha */}
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  setPasswordModalAdmin(adm);
                                  setPasswordForm({ newPassword: '', confirmPassword: '' });
                                  setPasswordErrors({});
                                }}
                                title="Redefinir senha"
                              >
                                <i className="bi bi-key"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visualização Mobile: Cards Individuais */}
              <div className="d-lg-none">
                {admins.map((adm) => (
                  <div key={adm.id} className="mobile-request-card">
                    <div className="card-top-row">
                      <div className="game-title">
                        <span className="text-primary me-1">#{adm.id}</span>
                        {adm.name}
                      </div>
                      {adm.is_active ? (
                        <span className="badge rounded-pill bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1 small">
                          ● Ativo
                        </span>
                      ) : (
                        <span className="badge rounded-pill bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50 px-2 py-1 small">
                          ○ Inativo
                        </span>
                      )}
                    </div>

                    <div className="card-meta">
                      <div>
                        <i className="bi bi-envelope text-secondary"></i>
                        <span>{adm.email}</span>
                      </div>
                      <div>
                        <i className="bi bi-box-arrow-in-right text-secondary"></i>
                        <span>Último login: {formatDate(adm.last_login)}</span>
                      </div>
                      <div>
                        <i className="bi bi-calendar text-secondary"></i>
                        <span>Criado em: {formatDate(adm.created_at)}</span>
                      </div>
                    </div>

                    <div className="card-actions-row">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          adm.is_active ? 'btn-outline-warning' : 'btn-outline-success'
                        }`}
                        onClick={() => setStatusToggleTarget(adm)}
                      >
                        <i className={`bi ${adm.is_active ? 'bi-person-slash' : 'bi-person-check'} me-1`}></i>
                        {adm.is_active ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-info btn-sm"
                        onClick={() => {
                          setEditingAdmin(adm);
                          setEditForm({ name: adm.name, email: adm.email });
                          setEditErrors({});
                        }}
                      >
                        <i className="bi bi-pencil me-1"></i> Editar
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setPasswordModalAdmin(adm);
                          setPasswordForm({ newPassword: '', confirmPassword: '' });
                          setPasswordErrors({});
                        }}
                      >
                        <i className="bi bi-key me-1"></i> Senha
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Modal: Cadastrar Novo Administrador */}
      {isCreateModalOpen && (
        <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
          <div className="modal-content-custom">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Cadastrar Novo Administrador</h2>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Fechar"
              ></button>
            </div>

            <form onSubmit={handleCreateSubmit} noValidate>
              <div className="custom-form-group">
                <label htmlFor="create-name">Nome Completo</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="create-name"
                    className={`form-control-custom ${createErrors.name ? 'is-invalid' : ''}`}
                    placeholder="Ex: Carlos Oliveira"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    disabled={isCreating}
                    required
                  />
                  <i className="bi bi-person input-icon"></i>
                </div>
                {createErrors.name && <div className="field-error-msg">{createErrors.name}</div>}
              </div>

              <div className="custom-form-group">
                <label htmlFor="create-email">E-mail</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="create-email"
                    className={`form-control-custom ${createErrors.email ? 'is-invalid' : ''}`}
                    placeholder="Ex: carlos@gamerequests.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    disabled={isCreating}
                    required
                  />
                  <i className="bi bi-envelope input-icon"></i>
                </div>
                {createErrors.email && <div className="field-error-msg">{createErrors.email}</div>}
              </div>

              <div className="custom-form-group">
                <label htmlFor="create-password">Senha</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="create-password"
                    className={`form-control-custom ${createErrors.password ? 'is-invalid' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    disabled={isCreating}
                    required
                  />
                  <i className="bi bi-key input-icon"></i>
                </div>
                {createErrors.password && <div className="field-error-msg">{createErrors.password}</div>}
              </div>

              <div className="custom-form-group">
                <label htmlFor="create-confirm-password">Confirmar Senha</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="create-confirm-password"
                    className={`form-control-custom ${createErrors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repita a senha"
                    value={createForm.confirmPassword}
                    onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                    disabled={isCreating}
                    required
                  />
                  <i className="bi bi-shield-check input-icon"></i>
                </div>
                {createErrors.confirmPassword && (
                  <div className="field-error-msg">{createErrors.confirmPassword}</div>
                )}
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-2 border-top border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary px-4" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Salvando...
                    </>
                  ) : (
                    'Cadastrar Administrador'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Administrador */}
      {editingAdmin && (
        <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
          <div className="modal-content-custom">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Editar Administrador #{editingAdmin.id}</h2>
              <button
                type="button"
                className="btn-close"
                onClick={() => setEditingAdmin(null)}
                aria-label="Fechar"
              ></button>
            </div>

            <form onSubmit={handleEditSubmit} noValidate>
              <div className="custom-form-group">
                <label htmlFor="edit-name">Nome</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="edit-name"
                    className={`form-control-custom ${editErrors.name ? 'is-invalid' : ''}`}
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    disabled={isEditing}
                    required
                  />
                  <i className="bi bi-person input-icon"></i>
                </div>
                {editErrors.name && <div className="field-error-msg">{editErrors.name}</div>}
              </div>

              <div className="custom-form-group">
                <label htmlFor="edit-email">E-mail</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="edit-email"
                    className={`form-control-custom ${editErrors.email ? 'is-invalid' : ''}`}
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    disabled={isEditing}
                    required
                  />
                  <i className="bi bi-envelope input-icon"></i>
                </div>
                {editErrors.email && <div className="field-error-msg">{editErrors.email}</div>}
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-2 border-top border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setEditingAdmin(null)}
                  disabled={isEditing}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary px-4" disabled={isEditing}>
                  {isEditing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Redefinir Senha */}
      {passwordModalAdmin && (
        <div className="modal-backdrop-custom" role="dialog" aria-modal="true">
          <div className="modal-content-custom">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>
                Redefinir Senha de {passwordModalAdmin.name}
              </h2>
              <button
                type="button"
                className="btn-close"
                onClick={() => setPasswordModalAdmin(null)}
                aria-label="Fechar"
              ></button>
            </div>

            <form onSubmit={handlePasswordSubmit} noValidate>
              <div className="custom-form-group">
                <label htmlFor="modal-new-password">Nova Senha</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="modal-new-password"
                    className={`form-control-custom ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                    placeholder="Mínimo 6 caracteres"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    disabled={isUpdatingPassword}
                    required
                  />
                  <i className="bi bi-key input-icon"></i>
                </div>
                {passwordErrors.newPassword && (
                  <div className="field-error-msg">{passwordErrors.newPassword}</div>
                )}
              </div>

              <div className="custom-form-group">
                <label htmlFor="modal-confirm-password">Confirmar Nova Senha</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="modal-confirm-password"
                    className={`form-control-custom ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
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
                {passwordErrors.confirmPassword && (
                  <div className="field-error-msg">{passwordErrors.confirmPassword}</div>
                )}
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 mt-4 pt-2 border-top border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setPasswordModalAdmin(null)}
                  disabled={isUpdatingPassword}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span> Atualizando...
                    </>
                  ) : (
                    'Atualizar Senha'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação: Ativar/Desativar */}
      <ConfirmModal
        isOpen={!!statusToggleTarget}
        title={statusToggleTarget?.is_active ? 'Desativar Administrador?' : 'Ativar Administrador?'}
        message={
          statusToggleTarget?.is_active
            ? `Tem certeza que deseja desativar o administrador "${statusToggleTarget?.name}"? Ele perderá imediatamente o acesso ao painel.`
            : `Deseja reativar o acesso de "${statusToggleTarget?.name}" ao painel administrativo?`
        }
        confirmText={statusToggleTarget?.is_active ? 'Sim, Desativar' : 'Sim, Ativar'}
        cancelText="Cancelar"
        confirmVariant={statusToggleTarget?.is_active ? 'danger' : 'success'}
        isLoading={isUpdatingStatus}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setStatusToggleTarget(null)}
      />

      <Footer />
    </div>
  );
};
