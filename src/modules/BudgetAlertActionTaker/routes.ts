import { Router } from 'express';
import { AWSBudgetRetriever } from '../../services/AWSBudgetRetriever';
import { GCPApiBlockerService } from '../../services/GCPApiBlockerService';
import { BudgetTracker } from './BudgetTracker';
const awsBudgetRetriever = new AWSBudgetRetriever();
const gcpApiBlockerService = new GCPApiBlockerService();
const budgetTracker = new BudgetTracker(awsBudgetRetriever);

const router = Router();

router.get('/budget-tracker/notifications', async (req, res) => {
  return res.json({ notificationHistory: budgetTracker.notificationHistory });
});

router.get('/budget-tracker/alarm-status', async (req, res) => {
  return res.json({ isActive: budgetTracker.isBudgetAlarmActive });
});

router.post('/budget-tracker/scan-now', async (req, res) => {
  const processRes: any = await budgetTracker.processBudgetNotifications();
  console.log('process:res', processRes);
  const messages =
    processRes?.messages?.map((message: any) => message?.content) || [];
  return res.json({
    message: 'AWS scanning completed',
    data: messages.filter((x: any) => x),
  });
});

router.get('/budget-tracker/service-status', async (req, res) => {
  const serviceName = (req.query.serviceName as string) || 'run.googleapis.com';
  const serviceStatus = await gcpApiBlockerService.getServiceStatus(
    serviceName
  );
  const data = serviceStatus.data;
  return res.json({ state: data.state, data });
});

router.post('/budget-tracker/disable-service', async (req, res) => {
  const serviceName = (req.query.serviceName as string) || 'run.googleapis.com';
  await gcpApiBlockerService.disableService(serviceName);
  return res.json({ message: `${serviceName} disabled` });
});

router.post('/budget-tracker/enable-service', async (req, res) => {
  const serviceName = (req.query.serviceName as string) || 'run.googleapis.com';
  await gcpApiBlockerService.enableService(serviceName);
  return res.json({ message: `${serviceName} enabled` });
});

export default router;
