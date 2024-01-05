import { intervalRouter } from './components/interval/interval.routes';
import { healthRouter } from './components/health/health.routes';
import { Router } from 'express';

const router = Router();

router.use('/interval', intervalRouter);
router.use('/health', healthRouter);

export { router };
