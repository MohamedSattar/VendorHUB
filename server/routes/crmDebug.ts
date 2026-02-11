import { getAuthHeaders } from "../services/azureAuth";
import { getDataverseResource } from "../config/crmEnvironments";

function getODataBaseUrl(): string {
  const resource = getDataverseResource();
  if (resource && resource.includes("dynamics.com")) {
    const cleanResource = resource
      .replace(/\/\.default\/?$/, "")
      .replace(/\/$/, "");
    return `${cleanResource}/api/data/v9.2`;
  }
  return "https://ecavendorhubspa.powerappsportals.com/_api";
}

/**
 * Debug endpoint to list all fields on prmtk_supplierregistration entity
 */
export const handleGetSupplierRegistrationFields = async (
  _req: any,
  res: any
): Promise<void> => {
  try {
    const authHeaders = await getAuthHeaders();
    
    const url = `${getODataBaseUrl()}/EntityDefinitions(LogicalName='prmtk_supplierregistration')/Attributes?$filter=IsLogical eq false`;

    console.log("[CRM Debug] Fetching field definitions for prmtk_supplierregistration");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch entity definition: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract field information
    const fields = data.value.map((attr: any) => ({
      displayName: attr.DisplayName?.UserLocalizedLabel?.Label || "N/A",
      logicalName: attr.LogicalName,
      schemaName: attr.SchemaName,
      type: attr.AttributeTypeName,
    }));

    console.log("[CRM Debug] Found fields:", fields);

    res.json({
      entity: "prmtk_supplierregistration",
      totalFields: fields.length,
      fields: fields.sort((a: any, b: any) => 
        a.displayName.localeCompare(b.displayName)
      ),
    });
  } catch (error) {
    console.error("[CRM Debug] Error fetching field definitions:", error);
    res.status(500).json({
      error: "Failed to fetch field definitions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
