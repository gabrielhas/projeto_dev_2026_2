export const ALLOWED_PLATFORMS = ['PS4', 'PS5', 'Xbox Series', 'Nintendo'] as const;
export type GamePlatform = typeof ALLOWED_PLATFORMS[number];

export const ALLOWED_STATUSES = ['pending', 'approved', 'rejected', 'completed'] as const;
export type RequestStatus = typeof ALLOWED_STATUSES[number];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 150;
}

export function validatePlatform(platform: any): boolean {
  return typeof platform === 'string' && ALLOWED_PLATFORMS.includes(platform as GamePlatform);
}

export function validateStatus(status: any): boolean {
  return typeof status === 'string' && ALLOWED_STATUSES.includes(status as RequestStatus);
}

export function validateRequestInput(data: {
  name?: any;
  email?: any;
  gameName?: any;
  game_name?: any;
  platform?: any;
}): ValidationResult {
  const errors: string[] = [];
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const gameName = typeof (data.gameName || data.game_name) === 'string' ? (data.gameName || data.game_name).trim() : '';
  const platform = typeof data.platform === 'string' ? data.platform.trim() : '';

  // Validação do Nome
  if (!name) {
    errors.push('O nome é obrigatório.');
  } else if (name.length < 2 || name.length > 100) {
    errors.push('O nome deve ter entre 2 e 100 caracteres.');
  }

  // Validação do E-mail
  if (!email) {
    errors.push('O e-mail é obrigatório.');
  } else if (!validateEmail(email)) {
    errors.push('Por favor, informe um endereço de e-mail válido (máximo 150 caracteres).');
  }

  // Validação do Nome do Jogo
  if (!gameName) {
    errors.push('O nome do jogo é obrigatório.');
  } else if (gameName.length < 1 || gameName.length > 200) {
    errors.push('O nome do jogo deve ter entre 1 e 200 caracteres.');
  }

  // Validação da Plataforma
  if (!platform) {
    errors.push('A plataforma do jogo é obrigatória.');
  } else if (!validatePlatform(platform)) {
    errors.push(`Plataforma inválida. Escolha entre: ${ALLOWED_PLATFORMS.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateLoginInput(data: { email?: any; password?: any }): ValidationResult {
  const errors: string[] = [];
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';

  if (!email) {
    errors.push('O e-mail é obrigatório.');
  } else if (!validateEmail(email)) {
    errors.push('Formato de e-mail inválido.');
  }

  if (!password) {
    errors.push('A senha é obrigatória.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAdminInput(data: {
  name?: any;
  email?: any;
  password?: any;
  confirmPassword?: any;
}): ValidationResult {
  const errors: string[] = [];
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  const password = typeof data.password === 'string' ? data.password : '';
  const confirmPassword = typeof data.confirmPassword === 'string' ? data.confirmPassword : '';

  if (!name || name.length < 2 || name.length > 100) {
    errors.push('O nome deve ter entre 2 e 100 caracteres.');
  }

  if (!email || !validateEmail(email)) {
    errors.push('Informe um e-mail válido com até 150 caracteres.');
  }

  if (password) {
    if (password.length < 6) {
      errors.push('A senha deve possuir no mínimo 6 caracteres.');
    }
    if (confirmPassword && password !== confirmPassword) {
      errors.push('A confirmação de senha não coincide com a nova senha.');
    }
  } else {
    errors.push('A senha é obrigatória para o cadastro de administrador.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validatePasswordChange(data: {
  currentPassword?: any;
  newPassword?: any;
  confirmPassword?: any;
}): ValidationResult {
  const errors: string[] = [];
  const currentPassword = typeof data.currentPassword === 'string' ? data.currentPassword : '';
  const newPassword = typeof data.newPassword === 'string' ? data.newPassword : '';
  const confirmPassword = typeof data.confirmPassword === 'string' ? data.confirmPassword : '';

  if (!currentPassword) {
    errors.push('A senha atual é obrigatória.');
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push('A nova senha deve possuir pelo menos 6 caracteres.');
  }

  if (newPassword !== confirmPassword) {
    errors.push('A confirmação da nova senha não coincide.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
