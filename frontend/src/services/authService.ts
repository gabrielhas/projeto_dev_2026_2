import api from './api';
import { AdminUser, ApiResponse } from '../types';

export const authService = {
  /**
   * Realiza login do administrador
   */
  async login(email: string, password: string): Promise<{ admin: AdminUser; token?: string }> {
    const response = await api.post<ApiResponse<any>>('/auth/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    if (response.data.admin) {
      localStorage.setItem('auth_admin', JSON.stringify(response.data.admin));
    }

    return {
      admin: response.data.admin!,
      token: response.data.token
    };
  },

  /**
   * Realiza logout do administrador
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_admin');
    }
  },

  /**
   * Valida a sessão atual através do endpoint /api/auth/me
   */
  async getMe(): Promise<AdminUser | null> {
    try {
      const response = await api.get<ApiResponse>('/auth/me');
      if (response.data.admin) {
        localStorage.setItem('auth_admin', JSON.stringify(response.data.admin));
        return response.data.admin;
      }
      return null;
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_admin');
      return null;
    }
  },

  /**
   * Altera a própria senha da conta conectada
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
    await api.patch('/auth/password', { currentPassword, newPassword, confirmPassword });
  },

  /**
   * Atualiza dados cadastrais da própria conta
   */
  async updateProfile(name: string, email: string): Promise<AdminUser> {
    const response = await api.patch<ApiResponse<AdminUser>>('/auth/profile', { name, email });
    if (response.data.admin) {
      localStorage.setItem('auth_admin', JSON.stringify(response.data.admin));
      return response.data.admin;
    }
    return response.data.data!;
  },

  /**
   * Recupera admin armazenado localmente para inicialização síncrona
   */
  getStoredAdmin(): AdminUser | null {
    try {
      const raw = localStorage.getItem('auth_admin');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
