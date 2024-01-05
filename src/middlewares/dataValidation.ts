import { JSONSchemaType } from 'ajv';
import { NextFunction, Request, Response } from 'express';
import { createErrorResponse } from '../http/response';
import { ajv } from './ajv.config';

export const createAjvDataValidationMiddleware = (
  schema: JSONSchemaType<any>,
  path: string = 'body'
) => {
  const validate = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate((req as any)[path] || {});

    if (!valid) {
      console.log(validate.errors);
      const errors = validate.errors?.map((error) => {
        let message = error.message;
        if (error.instancePath) {
          message = `${error.instancePath.replace(/\//g, '')} ${message}`;
        }
        return message;
      });
      res.status(400).json(createErrorResponse(400, 'Bad Request', errors));
      next(errors);
    }

    next();
  };
};
