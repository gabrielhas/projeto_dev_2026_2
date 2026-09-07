import { Request, Response, NextFunction } from 'express';
import { AdminModel } from '../models/adminModel';
import { validateAdminInput, validateEmail } from '../utils/validators';

export class AdminController {
  /**
   * [ADMIN] Lista todos os administradores cadastrados
   * GET /api/admins
   */
  static async getAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await AdminModel.findAll();
      res.status(200).json({
        success: true,
        data: admins
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Visualiza dados de um administrador
   * GET /api/admins/:id
   */
  static async getAdminById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID de administrador inválido.' });
        return;
      }

      const admin = await AdminModel.findById(id);
      if (!admin) {
        res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
        return;
      }

      res.status(200).json({
        success: true,
        data: admin
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Cadastra um novo administrador
   * POST /api/admins
   */
  static async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateAdminInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.errors[0],
          errors: validation.errors
        });
        return;
      }

      const { name, email, password, isActive } = req.body;
      const cleanEmail = email.trim().toLowerCase();

      const existing = await AdminModel.findByEmail(cleanEmail);
      if (existing) {
        res.status(400).json({
          success: false,
          message: 'Já existe um administrador cadastrado com este e-mail.'
        });
        return;
      }

      const status = typeof isActive === 'boolean' ? isActive : true;
      const insertId = await AdminModel.create(name, cleanEmail, password, status);
      const newAdmin = await AdminModel.findById(insertId);

      res.status(201).json({
        success: true,
        message: 'Administrador cadastrado com sucesso!',
        data: newAdmin
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Atualiza dados cadastrais de um administrador
   * PATCH /api/admins/:id
   */
  static async updateAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID de administrador inválido.' });
        return;
      }

      const { name, email } = req.body;
      const cleanName = typeof name === 'string' ? name.trim() : '';
      const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

      if (!cleanName || cleanName.length < 2 || cleanName.length > 100) {
        res.status(400).json({
          success: false,
          message: 'O nome deve ter entre 2 e 100 caracteres.'
        });
        return;
      }

      if (!cleanEmail || !validateEmail(cleanEmail)) {
        res.status(400).json({
          success: false,
          message: 'Informe um e-mail válido com até 150 caracteres.'
        });
        return;
      }

      const targetAdmin = await AdminModel.findById(id);
      if (!targetAdmin) {
        res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
        return;
      }

      // Verifica se o novo e-mail já pertence a outro admin
      const emailOwner = await AdminModel.findByEmail(cleanEmail);
      if (emailOwner && emailOwner.id !== id) {
        res.status(400).json({
          success: false,
          message: 'Este e-mail já está sendo utilizado por outro administrador.'
        });
        return;
      }

      await AdminModel.updateProfile(id, cleanName, cleanEmail);
      const updated = await AdminModel.findById(id);

      res.status(200).json({
        success: true,
        message: 'Dados do administrador atualizados com sucesso!',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Ativa ou desativa um administrador
   * PATCH /api/admins/:id/status
   */
  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID de administrador inválido.' });
        return;
      }

      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'O campo isActive deve ser um booleano (true ou false).'
        });
        return;
      }

      const targetAdmin = await AdminModel.findById(id);
      if (!targetAdmin) {
        res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
        return;
      }

      // PROTEÇÃO DE SEGURANÇA: Não permitir desativar o último administrador ativo
      if (!isActive && targetAdmin.is_active) {
        const activeCount = await AdminModel.countActive();
        if (activeCount <= 1) {
          res.status(400).json({
            success: false,
            message: 'Não é possível desativar o último administrador ativo do sistema.'
          });
          return;
        }
      }

      await AdminModel.updateStatus(id, isActive);
      const updated = await AdminModel.findById(id);

      res.status(200).json({
        success: true,
        message: `Administrador ${isActive ? 'ativado' : 'desativado'} com sucesso!`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * [ADMIN] Redefine a senha de um administrador
   * PATCH /api/admins/:id/password
   */
  static async updatePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'ID de administrador inválido.' });
        return;
      }

      const { newPassword, confirmPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({
          success: false,
          message: 'A nova senha deve possuir no mínimo 6 caracteres.'
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({
          success: false,
          message: 'A confirmação de senha não coincide com a nova senha.'
        });
        return;
      }

      const targetAdmin = await AdminModel.findById(id);
      if (!targetAdmin) {
        res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
        return;
      }

      await AdminModel.updatePassword(id, newPassword);

      res.status(200).json({
        success: true,
        message: 'Senha do administrador redefinida com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }
}
