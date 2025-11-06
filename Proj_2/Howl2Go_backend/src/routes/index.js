import { Router } from 'express';
import healthRouter from './health.routes.js';
import foodRouter from './food.routes.js';
import userRouter from './user.routes.js';
import cartRouter from './cart.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/food', foodRouter);
router.use('/users', userRouter);
router.use('/cart', cartRouter);

export default router;
