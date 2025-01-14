import { google, iam_v1 } from 'googleapis';
import fs from 'fs';
import { generateUUID } from '../ai/graphs/utils/uuid';

export type GCPRolePayload = {
  roleId?: string;
  title: string;
  includedPermissions: string[];
  stage: string;
};

const GCP_KEY_FILE_PATH = process.env.GCP_KEY_FILE_PATH || '';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || '';

export class GCPPolicyService {
  constructor() {}
  async getResourceManager() {
    const credentials = JSON.parse(fs.readFileSync(GCP_KEY_FILE_PATH, 'utf-8'));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    // Acquire an auth client
    const authClient = (await auth.getClient()) as any;

    if (!authClient) {
      throw new Error('Failed to acquire auth client');
    }

    // Optionally set this as the default auth client for future calls
    google.options({ auth: authClient });

    return google;
  }

  async getPolicy(id: string) {
    const idComponent = id.split('roles/');
    const role =
      idComponent.length > 1 ? `roles/${idComponent[1]}` : idComponent[1];

    const resourceManager = await this.getResourceManager();
    const policyResponse = await resourceManager.projects.getIamPolicy({
      resource: `projects/${GCP_PROJECT_ID}`,
    });

    const bindings = policyResponse.data.bindings || [];
    const selectedRole = bindings.find((binding: any) => {
      return binding.role === role || binding.role === id;
    });

    return selectedRole;
  }

  async getRole(roleId: string) {
    const googleAuth = await this.getResourceManager();
    const iam = googleAuth.iam('v1');
    const getRoleResponse = await iam.projects.roles.get({
      name: roleId,
    });
    return getRoleResponse.data;
  }

  async writeRole(policy: GCPRolePayload) {
    const googleAuth = await this.getResourceManager();
    const iam = googleAuth.iam('v1');

    const requestBody: iam_v1.Schema$CreateRoleRequest = {
      roleId: `${policy.roleId || generateUUID(8)}`,
      role: {
        title: policy.title,
        includedPermissions: policy.includedPermissions,
        stage: policy.stage,
      },
    };

    console.log('payload:', requestBody);

    const res = await iam.projects.roles.create({
      parent: `projects/${GCP_PROJECT_ID}`,
      requestBody: requestBody,
    });

    console.log('created role:', res);

    return res.data;
  }
}
