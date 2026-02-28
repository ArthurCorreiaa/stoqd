import { Router } from 'express';
import * as InstallmentController from '../controllers/installments.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(authMiddleware);

router.patch('/:id/pay', InstallmentController.pay);

export default router;