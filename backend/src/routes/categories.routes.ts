import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/categories.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', getAll); 

router.post('/', authMiddleware, create);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, remove);

export default router;