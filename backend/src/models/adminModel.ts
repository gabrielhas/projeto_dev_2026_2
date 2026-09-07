import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/database';
import bcrypt from 'bcrypt';

export interface Admin {
  id: number;
  name: string;
  email: string;
  password?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  last_login?: Date | null;
}

export interface AdminRow extends Admin, RowDataPacket {}

export class AdminModel {
  /**
   * Busca um administrador pelo e-mail
   */
  static async findByEmail(email: string): Promise<Admin | null> {
    const [rows] = await pool.query<AdminRow[]>(
      'SELECT id, name, email, password, is_active, created_at, updated_at, last_login FROM admins WHERE email = ? LIMIT 1',
      [email.trim().toLowerCase()]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Busca um administrador pelo ID (sem retornar a senha)
   */
  static async findById(id: number): Promise<Omit<Admin, 'password'> | null> {
    const [rows] = await pool.query<AdminRow[]>(
      'SELECT id, name, email, is_active, created_at, updated_at, last_login FROM admins WHERE id = ? LIMIT 1',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Busca um administrador com a senha pelo ID (para verificação de senha atual)
   */
  static async findByIdWithPassword(id: number): Promise<Admin | null> {
    const [rows] = await pool.query<AdminRow[]>(
      'SELECT id, name, email, password, is_active, created_at, updated_at, last_login FROM admins WHERE id = ? LIMIT 1',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Lista todos os administradores cadastrados (sem as senhas)
   */
  static async findAll(): Promise<Omit<Admin, 'password'>[]> {
    const [rows] = await pool.query<AdminRow[]>(
      'SELECT id, name, email, is_active, created_at, updated_at, last_login FROM admins ORDER BY created_at DESC'
    );
    return rows;
  }

  /**
   * Conta quantos administradores ativos existem no sistema
   */
  static async countActive(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM admins WHERE is_active = TRUE'
    );
    return (rows[0] as any).count || 0;
  }

  /**
   * Cria um novo administrador com senha hash e status ativo/inativo
   */
  static async create(name: string, email: string, rawPassword: string, isActive = true): Promise<number> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO admins (name, email, password, is_active) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, isActive]
    );

    return result.insertId;
  }

  /**
   * Atualiza os dados cadastrais (nome, email) de um administrador
   */
  static async updateProfile(id: number, name: string, email: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE admins SET name = ?, email = ? WHERE id = ?',
      [name.trim(), email.trim().toLowerCase(), id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Ativa ou desativa um administrador
   */
  static async updateStatus(id: number, isActive: boolean): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE admins SET is_active = ? WHERE id = ?',
      [isActive, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Atualiza a senha de um administrador com hash bcrypt
   */
  static async updatePassword(id: number, rawPassword: string): Promise<boolean> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE admins SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  /**
   * Atualiza o timestamp do último login realizado
   */
  static async updateLastLogin(id: number): Promise<void> {
    await pool.query(
      'UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  /**
   * Seed automático se a tabela de admins estiver vazia
   */
  static async seedDefaultAdmin(): Promise<void> {
    const [rows] = await pool.query<AdminRow[]>('SELECT COUNT(*) as count FROM admins');
    const count = (rows[0] as any).count || 0;

    if (count === 0) {
      const defaultName = process.env.ADMIN_NAME || 'Administrador Master';
      const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@gamerequests.com').toLowerCase().trim();
      const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

      await pool.query(
        'INSERT INTO admins (name, email, password, is_active) VALUES (?, ?, ?, TRUE)',
        [defaultName, defaultEmail, hashedPassword]
      );

      console.log(`🌱 Administrador inicial criado com sucesso (ATIVO): ${defaultEmail}`);
    }
  }
}
