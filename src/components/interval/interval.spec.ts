import request from 'supertest';
import app from '../../app';
import { IntervalService } from './interval.service';
import { GetIntervalRequestDto } from './dto/getIntervalDto';

import { validInput1 } from '../../../mock-data/interval/requests';
import { validationErrors } from '../../../mock-data/interval/errors';
import {
  getIntervalResponseData,
  getPreviousEventResponseData,
} from '../../../mock-data/interval/service';
import { EventModel } from './interval.model';
import { getEpochTime } from '../../utils/time.utils';

let validInput: Partial<GetIntervalRequestDto>;

const spyOnServicesMethod = (
  getIntervalResponse: EventModel[],
  previousEventBeforeDateResponse: EventModel | undefined
) => {
  jest
    .spyOn(IntervalService.prototype, 'getInterval2')
    .mockImplementation(
      async (vehicleId: string, startDate: string, endDate: string) =>
        getIntervalResponse
    );
  jest
    .spyOn(IntervalService.prototype, 'previousEventBeforeDate')
    .mockImplementation(
      async (vehicleId: string, date: string) => previousEventBeforeDateResponse
    );
};

describe('Interval Component', () => {
  beforeAll(() => {
    spyOnServicesMethod(
      getIntervalResponseData.emptyArray,
      getPreviousEventResponseData.valid
    );
  });
  beforeEach(() => {
    validInput = { ...validInput1 };
  });
  describe('when use does not submit valid input values', () => {
    describe('when user does not submit startDate', () => {
      it('should return 400 status code and required starDate error', async () => {
        delete validInput.startDate;
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(400);
        const errors: string[] = response.body.errors;
        expect(
          errors.includes(validationErrors.requiredStartDateError)
        ).toBeTruthy();
      });
    });

    describe('when user does not submit endDate', () => {
      it('should return 400 status code and required endDate error', async () => {
        delete validInput.endDate;
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(400);
        const errors: string[] = response.body.errors;
        expect(
          errors.includes(validationErrors.requiredEndDateError)
        ).toBeTruthy();
      });
    });

    describe('when user does not submit vehicleId', () => {
      it('should return 400 status code and required vehicleId error', async () => {
        delete validInput.vehicleId;
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(400);
        const errors: string[] = response.body.errors;
        expect(
          errors.includes(validationErrors.requiredVehicleIdError)
        ).toBeTruthy();
      });
    });

    describe('when startDate is greater than endDate', () => {
      it('should return 400 status code and startDate greater than endDate validation error', async () => {
        validInput.startDate = '2023-12-13 23:20:03.000';
        validInput.endDate = '2023-12-13 23:19:01.000';
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(400);
        const errors = response.body.errors;
        expect(
          errors.includes(validationErrors.startDateGreaterThanEndDate)
        ).toBeTruthy();
      });
    });

    describe('when startDate is not in UTC format', () => {
      it('should return 400 status code and startDate must match format error', async () => {
        validInput.startDate = '2023-12-13';
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(400);
        const errors = response.body.errors;
        expect(
          errors.includes(validationErrors.startDateMustMatchFormat)
        ).toBeTruthy();
      });
    });

    describe('when endDate is not in UTC format', () => {
      it('should return 400 status code and endDate must match format error', async () => {
        validInput.endDate = '2023-12-13';
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(400);
        const errors = response.body.errors;
        expect(
          errors.includes(validationErrors.endDateMustMatchFormat)
        ).toBeTruthy();
      });
    });
  });

  describe('when user submitted valid input values', () => {
    describe('when there are no events in the interval', () => {
      beforeAll(() => {
        spyOnServicesMethod(
          getIntervalResponseData.emptyArray,
          getPreviousEventResponseData.valid
        );
      });
      it('it should return one interval with the event value of the previous event with start and end date same as input', async () => {
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(200);
        const interval = response.body.data;
        expect(interval.length).toBe(1);
        expect(interval[0]).toEqual({
          event: getPreviousEventResponseData.valid.event,
          from: getEpochTime(validInput.startDate),
          to: getEpochTime(validInput.endDate),
        });
      });
    });

    describe('when there is only one event within the interval', () => {
      beforeAll(() => {
        spyOnServicesMethod(
          getIntervalResponseData.oneEvent,
          getPreviousEventResponseData.valid
        );
      });
      it('it should return two intervals 1st the previous event, 2nd the event retrieved', async () => {
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(200);
        const interval = response.body.data;
        expect(interval.length).toBe(2);
        expect(interval[0].event).toBe(
          getPreviousEventResponseData.valid.event
        );
        expect(interval[1].event).toBe(
          getIntervalResponseData.oneEvent[0].event
        );
      });
    });

    describe('when all events inside the interval have the same type', () => {
      beforeAll(() => {
        spyOnServicesMethod(
          getIntervalResponseData.sameTypeEvents,
          getPreviousEventResponseData.valid
        );
      });

      it('it should return two intervals 1st the previous event, 2nd one event representing the continuos same type events', async () => {
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(200);
        const interval = response.body.data;
        expect(interval.length).toBe(2);
        expect(interval[0].event).toBe(
          getPreviousEventResponseData.valid.event
        );
        expect(interval[1].event).toBe(
          getIntervalResponseData.sameTypeEvents[0].event
        );
        expect(interval[1].from).toBe(
          getEpochTime(getIntervalResponseData.sameTypeEvents[0].timestamp)
        );
      });
    });

    describe('when there are not logged events before the startDate', () => {
      beforeAll(() => {
        spyOnServicesMethod(
          getIntervalResponseData.emptyArray,
          getPreviousEventResponseData.valid
        );
      });
      it('it should return the previous event with from and to date equals as startDate and endDate from input', async () => {
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(200);
        const interval = response.body.data;
        expect(interval.length).toBe(1);
        expect(interval[0].event).toBe(
          getPreviousEventResponseData.valid.event
        );
        expect(interval[0].from).toBe(getEpochTime(validInput.startDate));
        expect(interval[0].to).toBe(getEpochTime(validInput.endDate));
      });
    });
    describe('when fist event timestamp is equal to startDate', () => {
      beforeAll(() => {
        spyOnServicesMethod(
          getIntervalResponseData.oneEvent,
          getPreviousEventResponseData.valid
        );
      });
      it('it should return the previous event with from and to date equals as startDate, and second interval must also begin with the startDate', async () => {
        validInput.startDate = getIntervalResponseData.oneEvent[0].timestamp;
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(200);
        const interval = response.body.data;
        expect(interval.length).toBeGreaterThanOrEqual(2);
        expect(interval[0].event).toBe(
          getPreviousEventResponseData.valid.event
        );
        expect(interval[0].from).toBe(getEpochTime(validInput.startDate));
        expect(interval[0].to).toBe(getEpochTime(validInput.startDate));
        expect(interval[1].from).toBe(getEpochTime(validInput.startDate));
      });
    });
    describe('when last event timestamp is equal to endDate', () => {
      beforeAll(() => {
        spyOnServicesMethod(
          getIntervalResponseData.sameTypeEvents,
          getPreviousEventResponseData.valid
        );
      });
      it('it should return the array of intervals with the last interval "to" field equal to the endDate from the input', async () => {
        validInput.startDate = '2010-12-13 00:02:00.000';
        validInput.endDate =
          getIntervalResponseData.sameTypeEvents[
            getIntervalResponseData.sameTypeEvents.length - 1
          ].timestamp;
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(200);
        const interval = response.body.data;
        const responseLength = interval.length;
        expect(interval.length).toBeGreaterThanOrEqual(1);
        expect(interval[responseLength - 1].to).toBe(
          getEpochTime(validInput.endDate)
        );
      });
    });
    describe('when there is not previous event', () => {
      beforeAll(() => {
        spyOnServicesMethod(
          getIntervalResponseData.sameTypeEvents,
          getPreviousEventResponseData.notDefinedValue
        );
      });
      it('it should return the array of intervals with the first interval event value equals to "no_data"', async () => {
        const response = await request(app).get('/interval').query(validInput);
        expect(response.status).toBe(200);
        const interval = response.body.data;
        const responseLength = interval.length;
        expect(interval.length).toBeGreaterThanOrEqual(1);
        expect(interval[0].event).toBe('no_data');
      });
    });
  });
});
