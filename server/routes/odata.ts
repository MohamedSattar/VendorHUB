import { RequestHandler } from "express";
import { getAuthHeaders, invalidateTokenCache } from "../services/azureAuth";

/**
 * Build the OData base URL from Dataverse resource
 * The DATAVERSE_RESOURCE env var contains the organization endpoint
 * Examples:
 * - https://org2a23f983.crm15.dynamics.com/.default (with /.default for OAuth v2.0)
 * - https://org2a23f983.crm15.dynamics.com/ (without suffix)
 */
function getODataBaseUrl(): string {
  const resource = process.env.DATAVERSE_RESOURCE;

  if (resource && resource.includes("dynamics.com")) {
    // Remove /.default or trailing slash if present to get the clean endpoint
    const cleanResource = resource
      .replace(/\/\.default\/?$/, "") // Remove /.default suffix
      .replace(/\/$/, ""); // Remove trailing slash

    // Construct the API endpoint
    // Dataverse v9.2 API: https://[org].crm[region].dynamics.com/api/data/v9.2
    return `${cleanResource}/api/data/v9.2`;
  }

  // Fallback to public portal endpoint (for non-Dataverse scenarios)
  console.warn("[OData] DATAVERSE_RESOURCE not properly configured, using fallback portal endpoint");
  return "https://ecavendorhubspa.powerappsportals.com/_api";
}

const ODATA_BASE_URL = getODataBaseUrl();

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
    const url = `${ODATA_BASE_URL}/prmtk_websitecontents${queryString}`;

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
      `${ODATA_BASE_URL}/prmtk_websitecontents?` +
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
      `${ODATA_BASE_URL}/prmtk_websitecontents?` +
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
      `${ODATA_BASE_URL}/prmtk_engagements?` +
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
      `${ODATA_BASE_URL}/prmtk_candidateengagementnames(${id})?` +
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

    const url = `${ODATA_BASE_URL}/prmtk_candidateengagementnames(${id})`;

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
      `${ODATA_BASE_URL}/prmtk_candidateengagementnames?` +
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
      `${ODATA_BASE_URL}/prmtk_engagements(${id})?` +
      `$select=prmtk_engagementid,prmtk_engagementname,prmtk_description,prmtk_startdate,prmtk_enddate,prmtk_status,_prmtk_ecaengagementmanager_value,_prmtk_vendor_value,prmtk_uniqueid,prmtk_type,createdon,modifiedon,statuscode`;

    console.log("[OData Proxy] Fetching Engagement by ID:", id);

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

    const url = `${ODATA_BASE_URL}/prmtk_engagements(${id})`;

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

    let url =
      `${ODATA_BASE_URL}/prmtk_engagementcontacts?` +
      `$select=prmtk_engagementcontactid,prmtk_id,prmtk_email,prmtk_phonenumber,prmtk_status,prmtk_uaeresident,_prmtk_engagement_value,_prmtk_vendor_value,createdon,modifiedon,statuscode&` +
      `$orderby=prmtk_id%20asc`;

    // If vendor ID provided, filter by prmtk_vendor column
    if (vendorId) {
      const filterExpression = encodeURIComponent(`_prmtk_vendor_value eq '${vendorId}'`);
      url += `&$filter=${filterExpression}`;
      console.log(
        "[OData Proxy] Fetching Engagement Contacts for vendor:",
        vendorId
      );
    } else {
      console.log("[OData Proxy] Fetching all Engagement Contacts from CRM Dataverse");
    }

    console.log("[OData Proxy] URL:", url);

    // Use authenticated request to get CRM data with proper OAuth token
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `[OData Proxy] CRM API returned status ${response.status}: ${response.statusText}`,
      );
      const errorText = await response.text();
      console.error("[OData Proxy] Error response:", errorText);
      throw new Error(
        `CRM API returned ${response.status}: ${response.statusText}`,
      );
    }

    const data = await response.json();

    console.log("[OData Proxy] Engagement Contacts API Response:", {
      status: response.status,
      hasValue: !!data.value,
      itemCount: data.value ? data.value.length : 0,
      firstItem: data.value && data.value.length > 0 ? data.value[0] : null,
    });

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Engagement Contacts Error:", error);
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

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

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
      `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})?` +
      `$select=prmtk_engagementcontactid,prmtk_id,prmtk_email,prmtk_phonenumber,prmtk_status,prmtk_personalphoto,prmtk_uaeresident,prmtk_cvfile_name,prmtk_introductiondocument_name,prmtk_educationalcertificate_name,prmtk_eid_name,prmtk_salarycertificate_name,prmtk_passport_name,prmtk_experienceletter_name,prmtk_policeclearance_name,createdon,modifiedon,statuscode`;

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

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

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

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

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

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})/${fieldName}/$value`;

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
    const { prmtk_id, prmtk_email, prmtk_phonenumber, prmtk_uaeresident } =
      req.body;

    if (!prmtk_id) {
      return res.status(400).json({ error: "Name (prmtk_id) is required" });
    }

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts`;

    console.log("[OData Proxy] Creating new Engagement Contact");

    // Build the create payload
    const createData: Record<string, any> = {
      prmtk_id: prmtk_id,
    };
    if (prmtk_email !== undefined) createData.prmtk_email = prmtk_email;
    if (prmtk_phonenumber !== undefined)
      createData.prmtk_phonenumber = prmtk_phonenumber;
    if (prmtk_uaeresident !== undefined)
      createData.prmtk_uaeresident = prmtk_uaeresident;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Add authentication if available from environment
    if (process.env.POWER_APPS_USERNAME && process.env.POWER_APPS_PASSWORD) {
      const credentials = Buffer.from(
        `${process.env.POWER_APPS_USERNAME}:${process.env.POWER_APPS_PASSWORD}`,
      ).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(createData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[OData Proxy] Create Error Response:",
        response.status,
        errorText,
      );
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}. Details: ${errorText}`,
      );
    }

    const responseData = await response.json();
    console.log("[OData Proxy] Successfully created Engagement Contact");

    res.json({
      success: true,
      message: "Engagement Contact created successfully",
      id: responseData.prmtk_engagementcontactid,
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

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})`;

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
    const updateUrl = `${ODATA_BASE_URL}/prmtk_candidateengagementnames(${id})`;

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
    const updateUrl = `${ODATA_BASE_URL}/contacts(${id})`;

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
    const fetchUrl = `${ODATA_BASE_URL}/contacts(${id})?$select=contactid,firstname,lastname,emailaddress1,telephone1,mobilephone,createdon,statecode,statuscode,preferredcontactmethodcode`;

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
      const bridgeQueryUrl = `${ODATA_BASE_URL}/prmtk_vendorcontactses?$filter=_prmtk_contact_value eq ${id}&$select=_prmtk_vendor_value,createdon&$orderby=createdon asc&$top=1`;

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
            const vendorDetailUrl = `${ODATA_BASE_URL}/prmtk_vendors(${vendorLookupId})?$select=prmtk_vendorid,prmtk_name`;

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
