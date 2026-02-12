/**
 * CRM Environment Configuration
 * Manage different CRM endpoints for Stage and DEV environments
 * Reads from DATAVERSE_RESOURCE environment variable as primary source
 */

export interface CRMEnvironment {
  name: string;
  label: string;
  dataverseResource: string;
  description: string;
}

// Fallback environments if DATAVERSE_RESOURCE is not set
export const CRM_ENVIRONMENTS: Record<string, CRMEnvironment> = {
  STAGE: {
    name: "STAGE",
    label: "Stage Environment",
    dataverseResource: "https://org2a23f983.crm15.dynamics.com/.default",
    description: "Production-like staging environment",
  },
  DEV: {
    name: "DEV",
    label: "Development Environment",
    dataverseResource: "https://org8b20ca8a.crm15.dynamics.com/.default",
    description: "Development environment for testing",
  },
};

// In-memory storage of current environment
let currentEnvironment: string = process.env.CRM_ENVIRONMENT || "DEV";

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
 * Reads from DATAVERSE_RESOURCE environment variable first, then falls back to config
 */
export function getDataverseResource(): string {
  // Primary source: DATAVERSE_RESOURCE environment variable
  const envResource = process.env.DATAVERSE_RESOURCE;

  if (envResource) {
    console.log("[CRM Config] Using DATAVERSE_RESOURCE from environment variables");
    return envResource;
  }

  // Fallback: Use the configured environment
  const resource = getCurrentEnvironment().dataverseResource;
  console.log(`[CRM Config] Using DATAVERSE_RESOURCE from config: ${resource}`);
  return resource;
}
