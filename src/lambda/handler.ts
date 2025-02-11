'use strict';
import dotenv from 'dotenv';
dotenv.config();
import express, { NextFunction, Request, Response } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { NetworkResponse } from '../classes/NetworkResponse';
import PolicyRouter from '../modules/policy/Policy.routes';
import BudgetAlertRouter from '../modules/BudgetAlertActionTaker/routes';
import { BudgetTracker } from '../modules/BudgetAlertActionTaker/BudgetTracker';
import { AWSBudgetRetriever } from '../services/AWSBudgetRetriever';
import path from 'node:path';
const awsBudgetRetriever = new AWSBudgetRetriever();
const budgetTracker = new BudgetTracker(awsBudgetRetriever);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders:
      'Authorization,Content-Type,X-Amz-Date,X-Amz-Security-Token,X-Api-Key',
    methods: 'OPTIONS,HEAD,GET,POST,PUT,PATCH,DELETE',

    maxAge: 7200,
  })
);

app.use(PolicyRouter);
app.use(BudgetAlertRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  return res
    .status(500)
    .json(NetworkResponse.CreateErrorResponse('Server Error', 500));
});

app.use(express.static(path.join(__dirname, '../public')));

if (process.env.LOCAL_SERVER_LISTENING === 'true') {
  const port = process.env.PORT || 3000;
  budgetTracker.activeBudgetListener(5 * 60000);
  app.listen(port, async () => {
    console.log(`Server is listening on port ${port}.`);
  });
} else {
  exports.handler = serverless(app);
}
