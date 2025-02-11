import {
  IAMClient,
  GetPolicyVersionCommand,
  GetPolicyVersionCommandInput,
  CreatePolicyCommand,
  CreatePolicyCommandInput,
} from '@aws-sdk/client-iam'; // ES Modules import
import { generateUUID } from '../ai/graphs/utils/uuid';



export type AWSPolicyPayload = {
  PolicyName?: string;
  PolicyDocument: PolicyDocument;
};
export type PolicyDocument = {
  Version: string;
  Statement: PolicyStatement[];
};
export type PolicyStatement = {
  Effect: string;
  Action: string[];
  Resource: string[];
};
const client = new IAMClient({ region: 'us-east-1' });

export class AWSPolicyService {
  static async getPolicy(arnId: string) {
    const input: GetPolicyVersionCommandInput = {
      // GetPolicyRequest
      PolicyArn: arnId,
      VersionId: 'v1',
    };
    const command = new GetPolicyVersionCommand(input);
    const response = await client.send(command);
    console.log(response);
    const { PolicyVersion } = response;
    const document = PolicyVersion?.Document || '';
    const decoded = decodeURIComponent(document);
    console.log('decoded:', decoded);
    return decoded;
  }

  static async writePolicy(policy: AWSPolicyPayload) {
    const writerClient = new IAMClient({
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.TARGET_ACCESS_KEY || '',
        secretAccessKey: process.env.TARGET_SECRET_KEY || '',
      },
    });

    const input: CreatePolicyCommandInput = {
      PolicyName: policy.PolicyName || `nameless-policy-${generateUUID(8)}`,
      PolicyDocument: JSON.stringify(policy.PolicyDocument), // required
    };

    console.log(JSON.stringify(input, null, 2));

    const command = new CreatePolicyCommand(input);
    const response = await writerClient.send(command);
    console.log(response);
    return response;
  }
}
