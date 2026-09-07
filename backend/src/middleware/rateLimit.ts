import rateLimit from 'express-rate-limit';

// Rate limiter específico para a rota de login (evita ataques de força bruta)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Limite de 10 tentativas por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas tentativas de login a partir deste endereço IP. Tente novamente após 15 minutos.'
  }
});

// Rate limiter geral para a criação de solicitações públicas (evita spam)
export const publicRequestRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 30, // 30 requisições a cada 10 min por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Limite de solicitações atingido temporariamente. Por favor, aguarde alguns minutos.'
  }
});
