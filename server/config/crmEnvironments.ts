/**
 * CRM Environment Configuration
 * Manage different CRM endpoints for Stage and DEV environments
 */

export interface CRMEnvironment {
  name: string;
  label: string;
  dataverseResource: string;
  description: string;
}

export const CRM_ENVIRONMENTS: Record<string, CRMEnvironment> = {
  STAGE: {
    name: "STAGE",
    label: "Stage Environment",
    dataverseResource: "https://org2a23f983.crm15.dynamics.com/",
    description: "Production-like staging environment",
  },
  DEV: {
    name: "DEV",
    label: "Development Environment",
    dataverseResource: "https://org8b20ca8a.crm15.dynamics.com/",
    description: "Development environment for testing",
  },
};

// In-memory storage of current environment
let currentEnvironment: string = process.env.CRM_ENVIRONMENT || "STAGE";

/**
 * Get the current CRM environment
 */
export function getCurrentEnvironment(): CRMEnvironment {
  const env = CRM_ENVIRONMENTS[currentEnvironment];
  if (!env) {
    console.warn(`[CRM Config] Unknown environment: ${currentEnvironment}, defaulting to STAGE`);
    return CRM_ENVIRONMENTS.STAGE;
  }
  return env;
}

/**
 * Get all available environments
 */
export function getAvailableEnvironments(): CRMEnvironment[] {
  return Object.values(CRM_ENVIRONMENTS);
}

/**
 * Switch to a different CRM environment
 */
export function switchEnvironment(environmentName: string): CRMEnvironment {
  if (!CRM_ENVIRONMENTS[environmentName]) {
    throw new Error(`Unknown environment: ${environmentName}. Available: ${Object.keys(CRM_ENVIRONMENTS).join(", ")}`);
  }

  currentEnvironment = environmentName;
  console.log(`[CRM Config] Switched to ${environmentName} environment`);
  console.log(`[CRM Config] Using CRM URL: ${CRM_ENVIRONMENTS[environmentName].dataverseResource}`);

  return CRM_ENVIRONMENTS[environmentName];
}

/**
 * Get the current environment's Dataverse resource URL
 */
export function getDataverseResource(): string {
  return getCurrentEnvironment().dataverseResource;
}
