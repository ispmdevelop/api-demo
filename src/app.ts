import express, { Application, NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import swaggerJson from './swagger.json';
import { router } from './routes';
import { createErrorResponse } from './http/response';

const app: Application = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(router);

app.use(
  ['/openapi', '/docs', '/swagger'],
  swaggerUI.serve,
  swaggerUI.setup(swaggerJson)
);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  return res.json(createErrorResponse(500, 'Internal Server Error', {}));
});

export default app;
