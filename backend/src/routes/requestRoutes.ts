import { Router } from 'express';
import { RequestController } from '../controllers/requestController';
import { authMiddleware } from '../middleware/authMiddleware';
import { publicRequestRateLimiter } from '../middleware/rateLimit';

const router = Router();

// ==========================================
// Rota Pública (Usuário comum)
// ==========================================
router.post('/', publicRequestRateLimiter, RequestController.createRequest);

// ==========================================
// Rotas Administrativas (Protegidas por JWT)
// ==========================================
router.get('/stats/summary', authMiddleware, RequestController.getRequestStats);
router.get('/', authMiddleware, RequestController.getRequests);
router.get('/:id', authMiddleware, RequestController.getRequestById);
router.patch('/:id/status', authMiddleware, RequestController.updateRequestStatus);
router.delete('/:id', authMiddleware, RequestController.deleteRequest);

export default router;
