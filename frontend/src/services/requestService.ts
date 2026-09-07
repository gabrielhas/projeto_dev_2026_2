import api from './api';
import { GameRequest, PaginatedResponse, RequestStats, RequestStatus, GamePlatform, ApiResponse } from '../types';

export interface RequestFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  platform?: string;
}

export const requestService = {
  /**
   * [PÚBLICO] Envia uma nova solicitação de jogo com plataforma
   */
  async createRequest(name: string, email: string, gameName: string, platform: GamePlatform): Promise<GameRequest> {
    const response = await api.post<ApiResponse<GameRequest>>('/requests', {
      name,
      email,
      gameName,
      platform
    });
    return response.data.data!;
  },

  /**
   * [ADMIN] Lista solicitações com paginação, filtros (status, plataforma) e busca
   */
  async getRequests(params: RequestFilterParams = {}): Promise<PaginatedResponse<GameRequest>> {
    const response = await api.get<PaginatedResponse<GameRequest>>('/requests', {
      params
    });
    return response.data;
  },

  /**
   * [ADMIN] Obtém uma solicitação pelo ID
   */
  async getRequestById(id: number): Promise<GameRequest> {
    const response = await api.get<ApiResponse<GameRequest>>(`/requests/${id}`);
    return response.data.data!;
  },

  /**
   * [ADMIN] Atualiza o status de uma solicitação
   */
  async updateStatus(id: number, status: RequestStatus): Promise<GameRequest> {
    const response = await api.patch<ApiResponse<GameRequest>>(`/requests/${id}/status`, {
      status
    });
    return response.data.data!;
  },

  /**
   * [ADMIN] Exclui uma solicitação
   */
  async deleteRequest(id: number): Promise<void> {
    await api.delete(`/requests/${id}`);
  },

  /**
   * [ADMIN] Obtém contadores para os KPI Cards
   */
  async getStats(): Promise<RequestStats> {
    const response = await api.get<ApiResponse<RequestStats>>('/requests/stats/summary');
    return response.data.data!;
  }
};
