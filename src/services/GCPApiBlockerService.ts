import { google } from 'googleapis';
import fs from 'fs';

export type GCPRolePayload = {
  roleId?: string;
  title: string;
  includedPermissions: string[];
  stage: string;
};

const GCP_KEY_FILE_PATH = process.env.GCP_KEY_FILE_PATH || '';
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || '';

export class GCPApiBlockerService {
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

  async disableService(serviceName = 'run.googleapis.com') {
    console.log('disabling service');
    const googleAuth = await this.getResourceManager();
    const serviceUsage = googleAuth.serviceusage({ version: 'v1' });
    const disableServiceResponse = await serviceUsage.services.disable({
      name: `projects/${GCP_PROJECT_ID}/services/${serviceName}`,
    });
    return disableServiceResponse;
  }

  async enableService(serviceName = 'run.googleapis.com') {
    console.log('enabling service');
    const googleAuth = await this.getResourceManager();
    const serviceUsage = googleAuth.serviceusage({ version: 'v1' });
    const enableServiceResponse = await serviceUsage.services.enable({
      name: `projects/${GCP_PROJECT_ID}/services/${serviceName}`,
    });
    return enableServiceResponse;
  }

  async getServiceStatus(serviceName = 'run.googleapis.com') {
    const googleAuth = await this.getResourceManager();
    const serviceUsage = googleAuth.serviceusage({ version: 'v1' });
    const serviceStatusResponse = await serviceUsage.services.get({
      name: `projects/${GCP_PROJECT_ID}/services/${serviceName}`,
    });
    return serviceStatusResponse;
  }
}
