import { Policy } from '../types/Policy';
import { PolicyRetriever } from '../services/PolicyRetriver';

const policies: Policy[] = [
  {
    policyId: '12345',
    name: 'Restrict Public S3 Buckets',
    description: 'Ensure no S3 buckets are publicly accessible.',
    conditions: [
      { attribute: 'public_access', condition: 'equals', value: 'true' },
    ],
    actions: ['alert', 'remediate'],
    resources: ['arn:aws:s3:::example-bucket'],
    severity: 'high',
    policyType: 'config',
    complianceMetadata: ['SOC 2', 'ISO 27001'],
  },
  {
    policyId: '123456',
    name: 'Ensure EC2 Instances Are Encrypted',
    description: 'Verify that all EC2 instances have encrypted root volumes.',
    conditions: [
      { attribute: 'encryption_status', condition: 'equals', value: 'false' },
    ],
    actions: ['alert', 'escalate'],
    resources: ['arn:aws:ec2:::instance/*'],
    severity: 'critical',
    policyType: 'compliance',
    complianceMetadata: ['PCI DSS', 'NIST 800-53'],
  },
  {
    policyId: 'TGT-001',
    name: 'Existing Restricted Access Policy',
    description: 'Already restricts access to certain cloud resources.',
    conditions: [
      { attribute: 'resource_public', condition: 'equals', value: 'false' },
    ],
    actions: ['deny'],
    resources: ['arn:aws:s3:::another-bucket'],
    severity: 'medium',
    policyType: 'config',
    complianceMetadata: ['SOC 2'],
  },
];

export class PolicyRepository {
  async getById(id: string) {
    try {
      return await PolicyRetriever.getPolicy(id);
    } catch (err) {
      console.log('err policy get by Id: ', err);
      return { error: 'Policy not found' };
    }
  }
  create(policy: Policy): number {
    policies.push(policy);
    return policies.length;
  }
}
