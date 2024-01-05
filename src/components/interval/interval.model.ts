export interface IntervalModel {
  event: string;
  from: number;
  to: number;
}

export interface EventModel {
  id: string;
  timestamp: string;
  vehicleId: string;
  event: string;
}
