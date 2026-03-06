import { Router } from 'express';
import * as SalesController from '../controllers/sales.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/', SalesController.getRecent); 
router.post('/', SalesController.create);   

export default router;