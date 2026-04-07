import { Router } from 'express';
import * as ProductController from '../controllers/products.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.get('/', ProductController.getAll);
router.post('/', authMiddleware, ProductController.upsert);
router.put('/:id', authMiddleware, ProductController.update);
router.delete('/:id', authMiddleware, ProductController.remove);

export default router;