import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestService } from '../services/requestService';
import { GameRequest, RequestStatus } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { StatusBadge, PlatformBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<GameRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    const loadRequest = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await requestService.getRequestById(Number(id));
        setRequest(data);
      } catch (err: any) {
        setAlertMessage({
          type: 'danger',
          text: err.response?.data?.message || 'Solicitação não encontrada.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRequest();
  }, [id]);

  const handleStatusChange = async (newStatus: RequestStatus) => {
    if (!request) return;
    setIsUpdating(true);
    try {
      const updated = await requestService.updateStatus(request.id, newStatus);
      setRequest(updated);
      setAlertMessage({
        type: 'success',
        text: `Status alterado para "${newStatus.toUpperCase()}" com sucesso!`
      });
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao atualizar status.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!request) return;
    setIsDeleting(true);
    try {
      await requestService.deleteRequest(request.id);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao excluir solicitação.'
      });
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="content-wrapper">
      <div className="bg-mesh" aria-hidden="true"></div>
      <Header />

      <main className="flex-grow-1 py-4 py-md-5">
        <div className="container-custom">
          {/* Breadcrumb / Navegação Superior */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <Link to="/admin/dashboard" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Voltar ao Dashboard
            </Link>

            {request && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => setDeleteModalOpen(true)}
              >
                <i className="bi bi-trash me-1"></i> Excluir Solicitação
              </button>
            )}
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
            <div className="form-card-wrapper p-5">
              <Loading message="Carregando detalhes da solicitação..." />
            </div>
          ) : !request ? (
            <div className="form-card-wrapper text-center p-5">
              <i className="bi bi-exclamation-circle text-warning display-4 mb-3"></i>
              <h2 className="h4 fw-bold" style={{ color: 'var(--text-primary)' }}>Solicitação não encontrada</h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                O registro solicitado pode ter sido excluído ou não existe no banco de dados.
              </p>
              <Link to="/admin/dashboard" className="btn btn-primary">
                Ir para o Dashboard
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {/* Coluna Principal de Detalhes */}
              <div className="col-12 col-lg-8">
                <div className="form-card-wrapper">
                  <div 
                    className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    <div>
                      <span className="text-primary fw-bold fs-6">Solicitação #{request.id}</span>
                      <h1 className="h3 fw-bold mt-1 mb-0" style={{ color: 'var(--text-primary)' }}>{request.game_name}</h1>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <PlatformBadge platform={request.platform} />
                      <StatusBadge status={request.status} />
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-12 col-sm-6">
                      <div className="small mb-1" style={{ color: 'var(--text-muted)' }}>Nome do Solicitante</div>
                      <div className="fw-semibold fs-5 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <i className="bi bi-person text-primary"></i>
                        {request.name}
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="small mb-1" style={{ color: 'var(--text-muted)' }}>E-mail para Contato</div>
                      <div className="fw-semibold fs-5 d-flex align-items-center gap-2">
                        <i className="bi bi-envelope text-primary"></i>
                        <a
                          href={`mailto:${request.email}`}
                          className="text-decoration-none text-break"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {request.email}
                        </a>
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="small mb-1" style={{ color: 'var(--text-muted)' }}>Plataforma Solicitada</div>
                      <div className="d-flex align-items-center gap-2">
                        <PlatformBadge platform={request.platform} />
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="small mb-1" style={{ color: 'var(--text-muted)' }}>Data de Criação</div>
                      <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <i className="bi bi-calendar-event" style={{ color: 'var(--text-muted)' }}></i>
                        {formatDate(request.created_at)}
                      </div>
                    </div>

                    <div className="col-12 col-sm-6">
                      <div className="small mb-1" style={{ color: 'var(--text-muted)' }}>Última Atualização</div>
                      <div className="d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <i className="bi bi-clock-history" style={{ color: 'var(--text-muted)' }}></i>
                        {formatDate(request.updated_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Lateral de Alteração de Status */}
              <div className="col-12 col-lg-4">
                <div className="form-card-wrapper h-100">
                  <h2 className="h5 fw-bold mb-3 d-flex align-items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <i className="bi bi-sliders text-primary"></i>
                    Gerenciar Status
                  </h2>
                  <p className="small mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Altere o status desta solicitação para manter o solicitante e a equipe atualizados.
                  </p>

                  <div className="d-flex flex-column gap-2">
                    <button
                      type="button"
                      className={`btn text-start p-3 ${
                        request.status === 'pending'
                          ? 'btn-warning text-dark fw-bold'
                          : 'btn-outline-warning'
                      }`}
                      onClick={() => handleStatusChange('pending')}
                      disabled={isUpdating || request.status === 'pending'}
                    >
                      <i className="bi bi-hourglass-split me-2"></i>
                      Marcar como Pendente
                    </button>

                    <button
                      type="button"
                      className={`btn text-start p-3 ${
                        request.status === 'approved'
                          ? 'btn-success fw-bold'
                          : 'btn-outline-success'
                      }`}
                      onClick={() => handleStatusChange('approved')}
                      disabled={isUpdating || request.status === 'approved'}
                    >
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Aprovar Solicitação
                    </button>

                    <button
                      type="button"
                      className={`btn text-start p-3 ${
                        request.status === 'completed'
                          ? 'btn-info text-dark fw-bold'
                          : 'btn-outline-info'
                      }`}
                      onClick={() => handleStatusChange('completed')}
                      disabled={isUpdating || request.status === 'completed'}
                    >
                      <i className="bi bi-check2-all me-2"></i>
                      Marcar como Concluído
                    </button>

                    <button
                      type="button"
                      className={`btn text-start p-3 ${
                        request.status === 'rejected'
                          ? 'btn-danger fw-bold'
                          : 'btn-outline-danger'
                      }`}
                      onClick={() => handleStatusChange('rejected')}
                      disabled={isUpdating || request.status === 'rejected'}
                    >
                      <i className="bi bi-x-circle-fill me-2"></i>
                      Rejeitar Solicitação
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Exclusão */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Excluir esta solicitação?"
        message="Tem certeza que deseja excluir esta solicitação? O registro será permanentemente removido do banco de dados MySQL."
        confirmText="Sim, excluir agora"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />

      <Footer />
    </div>
  );
};
