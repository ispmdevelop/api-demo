import { IntervalModel } from '../interval.model';

export interface GetIntervalRequestDto {
  startDate: string;
  endDate: string;
  vehicleId: string;
}

export type GetIntervalResponseDto = IntervalModel[];
