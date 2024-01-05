import {
  Controller,
  Route,
  Get,
  SuccessResponse,
  Query,
  Response,
  Tags,
} from 'tsoa';
import { GetIntervalResponseDto } from './dto/getIntervalDto';
import { IntervalService } from './interval.service';
import { IntervalModel } from './interval.model';
import { IResponse, createSuccessResponse } from '../../http/response';
import { getEpochTime } from '../../utils/time.utils';

const intervalService = new IntervalService();
@Tags('Interval')
@Route('interval')
export class IntervalController extends Controller {
  @Get('/')
  @SuccessResponse('200', 'Ok')
  @Response('400', 'Bad Request')
  async getInterval(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('vehicleId') vehicleId: string
  ): Promise<IResponse<GetIntervalResponseDto>> {
    const [previousEvent, events] = await Promise.all([
      intervalService.previousEventBeforeDate(vehicleId, startDate),
      intervalService.getInterval2(vehicleId, startDate, endDate),
    ]);

    const formattedEvents: IntervalModel[] = [];

    // Set data for the first interval
    let currentEvent = previousEvent?.event || 'no_data';
    let currentEventStart = getEpochTime(startDate);

    //Iterate over all events and create intervals when event is different at the current one
    for (const event of events) {
      if (event.event !== currentEvent) {
        formattedEvents.push({
          event: currentEvent,
          from: currentEventStart,
          to: getEpochTime(event.timestamp),
        });
        currentEvent = event.event;
        currentEventStart = getEpochTime(event.timestamp);
      }
    }

    //Add last interval
    formattedEvents.push({
      event: currentEvent,
      from: currentEventStart,
      to: getEpochTime(endDate),
    });

    return createSuccessResponse(200, 'Ok', formattedEvents);
  }
}
