import { Policy } from '../types/Policy';
import { AWSPolicyService } from '../services/AWSPolicyService';
import { GCPPolicyService } from '../services/GCPPolicyService';

const gcpPolicyService = new GCPPolicyService();

enum CloudType {
  GCP = 'gcp',
  AWS = 'aws',
}

export class PolicyRepository {
  async getById(id: string) {
    try {
      let res;
      try {
        res = await gcpPolicyService.getRole(id);
      } catch (e) {
        console.log('error trying to get policy from gcp');
      }
      if (!res) {
        console.log('trying with aws')
        res = await AWSPolicyService.getPolicy(id);
      }
      return res;
    } catch (err) {
      console.log('err policy get by Id: ', err);
      return { error: 'Policy not found' };
    }
  }
  async create(policy: any, type: string = CloudType.AWS) {
    if (type == CloudType.GCP) {
      return await gcpPolicyService.writeRole(policy);
    } else if (type == CloudType.AWS) {
      return await AWSPolicyService.writePolicy(policy);
    } else {
      return { error: 'Invalid cloud type' };
    }
  }
}
