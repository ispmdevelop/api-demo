import { Pool } from 'pg';
import { EventModel } from './interval.model';

export class IntervalService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DB_CONNECTION_STRING,
      ssl: true,
    });
  }

  async getInterval(vehicleId: string, startDate: string, endDate: string) {
    const result = await this.pool.query(
      `SELECT * FROM "api-demo".vehicle_event
        where vehicle_id = $1 
          and "timestamp" between $2 and $3
        order by "timestamp";`,
      [vehicleId, startDate, endDate]
    );
    return result.rows as EventModel[];
  }

  async getInterval2(vehicleId: string, startDate: string, endDate: string) {
    const result = await this.pool.query(
      `SELECT 
        MIN(id) as id,
        MIN(timestamp) as timestamp,
        vehicle_id,
        event
      FROM (
        SELECT 
          id,
          timestamp,
          vehicle_id,
          event,
          ROW_NUMBER() OVER (ORDER BY timestamp) - ROW_NUMBER() OVER (PARTITION BY event ORDER BY timestamp) as grp
        FROM "api-demo".vehicle_event 
          where vehicle_id = $1 
            and "timestamp" between $2 and $3
    ) t
    GROUP BY vehicle_id, event, grp
    order by timestamp;`,
      [vehicleId, startDate, endDate]
    );
    return result.rows as EventModel[];
  }

  async previousEventBeforeDate(vehicleId: string, date: string) {
    const result = await this.pool.query(
      `SELECT * FROM "api-demo".vehicle_event
        where vehicle_id = $1 
          and "timestamp" < $2
        order by "timestamp" desc 
        limit 1`,
      [vehicleId, date]
    );
    return result.rows[0] as EventModel;
  }
}
