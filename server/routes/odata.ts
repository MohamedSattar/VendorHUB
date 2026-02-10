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

    // Note: Formatted values are automatically included in OData responses

    console.log("[OData Proxy] Fetching Engagements from Power Apps");

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

    console.log("[OData Proxy] Engagements API Response:", {
      status: response.status,
      hasValue: !!data.value,
      itemCount: data.value ? data.value.length : 0,
    });

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
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
    const response = await makeAuthenticatedRequest(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
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

    // Build update payload with only provided fields
    const updatePayload: Record<string, any> = {};
    if (prmtk_rolename !== undefined) updatePayload.prmtk_rolename = prmtk_rolename;
    if (prmtk_currenttitle !== undefined) updatePayload.prmtk_currenttitle = prmtk_currenttitle;
    if (prmtk_proposedtitle !== undefined) updatePayload.prmtk_proposedtitle = prmtk_proposedtitle;
    if (prmtk_currentsalaryaed !== undefined) updatePayload.prmtk_currentsalaryaed = prmtk_currentsalaryaed;
    if (prmtk_proposedsalaryaed !== undefined) updatePayload.prmtk_proposedsalaryaed = prmtk_proposedsalaryaed;
    if (prmtk_status !== undefined) updatePayload.prmtk_status = prmtk_status;
    if (prmtk_readyforsubmission !== undefined) updatePayload.prmtk_readyforsubmission = prmtk_readyforsubmission;

    console.log("[OData Proxy] Update Payload:", JSON.stringify(updatePayload, null, 2));

    // Use authenticated request
    const response = await makeAuthenticatedRequest(url, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify(updatePayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OData Proxy] Update failed:", response.status, errorText);
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

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
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

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
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

    // Update the open role with the assigned candidate
    // Note: Cannot directly update Entity Reference properties (_prmtk_candidate_value)
    // Must use navigation properties instead
    const updateUrl = `${ODATA_BASE_URL}/prmtk_candidateengagementnames(${id})`;

    // First, update the non-reference fields (prmtk_name)
    const updatePayload: Record<string, any> = {
      prmtk_name: candidateName,
    };

    // If form data is provided, update candidate contact with new information
    if (formData) {
      console.log(
        "[OData Proxy] Form data provided for candidate update:",
        formData,
      );
      // Could add additional fields here if needed
    }

    console.log("[OData Proxy] Update URL:", updateUrl);
    console.log("[OData Proxy] Update Payload:", JSON.stringify(updatePayload, null, 2));

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
        "[OData Proxy] Update failed:",
        updateResponse.status,
        errorText,
      );
      throw new Error(
        `Failed to update open role: ${updateResponse.status} ${updateResponse.statusText}`,
      );
    }

    // Now set the candidate reference using navigation property
    // For Dynamics, Entity Reference updates must use the /ref navigation
    // The lookup column is prmtk_candidate
    const refUrl = `${ODATA_BASE_URL}/prmtk_candidateengagementnames(${id})/prmtk_candidate/$ref`;
    const refPayload = {
      "@odata.id": `${ODATA_BASE_URL}/prmtk_engagementcontacts(${candidateId})`,
    };

    console.log("[OData Proxy] Setting candidate reference via navigation property");
    console.log("[OData Proxy] Reference URL:", refUrl);
    console.log("[OData Proxy] Reference Payload:", JSON.stringify(refPayload, null, 2));

    const refResponse = await makeAuthenticatedRequest(refUrl, {
      method: "PUT",
      headers: {
        Accept: "application/json",
      },
      body: JSON.stringify(refPayload),
    });

    if (!refResponse.ok) {
      const refErrorText = await refResponse.text();
      console.error(
        "[OData Proxy] Reference update failed:",
        refResponse.status,
        refErrorText,
      );
      throw new Error(
        `Failed to set candidate reference: ${refResponse.status} ${refResponse.statusText}`,
      );
    }

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
