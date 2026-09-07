import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { GameRequest, RequestStats, RequestStatus, PaginationMeta } from '../types';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PlatformBadge } from '../components/StatusBadge';
import { ConfirmModal } from '../components/ConfirmModal';
import { Pagination } from '../components/Pagination';
import { Alert } from '../components/Alert';
import { Loading } from '../components/Loading';

export const Dashboard: React.FC = () => {
  const { admin } = useAuth();

  // Estados dos dados
  const [requests, setRequests] = useState<GameRequest[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });

  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1
  });

  // Estados de busca e filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Estados do modal de exclusão
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    requestId: number | null;
    gameName: string;
    isDeleting: boolean;
  }>({
    isOpen: false,
    requestId: null,
    gameName: '',
    isDeleting: false
  });

  // Carrega estatísticas dos KPIs
  const loadStats = useCallback(async () => {
    try {
      const data = await requestService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Carrega solicitações paginadas
  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await requestService.getRequests({
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        platform: platformFilter !== 'all' ? platformFilter : undefined
      });

      setRequests(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao carregar solicitações.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, statusFilter, platformFilter]);

  // Efeito para carregar dados ao mudar filtros ou página
  useEffect(() => {
    loadRequests();
    loadStats();
  }, [loadRequests, loadStats]);

  // Alteração de status
  const handleStatusChange = async (id: number, newStatus: RequestStatus) => {
    try {
      await requestService.updateStatus(id, newStatus);
      setAlertMessage({
        type: 'success',
        text: 'Status da solicitação atualizado com sucesso!'
      });
      // Atualiza lista e KPIs
      loadRequests();
      loadStats();
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Falha ao atualizar status.'
      });
    }
  };

  // Abre modal de exclusão
  const openDeleteModal = (reqItem: GameRequest) => {
    setDeleteModalState({
      isOpen: true,
      requestId: reqItem.id,
      gameName: reqItem.game_name,
      isDeleting: false
    });
  };

  // Executa exclusão confirmada
  const handleConfirmDelete = async () => {
    if (!deleteModalState.requestId) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      await requestService.deleteRequest(deleteModalState.requestId);
      setAlertMessage({
        type: 'success',
        text: `Solicitação do jogo "${deleteModalState.gameName}" foi excluída com sucesso.`
      });
      setDeleteModalState({ isOpen: false, requestId: null, gameName: '', isDeleting: false });
      loadRequests();
      loadStats();
    } catch (err: any) {
      setAlertMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Erro ao excluir solicitação.'
      });
      setDeleteModalState((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  // Formata data amigável
  const formatDate = (dateStr: string) => {
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

  return (
    <div className="content-wrapper">
      <div className="bg-mesh" aria-hidden="true"></div>
      <Header />

      <main className="flex-grow-1 py-4">
        <div className="container-custom">
          {/* Header do Painel */}
          <div className="dashboard-header">
            <div className="dashboard-title-area">
              <div>
                <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>Gerenciamento de Solicitações</h1>
                <p className="small mb-0" style={{ color: 'var(--text-secondary)' }}>
                  Bem-vindo(a), <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{admin?.name}</span>. Acompanhe e gerencie os pedidos de jogos dos usuários.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3 mt-sm-0">
                <Link to="/admin/admins" className="btn btn-outline-primary btn-sm">
                  <i className="bi bi-people me-1"></i> Administradores
                </Link>
                <button
                  onClick={() => {
                    loadRequests();
                    loadStats();
                  }}
                  className="btn btn-outline-secondary btn-sm"
                  title="Atualizar dados"
                >
                  <i className="bi bi-arrow-clockwise"></i> Atualizar
                </button>
              </div>
            </div>
          </div>

          {/* Alertas de Ação */}
          {alertMessage && (
            <Alert
              type={alertMessage.type}
              message={alertMessage.text}
              onClose={() => setAlertMessage(null)}
              className="mb-4"
            />
          )}

          {/* KPI Cards — Grid Adaptativo */}
          <section aria-label="Estatísticas do Painel" className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-box total">
                <i className="bi bi-collection-fill"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Total</div>
                <div className="kpi-number">{stats.total}</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box pending">
                <i className="bi bi-hourglass-split"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Pendentes</div>
                <div className="kpi-number">{stats.pending}</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box approved">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Aprovadas</div>
                <div className="kpi-number">{stats.approved}</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box completed">
                <i className="bi bi-check2-all"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Concluídas</div>
                <div className="kpi-number">{stats.completed}</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box rejected">
                <i className="bi bi-x-circle-fill"></i>
              </div>
              <div className="kpi-content">
                <div className="kpi-label">Rejeitadas</div>
                <div className="kpi-number">{stats.rejected}</div>
              </div>
            </div>
          </section>

          {/* Barra de Busca e Filtros Avançados */}
          <div className="dashboard-filter-bar">
            {/* Input de Busca com Botão de Limpar */}
            <div className="search-input-group">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Pesquisar por jogo, solicitante ou e-mail..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                aria-label="Pesquisar solicitações"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>

            <div className="filter-controls-group">
              {/* Filtro por Plataforma */}
              <div className="d-flex align-items-center gap-2">
                <select
                  className="platform-select-clean"
                  value={platformFilter}
                  onChange={(e) => {
                    setPlatformFilter(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  aria-label="Filtrar por plataforma"
                >
                  <option value="all">Todas Plataformas</option>
                  <option value="PS4">PS4</option>
                  <option value="PS5">PS5</option>
                  <option value="Xbox Series">Xbox Series</option>
                  <option value="Nintendo">Nintendo</option>
                </select>
              </div>

              {/* Filtro por Status em Pills */}
              <div className="filter-status-pills" role="tablist" aria-label="Filtrar por status">
                <button
                  type="button"
                  className={`btn-pill ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('all');
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  Todas <span className="pill-badge">{stats.total}</span>
                </button>
                <button
                  type="button"
                  className={`btn-pill ${statusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('pending');
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  Pendentes <span className="pill-badge">{stats.pending}</span>
                </button>
                <button
                  type="button"
                  className={`btn-pill ${statusFilter === 'approved' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('approved');
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  Aprovadas <span className="pill-badge">{stats.approved}</span>
                </button>
                <button
                  type="button"
                  className={`btn-pill ${statusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('completed');
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  Concluídas <span className="pill-badge">{stats.completed}</span>
                </button>
                <button
                  type="button"
                  className={`btn-pill ${statusFilter === 'rejected' ? 'active' : ''}`}
                  onClick={() => {
                    setStatusFilter('rejected');
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  Rejeitadas <span className="pill-badge">{stats.rejected}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal da Tabela / Cards Mobile */}
          {isLoading ? (
            <div className="table-responsive-wrapper p-5">
              <Loading message="Carregando solicitações..." />
            </div>
          ) : requests.length === 0 ? (
            <div className="table-responsive-wrapper empty-state-box">
              <i className="bi bi-inbox"></i>
              <h3 className="h5 fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>Nenhuma solicitação encontrada</h3>
              <p className="small mb-3" style={{ color: 'var(--text-secondary)' }}>
                {searchQuery || statusFilter !== 'all' || platformFilter !== 'all'
                  ? 'Tente ajustar seus termos de pesquisa ou filtros selecionados.'
                  : 'Nenhuma solicitação foi registrada no banco de dados ainda.'}
              </p>
              {(searchQuery || statusFilter !== 'all' || platformFilter !== 'all') && (
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPlatformFilter('all');
                  }}
                >
                  Limpar Todos os Filtros
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Visualização Desktop/Tablet: Tabela Otimizada e Limpa */}
              <div className="d-none d-lg-block table-responsive-wrapper">
                <div className="table-responsive-scroll">
                  <table className="custom-admin-table" aria-label="Tabela de solicitações de jogos">
                    <thead>
                      <tr>
                        <th scope="col" style={{ width: '60px' }}>ID</th>
                        <th scope="col">Jogo Solicitado</th>
                        <th scope="col">Plataforma</th>
                        <th scope="col">Solicitante</th>
                        <th scope="col">Status</th>
                        <th scope="col">Data</th>
                        <th scope="col" className="text-end" style={{ width: '110px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((item) => (
                        <tr key={item.id}>
                          <td style={{ color: 'var(--text-muted)', fontWeight: 700 }}>
                            #{item.id}
                          </td>
                          <td>
                            <div className="game-cell">
                              <span className="game-name">{item.game_name}</span>
                            </div>
                          </td>
                          <td>
                            <PlatformBadge platform={item.platform} />
                          </td>
                          <td>
                            <div className="user-cell">
                              <span className="user-name">{item.name}</span>
                              <span className="user-email">{item.email}</span>
                            </div>
                          </td>
                          <td>
                            {/* Seletor de Status Integrado & Clean */}
                            <select
                              className={`status-select-clean status-${item.status}`}
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as RequestStatus)}
                              aria-label={`Alterar status da solicitação ${item.id}`}
                            >
                              <option value="pending">Pendente</option>
                              <option value="approved">Aprovado</option>
                              <option value="completed">Concluído</option>
                              <option value="rejected">Rejeitado</option>
                            </select>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {formatDate(item.created_at)}
                          </td>
                          <td className="text-end">
                            <div className="d-inline-flex align-items-center justify-content-end gap-2">
                              {/* Ver Detalhes */}
                              <Link
                                to={`/admin/requests/${item.id}`}
                                className="table-action-btn"
                                title="Ver detalhes completos"
                              >
                                <i className="bi bi-eye"></i>
                              </Link>

                              {/* Excluir */}
                              <button
                                type="button"
                                className="table-action-btn btn-delete"
                                onClick={() => openDeleteModal(item)}
                                title="Excluir solicitação"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visualização Mobile/Tablet Pequeno: Cards Adaptativos Individuais */}
              <div className="d-lg-none">
                {requests.map((item) => (
                  <div key={item.id} className="mobile-request-card">
                    <div className="card-top-row">
                      <div className="game-title">
                        <span className="text-primary me-1">#{item.id}</span>
                        {item.game_name}
                      </div>
                      <PlatformBadge platform={item.platform} size="sm" />
                    </div>

                    <div className="card-meta">
                      <div>
                        <i className="bi bi-person text-primary"></i>
                        <span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      </div>
                      <div>
                        <i className="bi bi-envelope text-secondary"></i>
                        <span>{item.email}</span>
                      </div>
                      <div>
                        <i className="bi bi-clock text-secondary"></i>
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>

                    {/* Ações Mobile */}
                    <div className="card-actions-row">
                      <select
                        className={`status-select-clean status-${item.status} flex-grow-1`}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as RequestStatus)}
                        aria-label={`Alterar status do jogo ${item.game_name}`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="approved">Aprovado</option>
                        <option value="completed">Concluído</option>
                        <option value="rejected">Rejeitado</option>
                      </select>

                      <Link
                        to={`/admin/requests/${item.id}`}
                        className="btn btn-outline-primary btn-sm px-3"
                        title="Ver Detalhes"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>

                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm px-3"
                        onClick={() => openDeleteModal(item)}
                        aria-label="Excluir"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                limit={pagination.limit}
                onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              />
            </>
          )}


        </div>
      </main>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        title="Excluir solicitação de jogo"
        message={`Tem certeza que deseja excluir esta solicitação? Esta ação é irreversível e apagará o registro no banco de dados.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        confirmVariant="danger"
        isLoading={deleteModalState.isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalState({ isOpen: false, requestId: null, gameName: '', isDeleting: false })}
      />

      <Footer />
    </div>
  );
};
