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

  // ============================================================
  // validateEmail
  // ============================================================

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


    it('deve rejeitar formatos de e-mail claramente inválidos', () => {
      expect(validateEmail('usuario@.com')).toBe(false);
      expect(validateEmail('@dominio.com')).toBe(false);
      expect(validateEmail('usuario@@dominio.com')).toBe(false);
      expect(validateEmail('usuario@dominio.')).toBe(false);
    });

  });


  // ============================================================
  // validatePlatform
  // ============================================================

  describe('validatePlatform', () => {

    it('deve aceitar exclusivamente PS4, PS5, Xbox Series e Nintendo', () => {
      expect(validatePlatform('PS4')).toBe(true);
      expect(validatePlatform('PS5')).toBe(true);
      expect(validatePlatform('Xbox Series')).toBe(true);
      expect(validatePlatform('Nintendo')).toBe(true);
    });


    it('deve rejeitar plataformas não permitidas', () => {
      expect(validatePlatform('PC')).toBe(false);
      expect(validatePlatform('Steam')).toBe(false);
      expect(validatePlatform('Android')).toBe(false);
      expect(validatePlatform('PlayStation')).toBe(false);
      expect(validatePlatform('')).toBe(false);
    });


    it('deve rejeitar variações diferentes dos valores permitidos', () => {
      expect(validatePlatform('ps5')).toBe(false);
      expect(validatePlatform('PS 5')).toBe(false);
      expect(validatePlatform('Xbox')).toBe(false);
    });

  });


  // ============================================================
  // validateRequestInput
  // ============================================================

  describe('validateRequestInput', () => {

    it('deve validar com sucesso quando todos os dados estiverem corretos', () => {
      const result = validateRequestInput({
        name: 'Gabriel Silva',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring',
        platform: 'PS5'
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });


    it('deve falhar se a plataforma não for informada', () => {
      const result = validateRequestInput({
        name: 'Gabriel Silva',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring'
      });

      expect(result.isValid).toBe(false);
    });


    it('deve falhar se a plataforma for inválida', () => {
      const result = validateRequestInput({
        name: 'Gabriel Silva',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring',
        platform: 'PC'
      });

      expect(result.isValid).toBe(false);
    });


    it('deve falhar se o nome for muito curto ou vazio', () => {
      const result = validateRequestInput({
        name: 'A',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring',
        platform: 'PS4'
      });

      expect(result.isValid).toBe(false);

      expect(result.errors)
        .toContain('O nome deve ter entre 2 e 100 caracteres.');
    });


    it('deve falhar se o e-mail for inválido', () => {
      const result = validateRequestInput({
        name: 'Gabriel Silva',
        email: 'email-invalido',
        gameName: 'Elden Ring',
        platform: 'PS5'
      });

      expect(result.isValid).toBe(false);
    });


    it('deve falhar se o nome estiver vazio', () => {
      const result = validateRequestInput({
        name: '',
        email: 'gabriel@email.com',
        gameName: 'Elden Ring',
        platform: 'PS5'
      });

      expect(result.isValid).toBe(false);
    });

  });


  // ============================================================
  // validateStatus
  // ============================================================

  describe('validateStatus', () => {

    it('deve aceitar todos os status válidos', () => {
      expect(validateStatus('pending')).toBe(true);
      expect(validateStatus('approved')).toBe(true);
      expect(validateStatus('rejected')).toBe(true);
      expect(validateStatus('completed')).toBe(true);
    });


    it('deve rejeitar status inválidos', () => {
      expect(validateStatus('other')).toBe(false);
      expect(validateStatus('')).toBe(false);
      expect(validateStatus('Pending')).toBe(false);
      expect(validateStatus('cancelled')).toBe(false);
    });

  });


  // ============================================================
  // validateLoginInput
  // ============================================================

  describe('validateLoginInput', () => {

    it('deve validar login com dados corretos', () => {
      const result = validateLoginInput({
        email: 'admin@admin.com',
        password: 'senhaSegura123'
      });

      expect(result.isValid).toBe(true);
    });


    it('deve falhar quando o e-mail for inválido', () => {
      const result = validateLoginInput({
        email: 'email-invalido',
        password: 'senhaSegura123'
      });

      expect(result.isValid).toBe(false);
    });


    it('deve falhar quando a senha não for informada', () => {
      const result = validateLoginInput({
        email: 'admin@admin.com',
        password: ''
      });

      expect(result.isValid).toBe(false);
    });

  });


  // ============================================================
  // validateAdminInput
  // ============================================================

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


    it('deve falhar se o nome estiver vazio', () => {
      const result = validateAdminInput({
        name: '',
        email: 'novo@admin.com',
        password: 'senhaSegura123',
        confirmPassword: 'senhaSegura123'
      });

      expect(result.isValid).toBe(false);
    });


    it('deve falhar se o e-mail for inválido', () => {
      const result = validateAdminInput({
        name: 'Novo Admin',
        email: 'email-invalido',
        password: 'senhaSegura123',
        confirmPassword: 'senhaSegura123'
      });

      expect(result.isValid).toBe(false);
    });

  });


  // ============================================================
  // validatePasswordChange
  // ============================================================

  describe('validatePasswordChange', () => {

    it('deve aprovar mudança de senha correta', () => {
      const result = validatePasswordChange({
        currentPassword: 'antigaSenha',
        newPassword: 'novaSenhaForte',
        confirmPassword: 'novaSenhaForte'
      });

      expect(result.isValid).toBe(true);
    });


    it('deve falhar quando a confirmação da nova senha for diferente', () => {
      const result = validatePasswordChange({
        currentPassword: 'antigaSenha',
        newPassword: 'novaSenhaForte',
        confirmPassword: 'senhaDiferente'
      });

      expect(result.isValid).toBe(false);
    });


    it('deve falhar quando a senha atual não for informada', () => {
      const result = validatePasswordChange({
        currentPassword: '',
        newPassword: 'novaSenhaForte',
        confirmPassword: 'novaSenhaForte'
      });

      expect(result.isValid).toBe(false);
    });


    it('deve falhar quando a nova senha não for informada', () => {
      const result = validatePasswordChange({
        currentPassword: 'antigaSenha',
        newPassword: '',
        confirmPassword: ''
      });

      expect(result.isValid).toBe(false);
    });

  });

});