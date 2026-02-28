import { Router } from 'express';
import * as BrandController from '../controllers/brands.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/', BrandController.getAll);
router.post('/', authMiddleware, BrandController.create);
router.put('/:id', BrandController.update);     
router.delete('/:id', BrandController.remove);

export default router;