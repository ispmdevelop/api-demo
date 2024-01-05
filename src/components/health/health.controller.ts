import { Controller, Route, Get, SuccessResponse, Tags } from 'tsoa';
import { IResponse, createSuccessResponse } from '../../http/response';

@Tags('Health')
@Route('health')
export class HealthController extends Controller {
  @Get('/')
  getHealth(): IResponse<{}> {
    return createSuccessResponse(200, 'Ok', {});
  }
}
