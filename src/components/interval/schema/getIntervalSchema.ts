import { JSONSchemaType } from 'ajv';
import { GetIntervalRequestDto } from '../dto/getIntervalDto';
import { createAjvDataValidationMiddleware } from '../../../middlewares/dataValidation';

export const getIntervalSchema: JSONSchemaType<GetIntervalRequestDto> = {
  type: 'object',
  properties: {
    startDate: {
      type: 'string',
      format: 'date-time',
    },
    endDate: {
      type: 'string',
      format: 'date-time',
    },
    vehicleId: {
      type: 'string',
      format: 'int64',
    },
  },
  required: ['startDate', 'endDate', 'vehicleId'],
  additionalProperties: false,
  $defs: {
    'start-date-is-before-end-date': { type: 'boolean' },
  },
  'start-date-is-before-end-date': true,
};

export const getIntervalValidation = createAjvDataValidationMiddleware(
  getIntervalSchema as any,
  'query'
);
