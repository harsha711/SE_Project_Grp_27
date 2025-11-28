import { Router } from 'express';
import healthRouter from './health.routes.js';
import foodRouter from './food.routes.js';
import userRouter from './user.routes.js';
import cartRouter from './cart.routes.js';
import orderRouter from './order.routes.js';
import reviewRouter from './review.routes.js';
import bugRouter from './bug.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/food', foodRouter);
router.use('/users', userRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/reviews', reviewRouter);
router.use('/bugs', bugRouter);

export default router;
