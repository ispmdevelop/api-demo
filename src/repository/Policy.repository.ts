import { Policy } from '../types/Policy';

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
  getById(id: string): Policy | undefined {
    return policies.find((policy) => policy.policyId === id);
  }
  create(policy: Policy): number {
    policies.push(policy);
    return policies.length;
  }
}
