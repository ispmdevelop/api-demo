import { Router } from 'express';
import { AWSCloudTrailRetriever } from '../../services/AWSCloudTrailRetriever';
import { AWSIamUserRetriever } from '../../services/AWSIamUserRetriever';
import { GCPRoleBindingBlocker } from '../../services/GCPBRoleBindingBlocker';
import { UserCreationTracker } from './UserCreationTracker';
const awsCloudTrailRetriever = new AWSCloudTrailRetriever();
const awsIamUserRetriever = new AWSIamUserRetriever();
const gcpRoleBindingBlocker = new GCPRoleBindingBlocker();
const userCreationTracker = new UserCreationTracker(
  awsCloudTrailRetriever,
  awsIamUserRetriever,
  gcpRoleBindingBlocker
);

const router = Router();

router.get('/user-tracker/event-history', async (req, res) => {
  return res.json({ eventHistory: userCreationTracker.eventHistory });
});

router.get('/user-tracker/active-block', async (req, res) => {
  return res.json({ blocks: gcpRoleBindingBlocker.bindingsBlockedByEventId });
});

router.get('/user-tracker/events-processed', async (req, res) => {
  return res.json({ events: Array.from(userCreationTracker.eventIdProcessed) });
});

router.post('/user-tracker/scan-now', async (req, res) => {
  const processRes: any = await userCreationTracker.process();
  return res.json({
    message: 'AWS scanning completed',
  });
});

export default router;
