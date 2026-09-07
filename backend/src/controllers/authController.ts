import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AdminModel } from '../models/adminModel';
import { validateLoginInput, validatePasswordChange, validateEmail } from '../utils/validators';

export class AuthController {
  /**
   * Realiza login do administrador verificando is_active, senha e atualizando last_login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = validateLoginInput(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.errors[0],
          errors: validation.errors
        });
        return;
      }

      const { email, password } = req.body;
      const admin = await AdminModel.findByEmail(email);

      // Mensagem genérica para prevenir enumeração de usuários
      if (!admin || !admin.password) {
        res.status(401).json({
          success: false,
          message: 'Não foi possível realizar o login com essas credenciais.'
        });
        return;
      }

      // 1. Verificação se a conta está ativa
      if (!admin.is_active) {
        res.status(401).json({
          success: false,
          message: 'Não foi possível realizar o login com essas credenciais.'
        });
        return;
      }

      // 2. Comparação da senha criptografada com bcrypt
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Não foi possível realizar o login com essas credenciais.'
        });
        return;
      }

      // 3. Atualizar data do último login no MySQL
      await AdminModel.updateLastLogin(admin.id);

      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_games_mupi_2026_change_in_production';
      const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'];

      const payload = {
        id: admin.id,
        email: admin.email,
        name: admin.name
      };

      const token = jwt.sign(payload, secret, { expiresIn });

      // Configurar Cookie Seguro HttpOnly
      const isProduction = process.env.NODE_ENV === 'production';
      res.cookie('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 dia em ms
      });

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso!',
        token,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          is_active: admin.is_active,
          last_login: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Realiza logout limpando o cookie de autenticação
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax'
      });

      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retorna os dados do administrador atualmente autenticado
   */
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Não autenticado.'
        });
        return;
      }

      const admin = await AdminModel.findById(req.user.id);
      if (!admin) {
        res.status(404).json({
          success: false,
          message: 'Administrador não encontrado.'
        });
        return;
      }

      if (!admin.is_active) {
        res.status(403).json({
          success: false,
          message: 'Sua conta de administrador foi desativada.'
        });
        return;
      }

      res.status(200).json({
        success: true,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          is_active: admin.is_active,
          created_at: admin.created_at,
          last_login: admin.last_login
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza a senha da própria conta logada (PATCH /api/auth/password)
   */
  static async changeOwnPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Não autenticado.' });
        return;
      }

      const validation = validatePasswordChange(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.errors[0],
          errors: validation.errors
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const admin = await AdminModel.findByIdWithPassword(req.user.id);

      if (!admin || !admin.password) {
        res.status(404).json({ success: false, message: 'Administrador não encontrado.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'A senha atual informada está incorreta.'
        });
        return;
      }

      await AdminModel.updatePassword(admin.id, newPassword);

      res.status(200).json({
        success: true,
        message: 'Sua senha foi alterada com sucesso!'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Atualiza os dados de perfil da própria conta logada (PATCH /api/auth/profile)
   */
  static async updateOwnProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Não autenticado.' });
        return;
      }

      const { name, email } = req.body;
      const trimmedName = typeof name === 'string' ? name.trim() : '';
      const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

      if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 100) {
        res.status(400).json({
          success: false,
          message: 'O nome deve ter entre 2 e 100 caracteres.'
        });
        return;
      }

      if (!trimmedEmail || !validateEmail(trimmedEmail)) {
        res.status(400).json({
          success: false,
          message: 'Informe um e-mail válido.'
        });
        return;
      }

      // Verifica se o novo e-mail já pertence a outro admin
      const existing = await AdminModel.findByEmail(trimmedEmail);
      if (existing && existing.id !== req.user.id) {
        res.status(400).json({
          success: false,
          message: 'Este e-mail já está sendo utilizado por outro administrador.'
        });
        return;
      }

      await AdminModel.updateProfile(req.user.id, trimmedName, trimmedEmail);

      const updated = await AdminModel.findById(req.user.id);

      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso!',
        admin: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
