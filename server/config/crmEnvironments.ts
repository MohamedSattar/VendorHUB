/**
 * CRM Environment Configuration
 * Hardcoded to use DEV environment only
 * DEV URL: https://org8b20ca8a.crm15.dynamics.com/api/data/v9.2/
 */

// Development environment configuration
const DEV_DATAVERSE_RESOURCE = "https://org8b20ca8a.crm15.dynamics.com/";

/**
 * Get the Dataverse resource URL
 * Always returns the DEV environment URL
 */
export function getDataverseResource(): string {
  console.log("[CRM Config] Using hardcoded DEV environment: org8b20ca8a");
  return DEV_DATAVERSE_RESOURCE;
}
