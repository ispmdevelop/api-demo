import { Policy } from '../types/Policy';
import { AWSPolicyService } from '../services/PolicyRetriver';
import { AzurePolicyWriter } from '../services/AzurePolicyWriter';

const azurePolicyWriter = new AzurePolicyWriter();

export class PolicyRepository {
  async getById(id: string) {
    try {
      return await AWSPolicyService.getPolicy(id);
    } catch (err) {
      console.log('err policy get by Id: ', err);
      return { error: 'Policy not found' };
    }
  }
  async create(policy: any) {
    const res = await AWSPolicyService.writePolicy(policy);
    return res;
  }
}
