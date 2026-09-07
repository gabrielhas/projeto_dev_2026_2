import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { loginRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Rota de Login com proteção contra força bruta
router.post('/login', loginRateLimiter, AuthController.login);

// Rota de Logout
router.post('/logout', AuthController.logout);

// Rota para buscar dados do usuário autenticado
router.get('/me', authMiddleware, AuthController.getMe);

// Rota para alterar a própria senha
router.patch('/password', authMiddleware, AuthController.changeOwnPassword);

// Rota para atualizar o próprio perfil
router.patch('/profile', authMiddleware, AuthController.updateOwnProfile);

export default router;
