import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log estruturado no terminal do servidor para monitoramento
  console.error('🚨 [Internal Server Error]:', {
    path: req.path,
    method: req.method,
    message: err.message || err,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  
  // Resposta padronizada sem expor informações sensíveis de infraestrutura ao cliente
  res.status(statusCode).json({
    success: false,
    message: err.isCustom ? err.message : 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.',
    ...(process.env.NODE_ENV === 'development' && { devDetails: err.message })
  });
}
