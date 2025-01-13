import { Client, ClientOptions } from '@microsoft/microsoft-graph-client';
import { decode } from 'jsonwebtoken';
import { ClientSecretCredential } from '@azure/identity';

const SCOPES = ['Policy.ReadWrite.ConditionalAccess', 'Policy.Read.All'];

export class AzurePolicyWriter {
  constructor() {}

  async getGraphAccessToken() {
    const clientId = process.env['AZURE_CLIENT_ID'] || '';
    const clientSecret = process.env['AZURE_CLIENT_SECRET'] || '';
    const tenantId = process.env['AZURE_TENANT_ID'] || '';

    // Create the credential using the client secret
    const credential = new ClientSecretCredential(
      tenantId,
      clientId,
      clientSecret
    );

    // Request the .default scope for Microsoft Graph
    // const tokenScope = 'https://graph.microsoft.com/.default';
    const totalScopes = [...SCOPES];
    console.log('Requesting token for scope:', totalScopes);
    const tokenResponse = await credential.getToken(totalScopes.join(' '));
    const token = tokenResponse.token;
    try {
      const decodedToken = decode(token);
      console.log('Decoded token:', decodedToken);
    } catch (e) {
      console.log('Error decoding token:', e);
    }
    return token;
  }

  async createConditionalAccessPolicy(policy: any) {
    const accessToken = await this.getGraphAccessToken();

    // Initialize the Graph client
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    try {
      // Note: Conditional Access APIs might be under the beta endpoint:
      const createdPolicy = await client
        .api('/identity/conditionalAccess/policies')
        .version('beta')
        .post(policy);

      console.log('Successfully created policy:');
      console.log(JSON.stringify(createdPolicy, null, 2));
      return createdPolicy;
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  }
}
