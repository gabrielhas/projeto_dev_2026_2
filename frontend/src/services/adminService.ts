import api from './api';
import { AdminUser, ApiResponse } from '../types';

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  isActive?: boolean;
}

export interface UpdateAdminDto {
  name: string;
  email: string;
}

export const adminService = {
  /**
   * Lista todos os administradores cadastrados
   */
  async getAdmins(): Promise<AdminUser[]> {
    const response = await api.get<ApiResponse<AdminUser[]>>('/admins');
    return response.data.data || [];
  },

  /**
   * Busca um administrador pelo ID
   */
  async getAdminById(id: number): Promise<AdminUser> {
    const response = await api.get<ApiResponse<AdminUser>>(`/admins/${id}`);
    return response.data.data!;
  },

  /**
   * Cadastra um novo administrador
   */
  async createAdmin(data: CreateAdminDto): Promise<AdminUser> {
    const response = await api.post<ApiResponse<AdminUser>>('/admins', data);
    return response.data.data!;
  },

  /**
   * Atualiza dados de um administrador
   */
  async updateAdmin(id: number, data: UpdateAdminDto): Promise<AdminUser> {
    const response = await api.patch<ApiResponse<AdminUser>>(`/admins/${id}`, data);
    return response.data.data!;
  },

  /**
   * Ativa ou desativa um administrador
   */
  async updateStatus(id: number, isActive: boolean): Promise<AdminUser> {
    const response = await api.patch<ApiResponse<AdminUser>>(`/admins/${id}/status`, { isActive });
    return response.data.data!;
  },

  /**
   * Redefine a senha de um administrador
   */
  async updatePassword(id: number, newPassword: string, confirmPassword: string): Promise<void> {
    await api.patch(`/admins/${id}/password`, { newPassword, confirmPassword });
  }
};
