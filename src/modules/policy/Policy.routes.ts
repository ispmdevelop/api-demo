import { Router } from 'express';
import { PolicyController } from './Policy.controller';
const policyController = new PolicyController();
const router = Router();

router.post('/model/completion', async (req, res) => {
  return policyController.conversion(req, res);
});

router.get('/fetch_policy', async (req, res) => {
  return policyController.get(req, res);
});

router.post('/deliver_policy', async (req, res) => {
  return policyController.create(req, res);
});

router.post('/:cloudType/deliver_policy', async (req, res) => {
  return policyController.create(req, res);
});

export default router;
