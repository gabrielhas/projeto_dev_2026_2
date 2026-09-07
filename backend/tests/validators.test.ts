import {
  validateEmail,
  validateRequestInput,
  validateStatus,
  validatePlatform,
  validateLoginInput,
  validateAdminInput,
  validatePasswordChange
} from '../src/utils/validators';

describe('Validações do Sistema', () => {
  describe('validateEmail', () => {
    it('deve aceitar e-mails com formato válido', () => {
      expect(validateEmail('usuario@teste.com')).toBe(true);
      expect(validateEmail('admin.jogos@mupi.com.br')).toBe(true);
    });

    it('deve rejeitar e-mails inválidos ou vazios', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('usuario@')).toBe(false);
      expect(validateEmail('usuario@dominio')).toBe(false);
      expect(validateEmail('usuario sem arroba')).toBe(false);
    });
  });

  describe('validatePlatform', () => {
    it('deve aceitar exclusivamente PS4, PS5, Xbox Series e Nintendo', () => {
      expect(validatePlatform('PS4')).toBe(true);
      expect(validatePlatform('PS5')).toBe(true);
      expect(validatePlatform('Xbox Series')).toBe(true);
      expect(validatePlatform('Nintendo')).toBe(true);

      // Valores rejeitados
      expect(validatePlatform('PC')).toBe(false);
      expect(validatePlatform('Steam')).toBe(false);
      expect(validatePlatform('Android')).toBe(false);
      expect(validatePlatform('PlayStation')).toBe(false);
      expect(validatePlatform('')).toBe(false);
    });
  });

  describe('validateRequestInput', () => {
    it('deve validar com sucesso quando todos os dados (inclusive plataforma) estiverem corretos', () => {
      const result = validateRequestInput({
        name: 'Gabriel Silva',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring',
        platform: 'PS5'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve falhar se a plataforma não for informada ou for inválida', () => {
      const resultNoPlatform = validateRequestInput({
        name: 'Gabriel Silva',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring'
      });
      expect(resultNoPlatform.isValid).toBe(false);

      const resultInvalidPlatform = validateRequestInput({
        name: 'Gabriel Silva',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring',
        platform: 'PC'
      });
      expect(resultInvalidPlatform.isValid).toBe(false);
    });

    it('deve falhar se o nome for muito curto ou vazio', () => {
      const result = validateRequestInput({
        name: 'A',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring',
        platform: 'PS4'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('O nome deve ter entre 2 e 100 caracteres.');
    });
  });

  describe('validateStatus', () => {
    it('deve aceitar pending, approved, rejected e completed', () => {
      expect(validateStatus('pending')).toBe(true);
      expect(validateStatus('approved')).toBe(true);
      expect(validateStatus('rejected')).toBe(true);
      expect(validateStatus('completed')).toBe(true);
      expect(validateStatus('other')).toBe(false);
    });
  });

  describe('validateAdminInput', () => {
    it('deve validar criação de admin com dados corretos', () => {
      const result = validateAdminInput({
        name: 'Novo Admin',
        email: 'novo@admin.com',
        password: 'senhaSegura123',
        confirmPassword: 'senhaSegura123'
      });
      expect(result.isValid).toBe(true);
    });

    it('deve falhar se a confirmação de senha não coincidir', () => {
      const result = validateAdminInput({
        name: 'Novo Admin',
        email: 'novo@admin.com',
        password: 'senhaSegura123',
        confirmPassword: 'outraSenha'
      });
      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePasswordChange', () => {
    it('deve aprovar mudança de senha correta', () => {
      const result = validatePasswordChange({
        currentPassword: 'antigaSenha',
        newPassword: 'novaSenhaForte',
        confirmPassword: 'novaSenhaForte'
      });
      expect(result.isValid).toBe(true);
    });
  });
});
