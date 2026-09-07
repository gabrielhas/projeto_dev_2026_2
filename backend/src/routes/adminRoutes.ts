import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Todas as rotas de gerenciamento de administradores exigem autenticação
router.use(authMiddleware);

router.get('/', AdminController.getAdmins);
router.get('/:id', AdminController.getAdminById);
router.post('/', AdminController.createAdmin);
router.patch('/:id', AdminController.updateAdmin);
router.patch('/:id/status', AdminController.updateStatus);
router.patch('/:id/password', AdminController.updatePassword);

export default router;
