import { Router } from 'express';
import healthRouter from './health.routes.js';
import foodRouter from './food.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/food', foodRouter);

export default router;
