import {
  IAMClient,
  GetPolicyVersionCommand,
  GetPolicyVersionCommandInput,
} from '@aws-sdk/client-iam'; // ES Modules import

const client = new IAMClient({ region: 'us-east-1' });

export class PolicyRetriever {
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
}
