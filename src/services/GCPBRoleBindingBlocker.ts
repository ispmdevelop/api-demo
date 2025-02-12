import { google } from "googleapis";
import fs from "fs";

const GCP_KEY_FILE_PATH = process.env.GCP_KEY_FILE_PATH || "";
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || "";

const GCP_SA_ID = process.env.GCP_SA_IDENTIFIER || "";
const GCP_USER_ID = process.env.GCP_USER_IDENTIFIER || "";

const ROOT_USERS = [GCP_SA_ID, GCP_USER_ID];

const PERMISSIONS_TO_BLOCK = [
  "iam.roles.create",
  "iam.roles.update",
  "iam.roles.delete",
  "iam.roles.undelete",
  "iam.serviceAccounts.create",
  "iam.serviceAccounts.update",
  "iam.serviceAccounts.delete",
  "iam.serviceAccountKeys.create",
  "resourcemanager.projects.setIamPolicy",
  "resourcemanager.folders.setIamPolicy",
  "resourcemanager.organizations.setIamPolicy",
  "iam.serviceAccounts.setIamPolicy",
];

export class GCPRoleBindingBlocker {
  static instance: GCPRoleBindingBlocker;
  bindingsBlockedByEventId: { [key: string]: any } = {};

  constructor() {
    if (GCPRoleBindingBlocker.instance) {
      return GCPRoleBindingBlocker.instance;
    }
    GCPRoleBindingBlocker.instance = this;
  }
  async getResourceManager() {
    const credentials = JSON.parse(fs.readFileSync(GCP_KEY_FILE_PATH, "utf-8"));

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    // Acquire an auth client
    const authClient = (await auth.getClient()) as any;

    if (!authClient) {
      throw new Error("Failed to acquire auth client");
    }

    // Optionally set this as the default auth client for future calls
    google.options({ auth: authClient });

    return google;
  }

  async blockIamBindigsWithPermissions({
    permissions,
    eventId,
  }: {
    permissions?: string[];
    eventId: string;
  }) {
    const { flaggedBindings, policy } = await this.getRolePermissionsBindings(
      permissions || PERMISSIONS_TO_BLOCK,
    );
    console.log("policy", policy);
    console.log("bindings to block", JSON.stringify(flaggedBindings, null, 2));
    console.log("Root Users:", ROOT_USERS);
    const newPolicy = JSON.parse(JSON.stringify(policy));
    const bindingsBlocked: { [role: string]: string[] } = {};

    for (const binding of flaggedBindings) {
      console.log("processing flagged binding: ", JSON.stringify(binding));
      const { role, members } = binding;
      if (!role) {
        console.log("skipping binding", binding);
        continue;
      }

      const skipMembers = members?.filter((member) =>
        ROOT_USERS.includes(member),
      );

      const deletedMembers = members?.filter(
        (member: string) => !ROOT_USERS.includes(member),
      );

      if (deletedMembers && deletedMembers?.length > 0) {
        bindingsBlocked[role] = deletedMembers || [];
      }

      const newBinding = { role: role, members: skipMembers || [] };
      const indexOfRole = newPolicy.bindings?.findIndex(
        (bind: any) => bind.role == role,
      );

      if (indexOfRole != null) {
        newPolicy.bindings[indexOfRole] = newBinding;
      }
    }

    console.log("New Policy: ", JSON.stringify(newPolicy, null, 2));
    console.log("Removed bindings: ", JSON.stringify(bindingsBlocked, null, 2));
    if (bindingsBlocked && Object.keys(bindingsBlocked).length > 0) {
      this.bindingsBlockedByEventId[eventId] = bindingsBlocked;

      await this.setIamProjectPolicy(newPolicy);
      setTimeout(() => {
        this.rollBackPolicyChangesById(eventId);
      }, 1 * 60000);
    } else {
      console.log("no changes needeed to policy");
    }
  }

