import Ajv, { JSONSchemaType, KeywordDefinition } from 'ajv';
import addFormats from 'ajv-formats';

export const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

ajv.addKeyword('start-date-is-before-end-date', {
  validate(_schema: any, data: any) {
    return (
      new Date(data.startDate).getTime() < new Date(data.endDate).getTime()
    );
  },
  message: 'Start date must be before end date',
  errors: false,
} as any);
