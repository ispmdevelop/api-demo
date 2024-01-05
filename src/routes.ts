import { intervalRouter } from './components/interval/interval.routes';
import { Router } from 'express';

const router = Router();

router.use('/interval', intervalRouter);

export { router };