  async rollBackPolicyChangesById(eventId: string) {
    console.log("executing rollbackPolicyChangesById with event Id: ", eventId);
    const changes = this.bindingsBlockedByEventId[eventId];
    if (!changes && Object.keys(changes).length > 0) {
      console.log("changes not found, rollback completed");
    }
    const google = await this.getResourceManager();
    const cloudResourceManager = google.cloudresourcemanager({ version: "v1" });
    const policyRes = await cloudResourceManager.projects.getIamPolicy({
      resource: GCP_PROJECT_ID,
    });
    const policy = policyRes.data;
    const newPolicy = JSON.parse(JSON.stringify(policy));
    const roles = Object.keys(changes);

    for (const role of roles) {
      const indexOfRole = newPolicy.bindings?.findIndex(
        (binding: any) => binding.role === role,
      );
      if (indexOfRole != null) {
        console.log("newPolicy index of role", indexOfRole);
        console.log("newPolicy bindings", newPolicy.bindings);
        const members = [
          ...(newPolicy.bindings[indexOfRole].members || []),
          ...changes[role],
        ];
        const setMembers = new Set(members);
        newPolicy.bindings[indexOfRole] = {
          role,
          members: Array.from(setMembers),
        };
      } else {
        newPolicy.bindings.push({ role, members: changes[role] });
      }
    }
    await this.setIamProjectPolicy(newPolicy);
    delete this.bindingsBlockedByEventId[eventId];
    console.log("rollback completed");
  }

  async setIamProjectPolicy(newPolicy: any) {
    const google = await this.getResourceManager();
    const cloudResourceManager = google.cloudresourcemanager({
      version: "v1",
    });
    const request = {
      resource: GCP_PROJECT_ID,
      requestBody: {
        policy: newPolicy,
      },
    };
    const response = await cloudResourceManager.projects.setIamPolicy(request);
    console.log("Updated IAM Policy", JSON.stringify(response.data, null, 2));
  }

  async getPermissionsForRole(roleName: string, iamClient: any) {
    try {
      const resp = await iamClient.roles.get({ name: roleName });
      return resp.data.includedPermissions || [];
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        console.warn(
          `Role not found or cannot be retrieved: ${roleName}`,
          err.message,
        );
      } else {
        console.error(`Error retrieving role ${roleName}:`, err);
      }
      return [];
    }
  }

  async getRolePermissionsBindings(permissions: string[]) {
    const google = await this.getResourceManager();
    const iamClient = google.iam({ version: "v1" });
    const cloudResourceManager = google.cloudresourcemanager({ version: "v1" });
    const policyRes = await cloudResourceManager.projects.getIamPolicy({
      resource: GCP_PROJECT_ID,
    });
    const policy = policyRes.data;

    if (!policy.bindings) {
      console.log("No IAM bindings found on this project.");
      return { flaggedBindings: [], policy };
    }

    const rolePermissionsCache: any = {};
    const flaggedBindings = [];

    for (const binding of policy.bindings) {
      let { role, members, condition } = binding || { role: "" };

      if (!role) {
        continue;
      }

      // If we already looked up this role's permissions, skip extra calls
      if (!rolePermissionsCache[role]) {
        // Retrieve the includedPermissions from IAM
        const perms = await this.getPermissionsForRole(role, iamClient);
        rolePermissionsCache[role] = perms;
      }

      const rolePermissions = rolePermissionsCache[role] || [];
      // Check if any of the role's permissions intersect with our target list
      const intersects = rolePermissions.some((p: string) =>
        PERMISSIONS_TO_BLOCK.includes(p),
      );

      if (intersects) {
        flaggedBindings.push({
          binding,
          role,
          members,
          condition,
          matchedPermissions: rolePermissions.filter((p: string) =>
            PERMISSIONS_TO_BLOCK.includes(p),
          ),
        });
      }
    }

    return { flaggedBindings, policy: policy };
  }
}
