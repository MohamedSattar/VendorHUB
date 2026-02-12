import { RequestHandler } from "express";
import { getAuthHeaders, invalidateTokenCache } from "../services/azureAuth";
import { getDataverseResource } from "../config/crmEnvironments";

/**
 * Build the OData base URL from Dataverse resource
 * Uses DEV environment: https://org8b20ca8a.crm15.dynamics.com/api/data/v9.2/
 * (Environment switching has been removed - using DEV only)
 */
function getODataBaseUrl(): string {
  const resource = getDataverseResource();

  if (resource && resource.includes("dynamics.com")) {
    // Remove /.default or trailing slash if present to get the clean endpoint
    const cleanResource = resource
      .replace(/\/\.default\/?$/, "") // Remove /.default suffix
      .replace(/\/$/, ""); // Remove trailing slash

    // Construct the API endpoint
    // Dataverse v9.2 API: https://org8b20ca8a.crm15.dynamics.com/api/data/v9.2
    const endpoint = `${cleanResource}/api/data/v9.2`;
    console.log("[OData] Using DEV environment endpoint:", endpoint);
    return endpoint;
  }

  // Fallback to public portal endpoint (for non-Dataverse scenarios)
  console.warn("[OData] DATAVERSE_RESOURCE not properly configured, using fallback portal endpoint");
  return "https://ecavendorhubspa.powerappsportals.com/_api";
}

interface ODataQuery {
  filter?: string;
  select?: string;
  orderby?: string;
  top?: number;
  skip?: number;
}

/**
 * Make an authenticated request to the OData API
 * Handles token retrieval and error scenarios
 */
async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    // Get authentication headers with access token
    const authHeaders = await getAuthHeaders();

    // Merge with existing headers
    const headers = {
      ...authHeaders,
      ...options.headers,
    };

    console.log("[OData] Making authenticated request to:", url);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401, invalidate the cache and retry once
    if (response.status === 401) {
      console.warn("[OData] Got 401 Unauthorized, invalidating token cache and retrying...");
      invalidateTokenCache();

      const retryAuthHeaders = await getAuthHeaders();
      const retryHeaders = {
        ...retryAuthHeaders,
        ...options.headers,
      };

      return fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    }

    return response;
  } catch (error) {
    console.error("[OData] Authentication error:", error);
    throw error;
  }
}

/**
 * Build OData query string from parameters
 */
function buildODataQuery(query: ODataQuery): string {
  const params: string[] = [];

  if (query.filter) params.push(`$filter=${encodeURIComponent(query.filter)}`);
  if (query.select) params.push(`$select=${encodeURIComponent(query.select)}`);
  if (query.orderby)
    params.push(`$orderby=${encodeURIComponent(query.orderby)}`);
  if (query.top) params.push(`$top=${query.top}`);
  if (query.skip) params.push(`$skip=${query.skip}`);

  return params.length > 0 ? "?" + params.join("&") : "";
}

/**
 * Proxy request to Power Apps OData API
 * GET /api/odata/websitecontents
 */
