import express, { Application } from 'express';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import swaggerJson from './swagger.json';
import { router } from './routes';

const app: Application = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(router);

app.use(
  ['/openapi', '/docs', '/swagger'],
  swaggerUI.serve,
  swaggerUI.setup(swaggerJson)
);

export default app;
