import { Router } from 'express';
import * as SalesController from '../controllers/sales.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', SalesController.getRecent); 
router.post('/', SalesController.create);   

export default router;