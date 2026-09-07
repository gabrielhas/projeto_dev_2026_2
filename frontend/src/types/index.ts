export type GamePlatform = 'PS4' | 'PS5' | 'Xbox Series' | 'Nintendo';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface GameRequest {
  id: number;
  name: string;
  email: string;
  game_name: string;
  platform: GamePlatform;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  admin?: AdminUser;
  token?: string;
  errors?: string[];
}