export const handleGetWebsiteContents: RequestHandler = async (req, res) => {
  try {
    const { filter, select, orderby, top, skip } = req.query;

    const query: ODataQuery = {
      filter: filter as string | undefined,
      select: select as string | undefined,
      orderby: orderby as string | undefined,
      top: top ? parseInt(top as string) : undefined,
      skip: skip ? parseInt(skip as string) : undefined,
    };

    const queryString = buildODataQuery(query);
    const url = `${getODataBaseUrl()}/prmtk_websitecontents${queryString}`;

    console.log("[OData Proxy] Fetching from:", url);

    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Error:", error);
    res.status(500).json({
      error: "Failed to fetch OData content",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get FAQ content (prmtk_section eq 2)
 * GET /api/odata/faq
 * Uses authenticated requests to fetch from CRM Dataverse
 */
export const handleGetFAQ: RequestHandler = async (req, res) => {
  try {
    const url =
      `${getODataBaseUrl()}/prmtk_websitecontents?` +
      `$filter=prmtk_section%20eq%202&` +
      `$select=prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_section,createdon,modifiedon,statuscode&` +
      `$orderby=importsequencenumber%20asc`;

    console.log("[OData Proxy] Fetching FAQ from CRM Dataverse");
    console.log("[OData Proxy] FAQ URL:", url);

    // Use authenticated request to get CRM data with proper OAuth token
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[OData Proxy] CRM API returned error:",
        response.status,
        errorText,
      );
      throw new Error(
        `CRM API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    console.log("[OData Proxy] Successfully fetched FAQ from CRM");
    console.log("[OData Proxy] FAQ count:", data.value ? data.value.length : 0);

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] FAQ Error:", error);
    res.status(500).json({
      error: "Failed to fetch FAQ content from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Category choice mapping from Dataverse numeric values to labels
 * This corresponds to the choice values configured in the CRM
 */
const CATEGORY_LABELS: Record<string, string> = {
  "0": "N/A",
  "1": "Getting Started",
  "2": "Engagements",
  "3": "Contracts",
  "4": "Resources",
  "5": "Account",
  "6": "Support",
  "7": "Key Features",
  "8": "Contact & Support",
};

/**
 * Get Manuals content (prmtk_section eq 3)
 * GET /api/odata/manuals
 * Uses authenticated requests to fetch from CRM Dataverse
 * Includes formatted category values from OData
 */
export const handleGetManuals: RequestHandler = async (req, res) => {
  try {
    // Request to get formatted values from OData
    const url =
      `${getODataBaseUrl()}/prmtk_websitecontents?` +
      `$filter=prmtk_section%20eq%203&` +
      `$select=prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_category,prmtk_section,createdon,modifiedon,statuscode&` +
      `$orderby=importsequencenumber%20asc`;

    console.log("[OData Proxy] Fetching Manuals from CRM Dataverse");
    console.log("[OData Proxy] URL:", url);

    // Use authenticated request with Prefer header to get formatted values
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        // Request formatted values from OData API
        "Prefer": "odata.include-annotations=\"*\"",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[OData Proxy] CRM API returned error:",
        response.status,
        errorText,
      );
      throw new Error(
        `CRM API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    console.log("[OData Proxy] Successfully fetched Manuals from CRM");
    console.log("[OData Proxy] Manuals count:", data.value ? data.value.length : 0);

    // Log first item to debug category values
    if (data.value && data.value.length > 0) {
      const firstItem = data.value[0];
      console.log("[OData Proxy] First manual item:", {
        id: firstItem.prmtk_websitecontentid,
        title: firstItem.prmtk_header,
        categoryRaw: firstItem.prmtk_category,
        categoryFormatted: firstItem["prmtk_category@OData.Community.Display.V1.FormattedValue"],
        allFields: Object.keys(firstItem).filter(k => k.includes("category")),
      });
    }

    // Transform category values using the OData formatted values
    if (data.value) {
      data.value = data.value.map((item: any) => {
        // Try to get OData formatted value first (most reliable from CRM)
        const odataFormatted = item["prmtk_category@OData.Community.Display.V1.FormattedValue"];

        // Fallback to manual mapping if OData doesn't provide formatted value
        const categoryValue = item.prmtk_category;
        const categoryKey = String(categoryValue);
        const mappedLabel = CATEGORY_LABELS[categoryKey];

        // Use whichever is available (prefer OData formatted)
        const formattedLabel = odataFormatted || mappedLabel || "Unknown";

        console.log("[OData] Category transformation:", {
          title: item.prmtk_header,
          rawValue: categoryValue,
          odataFormatted: odataFormatted,
          mappedLabel: mappedLabel,
          finalLabel: formattedLabel,
        });

        return {
          ...item,
          // Replace the numeric category with the formatted label
          prmtk_category: formattedLabel,
          prmtk_category_formatted: formattedLabel,
        };
      });
    }

    // Don't cache to ensure fresh data is always fetched
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Manuals Error:", error);
    res.status(500).json({
      error: "Failed to fetch Manuals content from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Engagements content
 * GET /api/odata/engagements
 */
export const handleGetEngagements: RequestHandler = async (req, res) => {
  try {
    const url =
      `${getODataBaseUrl()}/prmtk_engagements?` +
      `$select=prmtk_engagementid,prmtk_engagementname,prmtk_description,prmtk_startdate,prmtk_enddate,prmtk_status,_prmtk_ecaengagementmanager_value,_prmtk_vendor_value,prmtk_uniqueid,prmtk_type,createdon,modifiedon,statuscode&` +
      `$orderby=prmtk_startdate%20desc`;

    console.log("[OData Proxy] Fetching Engagements from Power Apps");

    // Request OData annotations to get formatted values for lookups and option sets
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Prefer": 'odata.include-annotations="*"',
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    console.log("[OData Proxy] Engagements API Response:", {
      status: response.status,
      hasValue: !!data.value,
      itemCount: data.value ? data.value.length : 0,
    });

    // Don't cache engagement records - always fetch fresh data
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Engagements Error:", error);
    res.status(500).json({
      error: "Failed to fetch Engagements content",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get single Open Role by ID
 * GET /api/odata/open-role/:id
 * Uses authenticated requests to fetch from CRM Dataverse
 */
export const handleGetOpenRoleById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Open Role ID is required" });
    }

    const url =
      `${getODataBaseUrl()}/prmtk_candidateengagementnames(${id})?` +
      `$select=prmtk_candidateengagementnameid,prmtk_rolename,prmtk_startdate,prmtk_enddate,prmtk_status,prmtk_readyforsubmission,_prmtk_candidate_value,_prmtk_engagement_value,prmtk_currenttitle,prmtk_proposedtitle,prmtk_currentsalaryaed,prmtk_proposedsalaryaed,prmtk_name,createdon,modifiedon,statuscode`;

    console.log("[OData Proxy] Fetching Open Role by ID:", id);
    console.log("[OData Proxy] Full URL:", url);

    // Use authenticated request to get CRM data with proper OAuth token
    // Include annotations to get formatted values for lookups (e.g., candidate name)
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Prefer": 'odata.include-annotations="*"',
      },
    });

    console.log(
      "[OData Proxy] Response Status:",
      response.status,
      response.statusText,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[OData Proxy] Response Error Body:", errorText);
      throw new Error(
        `CRM API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    console.log(
      "[OData Proxy] Successfully fetched Open Role, available fields:",
      Object.keys(data),
    );

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Open Role by ID Error:", error);
    res.status(500).json({
      error: "Failed to fetch Open Role from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Update Open Role
 * PATCH /api/odata/open-role/:id
 * Updates open role fields like designation, salary, status, etc.
 */
export const handleUpdateOpenRole: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prmtk_rolename,
      prmtk_currenttitle,
      prmtk_proposedtitle,
      prmtk_currentsalaryaed,
      prmtk_proposedsalaryaed,
      prmtk_status,
      prmtk_readyforsubmission,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Open Role ID is required" });
    }

    const url = `${getODataBaseUrl()}/prmtk_candidateengagementnames(${id})`;

    console.log("[OData Proxy] Updating Open Role by ID:", id);
    console.log("[OData Proxy] Received fields to update:", {
      prmtk_rolename,
      prmtk_currenttitle,
      prmtk_proposedtitle,
      prmtk_currentsalaryaed,
      prmtk_proposedsalaryaed,
      prmtk_status,
      prmtk_readyforsubmission,
    });

    // Build update payload with only provided fields
    // Be conservative with field inclusion to avoid CRM validation errors
    const updatePayload: Record<string, any> = {};

    // Text fields - safe to update
    if (prmtk_rolename !== undefined && prmtk_rolename !== null && prmtk_rolename !== '') {
      updatePayload.prmtk_rolename = String(prmtk_rolename).trim();
    }

    if (prmtk_currenttitle !== undefined && prmtk_currenttitle !== null && prmtk_currenttitle !== '') {
      updatePayload.prmtk_currenttitle = String(prmtk_currenttitle).trim();
    }

    if (prmtk_proposedtitle !== undefined && prmtk_proposedtitle !== null && prmtk_proposedtitle !== '') {
      updatePayload.prmtk_proposedtitle = String(prmtk_proposedtitle).trim();
    }

    // Boolean field - safe to update
    if (prmtk_readyforsubmission !== undefined && prmtk_readyforsubmission !== null && typeof prmtk_readyforsubmission === 'boolean') {
      updatePayload.prmtk_readyforsubmission = prmtk_readyforsubmission;
    }

    // Numeric fields - now enabled
    if (prmtk_currentsalaryaed !== undefined && prmtk_currentsalaryaed !== null) {
      const numValue = typeof prmtk_currentsalaryaed === 'number'
        ? prmtk_currentsalaryaed
        : parseFloat(String(prmtk_currentsalaryaed));
      if (!isNaN(numValue)) {
        updatePayload.prmtk_currentsalaryaed = numValue;
      }
    }

    if (prmtk_proposedsalaryaed !== undefined && prmtk_proposedsalaryaed !== null) {
      const numValue = typeof prmtk_proposedsalaryaed === 'number'
        ? prmtk_proposedsalaryaed
        : parseFloat(String(prmtk_proposedsalaryaed));
      if (!isNaN(numValue)) {
        updatePayload.prmtk_proposedsalaryaed = numValue;
      }
    }

    // Status field - requires numeric code, commenting out for now
    // The prmtk_status field expects a numeric option set code, not the string "Open"
    // TODO: Map string status values to numeric codes in the future
    // if (prmtk_status !== undefined && prmtk_status !== null && prmtk_status !== '') {
    //   updatePayload.prmtk_status = String(prmtk_status).trim();
    // }

    console.log("[OData Proxy] Final update payload:", JSON.stringify(updatePayload, null, 2));
    console.log("[OData Proxy] Payload has fields:", Object.keys(updatePayload).length > 0, "Fields:", Object.keys(updatePayload));

    // Return early if no fields to update
    if (Object.keys(updatePayload).length === 0) {
      console.log("[OData Proxy] No valid fields to update, returning success anyway");
      return res.json({
        success: true,
        message: "No fields to update",
        id: id,
      });
    }

    // Use authenticated request
    const response = await makeAuthenticatedRequest(url, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OData Proxy] Update failed:", response.status, errorText);

      // Try to parse the error response for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error("[OData Proxy] CRM Error Details:", {
          code: errorJson.error?.code,
          message: errorJson.error?.message,
          innerException: errorJson.error?.['Microsoft.OData.ODataException.InnerException']?.[0]?.message,
        });
      } catch {
        console.error("[OData Proxy] Raw error response:", errorText);
      }

      throw new Error(
        `Failed to update open role: ${response.status} ${response.statusText}`,
      );
    }

    console.log("[OData Proxy] Successfully updated Open Role:", id);

    res.json({
      success: true,
      message: "Open Role updated successfully",
      id: id,
    });
  } catch (error) {
    console.error("[OData Proxy] Update Open Role Error:", error);
    res.status(500).json({
      error: "Failed to update Open Role",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Open Roles for an Engagement
 * GET /api/odata/open-roles/:engagementId
 * Uses authenticated requests to fetch from CRM Dataverse
 */
export const handleGetOpenRoles: RequestHandler = async (req, res) => {
  try {
    const { engagementId } = req.params;

    if (!engagementId) {
      return res.status(400).json({ error: "Engagement ID is required" });
    }

    const url =
      `${getODataBaseUrl()}/prmtk_candidateengagementnames?` +
      `$filter=_prmtk_engagement_value%20eq%20${engagementId}&` +
      `$select=prmtk_candidateengagementnameid,prmtk_rolename,prmtk_startdate,prmtk_status,prmtk_readyforsubmission,_prmtk_candidate_value,prmtk_currenttitle,prmtk_proposedtitle,prmtk_currentsalaryaed,prmtk_proposedsalaryaed,createdon,modifiedon,statuscode&` +
      `$orderby=prmtk_startdate%20asc`;

    console.log(
      "[OData Proxy] Fetching Open Roles for Engagement:",
      engagementId,
    );

    // Use authenticated request to get CRM data with proper OAuth token
    // Include annotations to get formatted values for lookups (e.g., candidate name)
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Prefer": 'odata.include-annotations="*"',
      },
    });

    if (!response.ok) {
      throw new Error(
        `CRM API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Open Roles Error:", error);
    res.status(500).json({
      error: "Failed to fetch Open Roles from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get single Engagement by ID
 * GET /api/odata/engagements/:id
 * Uses authenticated requests to fetch from CRM Dataverse
 */
export const handleGetEngagementById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Engagement ID is required" });
    }

    const url =
      `${getODataBaseUrl()}/prmtk_engagements(${id})?` +
      `$select=prmtk_engagementid,prmtk_engagementname,prmtk_description,prmtk_startdate,prmtk_enddate,prmtk_status,_prmtk_ecaengagementmanager_value,_prmtk_vendor_value,prmtk_uniqueid,prmtk_type,createdon,modifiedon,statuscode`;

    console.log("[OData Proxy] Fetching Engagement by ID:", id);

    // Use authenticated request to get CRM data with proper OAuth token
    // Prefer header includes formatted values for choice fields like prmtk_status
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Prefer": "odata.include-annotations=\"*\"",
      },
    });

    if (!response.ok) {
      throw new Error(
        `CRM API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Don't cache engagement records - always fetch fresh data
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Engagement by ID Error:", error);
    res.status(500).json({
      error: "Failed to fetch Engagement from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Submit Engagement and Update Status to "In Progress"
 * POST /api/odata/engagement/:id/submit
 * Updates the engagement status to "In Progress" (code 3)
 * Valid status codes: 1=Open, 2=?, 3=In Progress, 4=Completed
 */
export const handleSubmitEngagement: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Engagement ID is required" });
    }

    const url = `${getODataBaseUrl()}/prmtk_engagements(${id})`;

    console.log("[OData Proxy] Submitting engagement with ID:", id);

    // Update the engagement status to "In Progress"
    // prmtk_status uses simple numeric codes: 1=Open, 2=?, 3=In Progress, 4=Completed
    const updatePayload = {
      prmtk_status: 3, // In Progress
    };

    console.log("[OData Proxy] Update payload:", JSON.stringify(updatePayload, null, 2));

    // Use authenticated request to update the engagement
    const response = await makeAuthenticatedRequest(url, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[OData Proxy] Engagement submission error:",
        response.status,
        errorText,
      );
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}. Details: ${errorText}`,
      );
    }

    console.log("[OData Proxy] Successfully submitted engagement:", id);

    res.json({
      success: true,
      message: "Engagement submitted successfully and status updated to In Progress",
      id: id,
    });
  } catch (error) {
    console.error("[OData Proxy] Submit Engagement Error:", error);
    res.status(500).json({
      error: "Failed to submit engagement",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get all Engagement Contacts
 * GET /api/odata/engagement-contacts
 * Uses authenticated requests to fetch from CRM Dataverse
 */
export const handleGetEngagementContacts: RequestHandler = async (req, res) => {
  try {
    const vendorId = req.query.vendorId as string | undefined;
    const authHeaders = await getAuthHeaders();

    // Build the OData URL with properly encoded parameters
    // Include prmkt_status choice column for candidate status (Free, Assigned, Archived)
    const select = encodeURIComponent(
      "prmtk_engagementcontactid,prmtk_id,prmtk_email,prmtk_phonenumber,prmkt_status,_prmtk_engagement_value,_prmtk_vendor_value,createdon,modifiedon,statuscode"
    );
    const orderby = encodeURIComponent("prmtk_id asc");

    let url = `${getODataBaseUrl()}/prmtk_engagementcontacts?$select=${select}&$orderby=${orderby}`;

    // If vendor ID provided, filter by _prmtk_vendor_value column
    if (vendorId) {
      const filterExpression = encodeURIComponent(`_prmtk_vendor_value eq '${vendorId}'`);
      url += `&$filter=${filterExpression}`;
      console.log("[OData] Fetching Engagement Contacts for vendor:", vendorId);
    } else {
      console.log("[OData] Fetching all Engagement Contacts");
    }

    console.log("[OData] Query URL:", url);

    // Use authenticated request to get CRM data with proper OAuth token
    let response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    // If primary query fails with 404 or other error, try alternative entity name
    if (!response.ok && (response.status === 404 || response.status === 500)) {
      console.warn("[OData] Primary query failed, trying alternative entity name...");

      // Try with alternative entity name (prmkt_ instead of prmtk_)
      const altUrl = url.replace(/\/prmtk_engagementcontacts/, "/prmkt_engagementcontacts");
      console.log("[OData] Trying alternative URL:", altUrl);

      response = await fetch(altUrl, {
        method: "GET",
        headers: {
          ...authHeaders,
          Accept: "application/json",
        },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OData] CRM API error:", {
        status: response.status,
        statusText: response.statusText,
        responseLength: errorText.length,
        first500chars: errorText.substring(0, 500),
      });

      // Try to parse JSON error response
      try {
        const errorJson = JSON.parse(errorText);
        console.error("[OData] Parsed CRM error:", {
          message: errorJson.error?.message,
          innererror: errorJson.error?.innererror?.message,
          type: errorJson.error?.innererror?.type,
        });
      } catch (e) {
        // Not JSON, error already logged above
      }

      // If entity not found (404), return empty list instead of error
      if (response.status === 404) {
        console.log("[OData] Entity not found, returning empty list");
        res.json({ value: [] });
        return;
      }

      throw new Error(
        `CRM returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("[OData] Engagement Contacts retrieved:", {
      count: data.value ? data.value.length : 0,
      hasData: !!data.value && data.value.length > 0,
    });

    // Return empty array if no data
    if (!data.value) {
      res.json({ value: [] });
      return;
    }

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData] Engagement Contacts Error:", error);
    res.status(500).json({
      error: "Failed to fetch Engagement Contacts from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Engagement Contact Personal Photo
 * GET /api/odata/engagement-contact-photo/:id
 */
export const handleGetEngagementContactPhoto: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    const url = `${getODataBaseUrl()}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

    console.log("[OData Proxy] Fetching contact photo for ID:", id);

    // Get authentication headers for OAuth token
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData Proxy] Photo not found for contact:", id);
        return res.status(404).json({ error: "Photo not found" });
      }
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`,
      );
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();

    // Get content type from response headers
    const contentType = response.headers.get("content-type") || "image/jpeg";

    console.log(
      "[OData Proxy] Successfully fetched contact photo, size:",
      buffer.byteLength,
      "bytes",
    );

    // Set appropriate headers for image response
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("[OData Proxy] Contact Photo Error:", error);
    res.status(500).json({
      error: "Failed to fetch contact photo",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Candidate Contact by ID
 * GET /api/odata/candidate-contact/:id
 * Uses authenticated requests to fetch from CRM Dataverse
 */
export const handleGetCandidateContact: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "Candidate Contact ID is required" });
    }

    const url =
      `${getODataBaseUrl()}/prmtk_engagementcontacts(${id})?` +
      `$select=prmtk_engagementcontactid,prmtk_id,prmtk_email,prmtk_phonenumber,prmtk_personalphoto,prmtk_uaeresident,prmtk_cvfile_name,prmtk_introductiondocument_name,prmtk_educationalcertificate_name,prmtk_eid_name,prmtk_salarycertificate_name,prmtk_passport_name,prmtk_experienceletter_name,prmtk_policeclearance_name,createdon,modifiedon,statuscode`;

    console.log("[OData Proxy] Fetching Candidate Contact by ID:", id);

    // Use authenticated request to get CRM data with proper OAuth token
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `CRM API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Don't cache individual candidate contact records - always fetch fresh data
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Candidate Contact by ID Error:", error);
    res.status(500).json({
      error: "Failed to fetch Candidate Contact from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Candidate Contact Personal Photo
 * GET /api/odata/candidate-contact-photo/:id
 */
export const handleGetCandidateContactPhoto: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    const url = `${getODataBaseUrl()}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

    console.log("[OData Proxy] Fetching candidate contact photo for ID:", id);

    // Get authentication headers for OAuth token
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData Proxy] Photo not found for candidate contact:", id);
        return res.status(404).json({ error: "Photo not found" });
      }
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`,
      );
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();

    // Get content type from response headers
    const contentType = response.headers.get("content-type") || "image/jpeg";

    console.log(
      "[OData Proxy] Successfully fetched candidate contact photo, size:",
      buffer.byteLength,
      "bytes",
    );

    // Set appropriate headers for image response
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("[OData Proxy] Candidate Contact Photo Error:", error);
    res.status(500).json({
      error: "Failed to fetch candidate contact photo",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Upload Candidate Contact Personal Photo
 * POST /api/odata/candidate-contact-photo/:id
 */
export const handleUploadCandidateContactPhoto: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    // Get the file from the request
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const url = `${getODataBaseUrl()}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

    console.log("[OData Proxy] Uploading candidate contact photo for ID:", id);
    console.log("[OData Proxy] File details:", {
      size: req.file.size,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
    });

    // Determine the correct MIME type based on file extension or multer detection
    let contentType: string | null = null;

    // First, try to detect from file extension
    if (req.file.originalname) {
      const filename = req.file.originalname.toLowerCase();
      if (filename.endsWith(".png")) {
        contentType = "image/png";
      } else if (filename.endsWith(".gif")) {
        contentType = "image/gif";
      } else if (filename.endsWith(".webp")) {
        contentType = "image/webp";
      } else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (filename.endsWith(".bmp")) {
        contentType = "image/bmp";
      } else if (filename.endsWith(".tiff") || filename.endsWith(".tif")) {
        contentType = "image/tiff";
      }
    }

    // If we couldn't detect from filename, use multer's detected type
    if (!contentType) {
      if (req.file.mimetype && req.file.mimetype.startsWith("image/")) {
        contentType = req.file.mimetype;
        console.log("[OData Proxy] Using multer-detected mimetype:", contentType);
      } else {
        // Only use application/octet-stream as last resort, but try to be smarter
        console.log("[OData Proxy] Warning: multer detected unknown type:", req.file.mimetype);
        contentType = "image/jpeg"; // fallback to jpeg for image uploads
      }
    }

    console.log("[OData Proxy] Using Content-Type:", contentType);

    // Get authentication headers for direct fetch call
    const authHeaders = await getAuthHeaders();

    console.log("[OData Proxy] Auth headers keys:", Object.keys(authHeaders));

    // For photo upload, we only need Authorization and Content-Type
    // Don't include the "application/json" Content-Type from authHeaders
    const headers: Record<string, string> = {
      "Authorization": authHeaders["Authorization"],
      "Content-Type": contentType,
    };

    console.log("[OData Proxy] Final headers for upload:", {
      "Content-Type": contentType,
      "Authorization": "Bearer ***",
    });

    // Try uploading with binary data first
    console.log("[OData Proxy] Sending binary request to:", url);
    console.log("[OData Proxy] Headers being sent:", {
      Authorization: "Bearer ***",
      "Content-Type": headers["Content-Type"],
    });

    let response = await fetch(url, {
      method: "PUT",
      headers,
      body: req.file.buffer,
    });

    // If binary upload fails with 400, try base64-encoded approach
    if (response.status === 400) {
      console.log("[OData Proxy] Binary upload failed with 400, trying base64-encoded approach...");

      const base64Data = req.file.buffer.toString("base64");
      const base64Headers: Record<string, string> = {
        "Authorization": authHeaders["Authorization"],
        "Content-Type": "application/json",
      };

      const base64Payload = JSON.stringify({
        prmtk_personalphoto: base64Data,
      });

      console.log("[OData Proxy] Sending base64 PATCH request with JSON payload");

      // Try PATCH with base64-encoded data in JSON
      response = await fetch(url.replace("/$value", ""), {
        method: "PATCH",
        headers: base64Headers,
        body: base64Payload,
      });
    }

    console.log("[OData Proxy] Upload response status:", response.status);
    console.log("[OData Proxy] Upload response headers:", {
      "content-type": response.headers.get("content-type"),
      "odata-version": response.headers.get("odata-version"),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[OData Proxy] Upload Error Response:",
        response.status,
        errorText,
      );
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}. Details: ${errorText}`,
      );
    }

    console.log("[OData Proxy] Successfully uploaded candidate contact photo:", id);

    res.json({
      success: true,
      message: "Photo uploaded successfully",
      id: id,
    });
  } catch (error) {
    console.error("[OData Proxy] Upload Candidate Contact Photo Error:", error);
    res.status(500).json({
      error: "Failed to upload candidate contact photo",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Engagement Contact Document (e.g., CV, certificates, etc.)
 * GET /api/odata/engagement-contact/:id/:fieldName/$value
 * Example: /api/odata/engagement-contact/123/prmtk_cvfile/$value
 */
export const handleGetEngagementContactDocument: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id, fieldName } = req.params;

    if (!id || !fieldName) {
      return res
        .status(400)
        .json({ error: "Contact ID and field name are required" });
    }

    // Validate field name to prevent injection attacks
    const validFields = [
      "prmtk_cvfile",
      "prmtk_introductiondocument",
      "prmtk_educationalcertificate",
      "prmtk_eid",
      "prmtk_salarycertificate",
      "prmtk_passport",
      "prmtk_experienceletter",
      "prmtk_policeclearance",
    ];

    if (!validFields.includes(fieldName)) {
      return res.status(400).json({ error: "Invalid document field" });
    }

    const url = `${getODataBaseUrl()}/prmtk_engagementcontacts(${id})/${fieldName}/$value`;

    console.log(
      "[OData Proxy] Fetching document for ID:",
      id,
      "Field:",
      fieldName,
    );

    // Get authentication headers for OAuth token
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(
          "[OData Proxy] Document not found for contact:",
          id,
          "Field:",
          fieldName,
        );
        return res.status(404).json({ error: "Document not found" });
      }
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`,
      );
    }

    // Get the document buffer
    const buffer = await response.arrayBuffer();

    // Get content type from response headers - for documents, often application/octet-stream
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // Try to extract filename from Content-Disposition header if available
    const contentDisposition =
      response.headers.get("content-disposition") || "";

    console.log(
      "[OData Proxy] Successfully fetched document, size:",
      buffer.byteLength,
      "bytes",
    );

    // Set appropriate headers for document response
    res.set("Content-Type", contentType);
    res.set("Content-Disposition", contentDisposition || "attachment");
    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("[OData Proxy] Document Download Error:", error);
    res.status(500).json({
      error: "Failed to fetch document",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Create New Engagement Contact Record
 * POST /api/odata/engagement-contact
 * Creates a new engagement contact record
 */
export const handleCreateEngagementContact: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { prmtk_id, prmtk_email, prmtk_phonenumber, prmtk_uaeresident, _prmtk_vendor_value } =
      req.body;

    if (!prmtk_id) {
      return res.status(400).json({ error: "Name (prmtk_id) is required" });
    }

    if (!_prmtk_vendor_value) {
      return res.status(400).json({ error: "Vendor ID is required" });
    }

    const authHeaders = await getAuthHeaders();
    const url = `${getODataBaseUrl()}/prmtk_engagementcontacts`;

    console.log("[OData Proxy] Creating new Engagement Contact for vendor:", _prmtk_vendor_value);

    // Build the create payload
    const createData: Record<string, any> = {
      prmtk_id: prmtk_id,
      "_prmtk_vendor_value": _prmtk_vendor_value,
    };
    if (prmtk_email !== undefined) createData.prmtk_email = prmtk_email;
    if (prmtk_phonenumber !== undefined)
      createData.prmtk_phonenumber = prmtk_phonenumber;
    if (prmtk_uaeresident !== undefined)
      createData.prmtk_uaeresident = prmtk_uaeresident;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...authHeaders,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[OData Proxy] Create Error Response:",
        response.status,
        response.statusText,
      );
      console.error("[OData Proxy] Full Error Body:", errorText);
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}. Details: ${errorText.substring(0, 500)}`,
      );
    }

    // Dataverse returns the ID in the Location header for successful POST requests
    // Location header format: https://org8b20ca8a.crm15.dynamics.com/api/data/v9.2/prmtk_engagementcontacts(id-here)
    const locationHeader = response.headers.get("location");
    let contactId = "";

    if (locationHeader) {
      // Extract ID from URI like prmtk_engagementcontacts(6df55347-69ec-f011-8406-6045bd69c28c)
      const match = locationHeader.match(/\(([^)]+)\)$/);
      if (match && match[1]) {
        contactId = match[1];
      }
    }

    if (!contactId) {
      throw new Error("Unable to extract contact ID from response Location header");
    }

    console.log(
      "[OData Proxy] Successfully created Engagement Contact with ID:",
      contactId,
    );

    res.json({
      success: true,
      message: "Engagement Contact created successfully",
      id: contactId,
    });
  } catch (error) {
    console.error("[OData Proxy] Create Engagement Contact Error:", error);
    res.status(500).json({
      error: "Failed to create Engagement Contact",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Update Candidate Contact Record
 * PATCH /api/odata/candidate-contact/:id
 * Updates the existing engagement contact record with new values
 */
export const handleUpdateCandidateContact: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;
    const { prmtk_id, prmtk_email, prmtk_phonenumber, prmtk_uaeresident } =
      req.body;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    const url = `${getODataBaseUrl()}/prmtk_engagementcontacts(${id})`;

    console.log("[OData Proxy] Updating Engagement Contact by ID:", id);

    // Build the update payload
    const updateData: Record<string, any> = {};
    if (prmtk_id !== undefined) updateData.prmtk_id = prmtk_id;
    if (prmtk_email !== undefined) updateData.prmtk_email = prmtk_email;
    if (prmtk_phonenumber !== undefined)
      updateData.prmtk_phonenumber = prmtk_phonenumber;
    if (prmtk_uaeresident !== undefined)
      updateData.prmtk_uaeresident = prmtk_uaeresident;

    console.log("[OData Proxy] Update Payload:", JSON.stringify(updateData, null, 2));

    // Use authenticated request with OAuth token
    const response = await makeAuthenticatedRequest(url, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[OData Proxy] Update Error Response:",
        response.status,
        errorText,
      );
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}. Details: ${errorText}`,
      );
    }

    console.log("[OData Proxy] Successfully updated Engagement Contact:", id);

    res.json({
      success: true,
      message: "Engagement Contact updated successfully",
      id: id,
    });
  } catch (error) {
    console.error("[OData Proxy] Update Engagement Contact Error:", error);
    res.status(500).json({
      error: "Failed to update Engagement Contact",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Upload a document to an Engagement Contact
 * POST /api/odata/engagement-contact/:id/document/:fieldName
 * Uploads a file to a specified document field on an engagement contact record
 */
export const handleUploadEngagementContactDocument: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id, fieldName } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    if (!fieldName) {
      return res.status(400).json({ error: "Field name is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const url = `${getODataBaseUrl()}/prmtk_engagementcontacts(${id})/${fieldName}/$value`;

    console.log("[OData Proxy] Uploading document to engagement contact:", {
      id,
      fieldName,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
    });

    const authHeaders = await getAuthHeaders();

    // For file uploads, send the file binary data with proper content type
    const headers: Record<string, string> = {
      "Authorization": authHeaders["Authorization"],
      "Content-Type": req.file.mimetype || "application/octet-stream",
    };

    const uploadResponse = await fetch(url, {
      method: "PUT",
      headers,
      body: req.file.buffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(
        "[OData Proxy] Document upload error:",
        uploadResponse.status,
        errorText
      );
      throw new Error(
        `Failed to upload document: ${uploadResponse.statusText}`
      );
    }

    console.log(
      "[OData Proxy] Successfully uploaded document for field:",
      fieldName
    );

    res.json({
      success: true,
      message: `Document uploaded successfully to field: ${fieldName}`,
      fieldName,
    });
  } catch (error) {
    console.error("[OData Proxy] Upload Document Error:", error);
    res.status(500).json({
      error: "Failed to upload document",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Assign a candidate to an open role
 * POST /api/odata/open-role/:id/assign-candidate
 */
export const handleAssignCandidateToOpenRole: RequestHandler = async (
  req,
  res,
) => {
  try {
    const { id } = req.params;
    const { candidateId, candidateName, candidateContactId, formData } =
      req.body;

    if (!id || !candidateId) {
      return res.status(400).json({
        error: "Missing required fields: id and candidateId",
      });
    }

    console.log("[OData Proxy] Assigning candidate to open role:", {
      openRoleId: id,
      candidateId,
      candidateName,
    });

    // Update the prmtk_candidateengagementname record with the candidate lookup value
    // The lookup field is stored as _prmtk_candidate_value in Dynamics CRM

    // We need to set the lookup using the collection-valued navigation property reference
    // Try using the standard Dynamics REST way to set a single-valued navigation property

    // Step 1: Try setting with a PATCH using the fully qualified URI
    const updateUrl = `${getODataBaseUrl()}/prmtk_candidateengagementnames(${id})`;

    // Build update payload - trying different navigation property names
    // The error says 'prmtk_candidate' is undeclared, so we need to find the correct name
    // Let's try alternative field names that might be the navigation property

    const updatePayload: Record<string, any> = {};

    // Use navigation property binding with proper schema name capitalization
    // The navigation property is "prmtk_Candidate" (with capital C) as defined in metadata
    updatePayload["prmtk_Candidate@odata.bind"] = `/prmtk_engagementcontacts(${candidateId})`;

    console.log("[OData Proxy] Binding candidate using navigation property...")
    console.log("[OData Proxy] Candidate ID:", candidateId);
    console.log("[OData Proxy] Payload:", JSON.stringify(updatePayload, null, 2));

    if (formData) {
      console.log(
        "[OData Proxy] Form data provided for candidate update:",
        formData,
      );
    }

    console.log("[OData Proxy] Update URL:", updateUrl);

    // Make the PATCH request to update the open role with the candidate
    const updateResponse = await makeAuthenticatedRequest(updateUrl, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(
        "[OData Proxy] Update failed:",
        updateResponse.status,
        errorText,
      );

      // Log more detailed error information
      let errorMessage = `Failed to update open role with candidate: ${updateResponse.status} ${updateResponse.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        console.error("[OData Proxy] CRM Error Code:", errorJson.error?.code);
        console.error("[OData Proxy] CRM Error Message:", errorJson.error?.message);

        // Check for duplicate assignment error
        if (errorJson.error?.code === "0x80060892" ||
            (errorJson.error?.message && errorJson.error.message.includes("CandidateEngagement_AltKey"))) {
          errorMessage = "This candidate is already assigned to this role. Please select a different candidate.";
        } else {
          errorMessage = errorJson.error?.message || errorMessage;
        }

        // Print the full error object for debugging
        console.error("[OData Proxy] Full error object:", JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error("[OData Proxy] Raw error text:", errorText);
      }

      throw new Error(errorMessage);
    }

    console.log("[OData Proxy] Successfully patched candidate reference to open role record");

    console.log("[OData Proxy] Successfully assigned candidate to open role");

    // Return the updated open role
    res.json({
      success: true,
      message: "Candidate assigned successfully",
      openRoleId: id,
      candidateId: candidateId,
      candidateName: candidateName,
    });
  } catch (error) {
    console.error("[OData Proxy] Assign Candidate Error:", error);
    res.status(500).json({
      error: "Failed to assign candidate to open role",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Update Contact Record by ID
 * PATCH /api/odata/contact/:id
 * Updates an existing contact record in the standard contact table using contact ID
 */
export const handleUpdateContactById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, mobilephone, preferredcontactmethodcode } = req.body;

    if (!id) {
      return res.status(400).json({
        error: "Contact ID is required",
      });
    }

    console.log("[OData Proxy] Updating contact record:", {
      id: id,
      firstName: firstname,
      lastName: lastname,
      mobilePhone: mobilephone,
      preferredContactMethodCode: preferredcontactmethodcode,
    });

    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    // Build update payload with only provided fields
    const updatePayload: Record<string, any> = {};
    if (firstname !== undefined) updatePayload.firstname = firstname;
    if (lastname !== undefined) updatePayload.lastname = lastname;
    if (mobilephone !== undefined) updatePayload.mobilephone = mobilephone;
    if (preferredcontactmethodcode !== undefined) updatePayload.preferredcontactmethodcode = preferredcontactmethodcode;

    // Update contact in CRM using PATCH
    const updateUrl = `${getODataBaseUrl()}/contacts(${id})`;

    console.log("[OData Proxy] PATCH URL:", updateUrl);
    console.log("[OData Proxy] Update payload:", updatePayload);

    const updateResponse = await makeAuthenticatedRequest(updateUrl, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(
        "[OData Proxy] Contact update failed:",
        updateResponse.status,
        errorText
      );
      throw new Error(
        `Failed to update contact: ${updateResponse.status} ${updateResponse.statusText}`
      );
    }

    console.log("[OData Proxy] Contact updated successfully, fetching updated record");

    // Fetch the updated contact record
    const fetchUrl = `${getODataBaseUrl()}/contacts(${id})?$select=contactid,firstname,lastname,emailaddress1,telephone1,mobilephone,createdon,statecode,statuscode,preferredcontactmethodcode`;

    const fetchResponse = await makeAuthenticatedRequest(fetchUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!fetchResponse.ok) {
      console.error(
        "[OData Proxy] Failed to fetch updated contact:",
        fetchResponse.status
      );
      throw new Error("Failed to fetch updated contact record");
    }

    const updatedContact: any = await fetchResponse.json();

    // Try to fetch related vendor information using bridge table
    // Query prmtk_vendorcontactses to find the vendor associated with this contact
    let vendorName = null;
    let vendorId = null;

    try {
      // First, query the bridge table prmtk_vendorcontactses to find the first assigned vendor
      // This table links contacts to vendors through the prmtk_engagement_VendorContactPerson_contact relationship
      // Order by createdon to get the first assigned vendor, then get just the first result
      const bridgeQueryUrl = `${getODataBaseUrl()}/prmtk_vendorcontactses?$filter=_prmtk_contact_value eq ${id}&$select=_prmtk_vendor_value,createdon&$orderby=createdon asc&$top=1`;

      console.log("[OData Proxy] Querying bridge table for first assigned vendor:", bridgeQueryUrl);

      const bridgeResponse = await makeAuthenticatedRequest(bridgeQueryUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (bridgeResponse.ok) {
        const bridgeData = await bridgeResponse.json();
        if (bridgeData.value && bridgeData.value.length > 0) {
          const vendorLookupId = bridgeData.value[0]._prmtk_vendor_value;
          console.log("[OData Proxy] Found first assigned vendor ID from bridge table:", vendorLookupId);

          // Now query the vendor details using the vendor ID from bridge table
          if (vendorLookupId) {
            const vendorDetailUrl = `${getODataBaseUrl()}/prmtk_vendors(${vendorLookupId})?$select=prmtk_vendorid,prmtk_name`;

            const vendorDetailResponse = await makeAuthenticatedRequest(vendorDetailUrl, {
              method: "GET",
              headers: {
                Accept: "application/json",
              },
            });

            if (vendorDetailResponse.ok) {
              const vendorDetail = await vendorDetailResponse.json();
              vendorName = vendorDetail.prmtk_name;
              vendorId = vendorDetail.prmtk_vendorid;
              console.log("[OData Proxy] First assigned vendor details retrieved:", { vendorId, vendorName });
            }
          }
        }
      }
    } catch (vendorError) {
      console.warn("[OData Proxy] Could not fetch vendor information:", vendorError);
    }

    console.log("[OData Proxy] Updated contact retrieved:", {
      id: updatedContact.contactid,
      firstName: updatedContact.firstname,
      lastName: updatedContact.lastname,
      mobilePhone: updatedContact.mobilephone,
      preferredContactMethodCode: updatedContact.preferredcontactmethodcode,
      vendorName: vendorName,
    });

    // Return the updated contact in the expected format
    res.json({
      prmtk_contactid: updatedContact.contactid,
      prmtk_firstname: updatedContact.firstname,
      prmtk_lastname: updatedContact.lastname,
      prmtk_email: updatedContact.emailaddress1,
      prmtk_phone: updatedContact.telephone1,
      prmtk_mobilenumber: updatedContact.mobilephone,
      prmtk_preferredcontactmethod: undefined,
      preferredcontactmethodcode: updatedContact.preferredcontactmethodcode,
      createdon: updatedContact.createdon,
      statuscode: updatedContact.statuscode,
      prmtk_vendor_name: vendorName,
      prmtk_vendor_id: vendorId,
    });
  } catch (error) {
    console.error("[OData Proxy] Contact Update Error:", error);
    res.status(500).json({
      error: "Failed to update contact",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get current user's contact information
 * Used to determine contact ID for notifications and other queries
 */
export const handleGetCurrentUserContact = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    // Try to get email from authorization header or request
    const email = (req.query.email || req.body?.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        error: "Missing email parameter",
      });
    }

    console.log("[OData] Fetching current user contact for email:", email);

    // Query contacts by email
    const filter = encodeURIComponent(`prmtk_email eq '${email}'`);
    const select = encodeURIComponent(
      "prmtk_contactid,prmtk_email,prmtk_firstname,prmtk_lastname"
    );

    const url = `${getODataBaseUrl()}/contacts?$filter=${filter}&$select=${select}`;

    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch contact: ${response.status} ${response.statusText}`
      );
    }

    const data: any = await response.json();

    if (!data.value || data.value.length === 0) {
      return res.status(404).json({
        error: "Contact not found",
      });
    }

    const contact = data.value[0];
    console.log("[OData] Current user contact found:", contact.prmtk_contactid);

    res.json({
      contactId: contact.prmtk_contactid,
      email: contact.prmtk_email,
      firstName: contact.prmtk_firstname,
      lastName: contact.prmtk_lastname,
    });
  } catch (error) {
    console.error("[OData] Error fetching current user contact:", error);
    res.status(500).json({
      error: "Failed to fetch current user contact",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Fetch notifications for the logged-in user/contact
 * Retrieves from prmkt_notifications set
 */
export const handleGetNotifications = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const contactId = req.query.contactId;

    if (!contactId) {
      return res.status(400).json({
        error: "Missing required parameter: contactId",
      });
    }

    console.log("[OData] Fetching notifications for contact:", contactId);

    const authHeaders = await getAuthHeaders();

    // Build OData URL with proper encoding
    // Filter by contact ID and exclude dismissed notifications
    const filterParts = [
      `_prmkt_contact_value eq '${contactId}'`,
      "prmkt_dismissed eq false",
    ];

    const filter = encodeURIComponent(filterParts.join(" and "));
    const select = encodeURIComponent(
      "prmkt_notificationid,prmkt_subject,prmkt_notificationbody,prmkt_read,prmkt_dismissed,createdon,prmkt_name"
    );
    const orderby = encodeURIComponent("createdon desc");

    const url = `${getODataBaseUrl()}/prmkt_notifications?$filter=${filter}&$select=${select}&$orderby=${orderby}`;

    console.log("[OData] Notifications query URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[OData] Notifications API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
      });

      throw new Error(
        `Failed to fetch notifications: ${response.status} ${response.statusText}. ${errorBody}`
      );
    }

    const data: any = await response.json();

    // Transform CRM data to match our Notification interface
    const notifications = (data.value || []).map((notification: any) => ({
      id: notification.prmkt_notificationid,
      subject: notification.prmkt_subject || "Notification",
      message: notification.prmkt_notificationbody || "",
      isRead: notification.prmkt_read || false,
      isDismissed: notification.prmkt_dismissed || false,
      createdAt: notification.createdon,
      name: notification.prmkt_name,
    }));

    console.log("[OData] Retrieved notifications:", notifications.length);

    res.json(notifications);
  } catch (error) {
    console.error("[OData] Error fetching notifications:", error);
    res.status(500).json({
      error: "Failed to fetch notifications",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Mark a notification as read
 */
export const handleMarkNotificationAsRead = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("[OData] Marking notification as read:", id);

    const url = `${getODataBaseUrl()}/prmkt_notifications(${id})`;

    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prmkt_read: true }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update notification: ${response.status} ${response.statusText}`
      );
    }

    console.log("[OData] Notification marked as read:", id);

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("[OData] Error updating notification:", error);
    res.status(500).json({
      error: "Failed to update notification",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Mark a notification as unread
 */
export const handleMarkNotificationAsUnread = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("[OData] Marking notification as unread:", id);

    const url = `${getODataBaseUrl()}/prmkt_notifications(${id})`;

    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prmkt_read: false }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to update notification: ${response.status} ${response.statusText}`
      );
    }

    console.log("[OData] Notification marked as unread:", id);

    res.json({ success: true, message: "Notification marked as unread" });
  } catch (error) {
    console.error("[OData] Error updating notification:", error);
    res.status(500).json({
      error: "Failed to update notification",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Dismiss a notification
 */
export const handleDismissNotification = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("[OData] Dismissing notification:", id);

    const url = `${getODataBaseUrl()}/prmkt_notifications(${id})`;

    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prmkt_dismissed: true }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to dismiss notification: ${response.status} ${response.statusText}`
      );
    }

    console.log("[OData] Notification dismissed:", id);

    res.json({ success: true, message: "Notification dismissed" });
  } catch (error) {
    console.error("[OData] Error dismissing notification:", error);
    res.status(500).json({
      error: "Failed to dismiss notification",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Dismiss all notifications for a contact
 */
export const handleDismissAllNotifications = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const contactId = req.query.contactId;

    if (!contactId) {
      return res.status(400).json({
        error: "Missing required parameter: contactId",
      });
    }

    console.log("[OData] Dismissing all notifications for contact:", contactId);

    // Fetch all non-dismissed notifications first
    const fetchUrl = `${getODataBaseUrl()}/prmkt_notifications?$filter=_prmkt_contact_value eq '${contactId}' and prmkt_dismissed eq false and statecode eq 0&$select=prmkt_notificationid`;

    const authHeaders = await getAuthHeaders();

    const fetchResponse = await fetch(fetchUrl, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    if (!fetchResponse.ok) {
      throw new Error(
        `Failed to fetch notifications: ${fetchResponse.status}`
      );
    }

    const data: any = await fetchResponse.json();
    const notificationIds = data.value.map(
      (n: any) => n.prmkt_notificationid
    );

    // Mark all as dismissed
    const updatePromises = notificationIds.map((id: string) => {
      const url = `${getODataBaseUrl()}/prmkt_notifications(${id})`;
      return fetch(url, {
        method: "PATCH",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prmkt_dismissed: true }),
      });
    });

    const responses = await Promise.all(updatePromises);

    const allSuccess = responses.every((r) => r.ok);
    if (!allSuccess) {
      throw new Error("Failed to dismiss all notifications");
    }

    console.log("[OData] All notifications dismissed:", notificationIds.length);

    res.json({
      success: true,
      message: `${notificationIds.length} notification(s) dismissed`,
      dismissedCount: notificationIds.length,
    });
  } catch (error) {
    console.error("[OData] Error dismissing all notifications:", error);
    res.status(500).json({
      error: "Failed to dismiss all notifications",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Save supplier registration as draft to prmtk_supplierregistration table
 * Creates or updates a draft record
 */
export const handleSaveDraftSupplierRegistration = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const { draftId, ...supplierData } = req.body;

    console.log("[OData] Saving supplier registration draft:", {
      draftId,
      companyName: supplierData.companyName,
    });

    // Build the record data to save as draft
    const draftData = {
      // Section A: Company Information
      prmtk_companyname: supplierData.companyName || null,
      prmtk_yearsinbusiness: supplierData.yearsInBusiness
        ? parseInt(supplierData.yearsInBusiness)
        : null,
      prmtk_numberofemployees: supplierData.numberOfEmployees
        ? parseInt(supplierData.numberOfEmployees)
        : null,
      prmtk_tradelivensetype: supplierData.tradeLicenseType || null,
      prmtk_country: supplierData.country || null,
      prmtk_city: supplierData.city || null,
      prmtk_haswebsite: supplierData.website === "yes",
      prmtk_websiteurl: supplierData.websiteUrl || null,
      prmtk_isemiratisme: supplierData.isEmiratiSME || false,
      prmtk_iskhalifafundregistered: supplierData.isKhalifaFundRegistered || false,
      prmtk_hasicvcertificate: supplierData.hasICVCertificate || false,
      prmtk_icvscore: supplierData.icvScore || null,

      // Section B: Operational Capabilities
      prmtk_hasenvironmentalpractices: supplierData.hasEnvironmentalPractices || false,
      prmtk_environmentalpracticesdetails:
        supplierData.environmentalPracticesDetails || null,
      prmtk_supplycategoryselections:
        supplierData.supplyCategorySelections?.join("; ") || null,
      prmtk_mainsuppliersinfo: supplierData.suppliers
        ?.filter((s: any) => s.name)
        .map((s: any) => s.name)
        .join("; ") || null,

      // Section C: Quality & Compliance
      prmtk_hascertifications: supplierData.hasCertifications || false,
      prmtk_certifications: supplierData.certifications || null,
      prmtk_othercertifications: supplierData.otherCertifications || null,

      // Section D: Supplier Declaration
      prmtk_declarationfullname: supplierData.fullName || null,
      prmtk_declarationdesignation: supplierData.designation || null,
      prmtk_declarationphone: supplierData.phone || null,
      prmtk_declarationemail: supplierData.email || null,
      prmtk_declarationdate: supplierData.date || null,

      // Client References (store as JSON string for complex data)
      prmtk_clientreferencesdata: supplierData.clientReferences
        ? JSON.stringify(
            supplierData.clientReferences.filter((ref: any) => ref.name)
          )
        : null,

      // Status - Save as Draft
      statuscode: 1,
      statecode: 0,
      prmtk_submissionstatus: 0, // 0 = Draft
    };

    // Remove null values
    Object.keys(draftData).forEach((key) => {
      if (draftData[key as keyof typeof draftData] === null) {
        delete draftData[key as keyof typeof draftData];
      }
    });

    let response;

    if (draftId) {
      // Update existing draft
      const url = `${getODataBaseUrl()}/prmtk_supplierregistrations(${draftId})`;

      console.log("[OData] Updating draft supplier registration:", draftId);

      const authHeaders = await getAuthHeaders();

      response = await fetch(url, {
        method: "PATCH",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });
    } else {
      // Create new draft
      const url = `${getODataBaseUrl()}/prmtk_supplierregistrations`;

      console.log("[OData] Creating new draft supplier registration");

      const authHeaders = await getAuthHeaders();

      response = await fetch(url, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
          Prefer: 'return=representation',
        },
        body: JSON.stringify(draftData),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[OData] Failed to save draft:", {
        status: response.status,
        error: errorData,
      });

      throw new Error(
        `Failed to save draft: ${response.status}. ${
          errorData?.error?.message || ""
        }`
      );
    }

    const savedRecord = await response.json();
    const recordId =
      draftId || savedRecord.prmtk_supplierregistrationid;

    console.log("[OData] Draft saved successfully:", recordId);

    res.status(200).json({
      success: true,
      message: "Draft saved successfully",
      draftId: recordId,
    });
  } catch (error) {
    console.error("[OData] Draft Save Error:", error);
    res.status(500).json({
      error: "Failed to save draft",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Submit supplier registration to prmtk_supplierregistration table
 * Updates an existing draft or creates a new record and marks it as submitted
 */
export const handleSubmitSupplierRegistration = async (
  req: any,
  res: any
): Promise<void> => {
  try {
    const {
      draftId,
      companyName,
      yearsInBusiness,
      numberOfEmployees,
      tradeLicenseType,
      country,
      city,
      website,
      websiteUrl,
      isEmiratiSME,
      isKhalifaFundRegistered,
      hasICVCertificate,
      icvScore,
      hasEnvironmentalPractices,
      environmentalPracticesDetails,
      supplyCategorySelections,
      suppliers,
      clientReferences,
      hasCertifications,
      certifications,
      otherCertifications,
      fullName,
      designation,
      phone,
      email,
      date,
    } = req.body;

    console.log("[OData] Submitting supplier registration for company:", companyName);

    // Build the record data to submit to CRM
    const supplierRegistrationData = {
      // Section A: Company Information
      prmtk_companyname: companyName,
      prmtk_yearsinbusiness: yearsInBusiness ? parseInt(yearsInBusiness) : null,
      prmtk_numberofemployees: numberOfEmployees ? parseInt(numberOfEmployees) : null,
      prmtk_tradelivensetype: tradeLicenseType,
      prmtk_country: country || null,
      prmtk_city: city || null,
      prmtk_haswebsite: website === "yes",
      prmtk_websiteurl: websiteUrl || null,
      prmtk_isemiratisme: isEmiratiSME,
      prmtk_iskhalifafundregistered: isKhalifaFundRegistered,
      prmtk_hasicvcertificate: hasICVCertificate,
      prmtk_icvscore: icvScore || null,

      // Section B: Operational Capabilities
      prmtk_hasenvironmentalpractices: hasEnvironmentalPractices,
      prmtk_environmentalpracticesdetails: environmentalPracticesDetails || null,
      prmtk_supplycategoryselections: supplyCategorySelections?.join("; ") || null,
      prmtk_mainsuppliersinfo: suppliers
        ?.filter((s: any) => s.name)
        .map((s: any) => s.name)
        .join("; ") || null,

      // Section C: Quality & Compliance
      prmtk_hascertifications: hasCertifications,
      prmtk_certifications: certifications || null,
      prmtk_othercertifications: otherCertifications || null,

      // Section D: Supplier Declaration
      prmtk_declarationfullname: fullName,
      prmtk_declarationdesignation: designation,
      prmtk_declarationphone: phone,
      prmtk_declarationemail: email,
      prmtk_declarationdate: date,

      // Client References (store as JSON string for complex data)
      prmtk_clientreferencesdata: JSON.stringify(
        clientReferences?.filter((ref: any) => ref.name) || []
      ),

      // Status and metadata
      statuscode: 1, // Active
      statecode: 0, // Active
      prmtk_submissionstatus: 1, // 1 = Submitted (option set)
    };

    // Remove null values
    Object.keys(supplierRegistrationData).forEach((key) => {
      if (supplierRegistrationData[key as keyof typeof supplierRegistrationData] === null) {
        delete supplierRegistrationData[key as keyof typeof supplierRegistrationData];
      }
    });

    // Get authentication headers
    const authHeaders = await getAuthHeaders();
    let trackingId: string;
    let response;

    if (draftId) {
      // Update existing draft
      const url = `${getODataBaseUrl()}/prmtk_supplierregistrations(${draftId})`;

      console.log("[OData] Updating draft supplier registration to submitted:", {
        draftId,
        companyName,
      });

      response = await fetch(url, {
        method: "PATCH",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supplierRegistrationData),
      });

      trackingId = draftId;
    } else {
      // Create new record
      const url = `${getODataBaseUrl()}/prmtk_supplierregistrations`;

      console.log("[OData] Creating supplier registration record:", {
        companyName,
        url,
      });

      response = await fetch(url, {
        method: "POST",
        headers: {
          ...authHeaders,
          "Content-Type": "application/json",
          Prefer: 'return=representation',
        },
        body: JSON.stringify(supplierRegistrationData),
      });

      const createdRecord = await response.json();
      trackingId = createdRecord.prmtk_supplierregistrationid;
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[OData] Failed to submit supplier registration:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      throw new Error(
        `Failed to submit supplier registration: ${response.status} ${response.statusText}. ${
          errorData?.error?.message || ""
        }`
      );
    }

    console.log("[OData] Supplier registration created successfully:", {
      trackingId,
      companyName,
    });

    // Return the tracking ID and confirmation details
    res.status(201).json({
      success: true,
      message: "Supplier application submitted successfully",
      trackingId: trackingId,
      companyName: companyName,
      submissionDate: new Date().toISOString(),
      contactEmail: email,
    });
  } catch (error) {
    console.error("[OData] Supplier Registration Submission Error:", error);
    res.status(500).json({
      error: "Failed to submit supplier registration",
      details: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get all countries from CRM
 * GET /api/odata/countries
 */
export const handleGetCountries: RequestHandler = async (req, res) => {
  try {
    const authHeaders = await getAuthHeaders();

    const url = `${getODataBaseUrl()}/prmtk_countries?$select=prmtk_countryid,prmtk_name&$orderby=prmtk_name asc`;

    console.log("[OData] Fetching countries from CRM");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OData] CRM API error fetching countries:", {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText.substring(0, 500),
      });

      throw new Error(
        `CRM returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.value) {
      console.log("[OData] No countries returned from API");
      res.json([]);
      return;
    }

    console.log("[OData] Countries retrieved:", {
      count: data.value.length,
    });

    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.json(data.value);
  } catch (error) {
    console.error("[OData] Countries Error:", error);
    res.status(500).json({
      error: "Failed to fetch countries from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get cities for a specific country from CRM
 * GET /api/odata/cities?countryId={countryId}
 */
export const handleGetCities: RequestHandler = async (req, res) => {
  try {
    const countryId = req.query.countryId as string | undefined;

    if (!countryId) {
      console.warn("[OData] Cities requested without countryId");
      res.status(400).json({
        error: "Missing required parameter: countryId",
      });
      return;
    }

    const authHeaders = await getAuthHeaders();

    const filter = encodeURIComponent(
      `_prmtk_country_value eq '${countryId}'`
    );
    const url = `${getODataBaseUrl()}/prmtk_cities?$select=prmtk_cityid,prmtk_name,_prmtk_country_value&$filter=${filter}&$orderby=prmtk_name asc`;

    console.log("[OData] Fetching cities for country:", countryId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OData] CRM API error fetching cities:", {
        status: response.status,
        statusText: response.statusText,
        countryId,
        errorBody: errorText.substring(0, 500),
      });

      throw new Error(
        `CRM returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.value) {
      console.log("[OData] No cities returned from API");
      res.json([]);
      return;
    }

    console.log("[OData] Cities retrieved:", {
      countryId,
      count: data.value.length,
    });

    res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    res.json(data.value);
  } catch (error) {
    console.error("[OData] Cities Error:", error);
    res.status(500).json({
      error: "Failed to fetch cities from CRM",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};
