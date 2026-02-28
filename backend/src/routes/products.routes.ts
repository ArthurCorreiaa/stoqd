import { Router } from 'express';
import * as ProductController from '../controllers/products.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', ProductController.getAll);
router.post('/', authMiddleware, ProductController.create);
router.delete('/:id', authMiddleware, ProductController.remove);

export default router;