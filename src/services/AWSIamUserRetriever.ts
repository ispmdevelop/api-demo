import {
  IAMClient,
  ListAttachedUserPoliciesCommand,
} from "@aws-sdk/client-iam";

export class AWSIamUserRetriever {
  client: IAMClient;

  constructor() {
    this.client = new IAMClient({ region: "us-east-1" });
  }

  #getUserNameFromArn(userArn: string) {
    const parts = userArn.split("/");
    return parts[parts.length - 1];
  }

  async getUserByArn(userArn: string) {
    const userName = this.#getUserNameFromArn(userArn);
    const attachedPoliciesResp = await this.client.send(
      new ListAttachedUserPoliciesCommand({ UserName: userName }),
    );
    const attachedPolicies = attachedPoliciesResp.AttachedPolicies || [];
    return attachedPolicies;
  }
}
