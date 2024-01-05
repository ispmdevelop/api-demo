import { Router, Request, Response } from 'express';
import { IntervalController } from './interval.controller';
import { createSuccessResponse } from '../../http/response';
import { getIntervalValidation } from './schema/getIntervalSchema';
const intervalController = new IntervalController();

const router = Router();

router.get('/', getIntervalValidation, async (req: Request, res: Response) => {
  const data = await intervalController.getInterval(
    req.query.startDate as any,
    req.query.endDate as any,
    req.query.vehicleId as any
  );
  return res.json(data);
});

export { router as intervalRouter };
