import { Controller, Route, Get, SuccessResponse, Query, Response } from 'tsoa';
import { GetIntervalResponseDto } from './dto/getIntervalDto';
import { IntervalService } from './interval.service';
import { IntervalModel } from './interval.model';

const intervalService = new IntervalService();

@Route('interval')
export class IntervalController extends Controller {
  @Get('/')
  @SuccessResponse('200', 'OK')
  @Response('400', 'Bad Request')
  async getInterval(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('vehicleId') vehicleId: string
  ): Promise<GetIntervalResponseDto> {
    const [previousEvent, events] = await Promise.all([
      intervalService.previousEventBeforeDate(vehicleId, startDate),
      intervalService.getInterval2(vehicleId, startDate, endDate),
    ]);

    const formattedEvents: IntervalModel[] = [];

    // Set data for the first interval
    let currentEvent = previousEvent?.event || 'no_data';
    let currentEventStart = new Date(startDate + 'Z').getTime();

    //Iterate over all events and create intervals when event is different at the current one
    for (const event of events) {
      if (event.event !== currentEvent) {
        formattedEvents.push({
          event: currentEvent,
          from: currentEventStart,
          to: new Date(event.timestamp + 'Z').getTime(),
        });
        currentEvent = event.event;
        currentEventStart = new Date(event.timestamp + 'Z').getTime();
      }
    }

    //Add last interval
    formattedEvents.push({
      event: currentEvent,
      from: currentEventStart,
      to: new Date(endDate + 'Z').getTime(),
    });

    return formattedEvents;
  }
}
