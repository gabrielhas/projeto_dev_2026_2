import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import { GamePlatform, RequestStatus, ALLOWED_PLATFORMS, ALLOWED_STATUSES } from '../utils/validators';

export { GamePlatform, RequestStatus };

export interface GameRequest {
  id: number;
  name: string;
  email: string;
  game_name: string;
  platform: GamePlatform;
  status: RequestStatus;
  created_at: Date;
  updated_at: Date;
}

export interface GameRequestRow extends GameRequest, RowDataPacket {}

export interface RequestFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  platform?: string;
}

export interface RequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class RequestModel {
  /**
   * Cria uma nova solicitação de jogo com plataforma no MySQL
   */
  static async create(name: string, email: string, gameName: string, platform: GamePlatform): Promise<GameRequest> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO requests (name, email, game_name, platform, status) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim(), gameName.trim(), platform, 'pending']
    );

    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error('Erro ao recuperar solicitação recém-criada.');
    }
    return created;
  }

  /**
   * Busca uma solicitação pelo ID
   */
  static async findById(id: number): Promise<GameRequest | null> {
    const [rows] = await pool.query<GameRequestRow[]>(
      'SELECT id, name, email, game_name, platform, status, created_at, updated_at FROM requests WHERE id = ? LIMIT 1',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Lista solicitações com suporte a filtros (status, plataforma), busca e paginação segura (Prepared Statements)
   */
  static async findAll(params: RequestFilterParams): Promise<PaginatedResult<GameRequest>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const offset = (page - 1) * limit;

    const whereConditions: string[] = [];
    const queryParams: (string | number)[] = [];

    // Filtro por Status
    if (params.status && ALLOWED_STATUSES.includes(params.status as RequestStatus)) {
      whereConditions.push('status = ?');
      queryParams.push(params.status);
    }

    // Filtro por Plataforma
    if (params.platform && ALLOWED_PLATFORMS.includes(params.platform as GamePlatform)) {
      whereConditions.push('platform = ?');
      queryParams.push(params.platform);
    }

    // Busca textual por Nome, E-mail ou Nome do Jogo
    if (params.search && params.search.trim() !== '') {
      const searchPattern = `%${params.search.trim()}%`;
      whereConditions.push('(name LIKE ? OR email LIKE ? OR game_name LIKE ?)');
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Contagem total para paginação no MySQL
    const countSql = `SELECT COUNT(*) as total FROM requests ${whereClause}`;
    const [countRows] = await pool.query<RowDataPacket[]>(countSql, queryParams);
    const total = (countRows[0] as any).total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // Busca paginada dos dados com Prepared Statements
    const dataSql = `
      SELECT id, name, email, game_name, platform, status, created_at, updated_at 
      FROM requests 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query<GameRequestRow[]>(dataSql, [...queryParams, limit, offset]);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Atualiza o status de uma solicitação
   */
  static async updateStatus(id: number, status: RequestStatus): Promise<GameRequest | null> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE requests SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Remove uma solicitação do banco
   */
  static async delete(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM requests WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Retorna estatísticas de contagem por status para os KPI Cards
   */
  static async getStats(): Promise<RequestStats> {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM requests
    `);

    const result = rows[0] || {};
    return {
      total: Number(result.total) || 0,
      pending: Number(result.pending) || 0,
      approved: Number(result.approved) || 0,
      rejected: Number(result.rejected) || 0,
      completed: Number(result.completed) || 0
    };
  }
}
