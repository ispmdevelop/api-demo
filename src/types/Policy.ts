export type Policy = {
  policyId: string;
  name: string;
  description: string;
  conditions: { [key: string]: string }[];
  actions: string[];
  resources: string[];
  severity: string;
  policyType: string;
  complianceMetadata: string[];
};
