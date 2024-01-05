import { Router, Request, Response } from 'express';
import { createSuccessResponse } from '../../http/response';
import { HealthController } from './health.controller';
const healthController = new HealthController();

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const data = healthController.getHealth();
  return res.json(data);
});

export { router as healthRouter };
