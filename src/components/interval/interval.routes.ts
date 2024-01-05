import { Router, Request, Response, NextFunction } from 'express';
import { IntervalController } from './interval.controller';
import { createSuccessResponse } from '../../http/response';
import { getIntervalValidation } from './schema/getIntervalSchema';
const intervalController = new IntervalController();

const router = Router();

router.get(
  '/',
  getIntervalValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await intervalController.getInterval(
        req.query.startDate as any,
        req.query.endDate as any,
        req.query.vehicleId as any
      );
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
);

export { router as intervalRouter };
