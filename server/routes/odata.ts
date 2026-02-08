import { RequestHandler } from "express";

const ODATA_BASE_URL = "https://ecavendorhubspa.powerappsportals.com/_api";

interface ODataQuery {
  filter?: string;
  select?: string;
  orderby?: string;
  top?: number;
  skip?: number;
}

/**
 * Build OData query string from parameters
 */
function buildODataQuery(query: ODataQuery): string {
  const params: string[] = [];

  if (query.filter) params.push(`$filter=${encodeURIComponent(query.filter)}`);
  if (query.select) params.push(`$select=${encodeURIComponent(query.select)}`);
  if (query.orderby) params.push(`$orderby=${encodeURIComponent(query.orderby)}`);
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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
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
 */
export const handleGetFAQ: RequestHandler = async (req, res) => {
  try {
    const url =
      `${ODATA_BASE_URL}/prmtk_websitecontents?` +
      `$filter=prmtk_section%20eq%202&` +
      `$select=prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_section,createdon,modifiedon,statuscode&` +
      `$orderby=importsequencenumber%20asc`;

    console.log("[OData Proxy] Fetching FAQ from Power Apps");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] FAQ Error:", error);
    res.status(500).json({
      error: "Failed to fetch FAQ content",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Manuals content (prmtk_section eq 3)
 * GET /api/odata/manuals
 */
export const handleGetManuals: RequestHandler = async (req, res) => {
  try {
    const url =
      `${ODATA_BASE_URL}/prmtk_websitecontents?` +
      `$filter=prmtk_section%20eq%203&` +
      `$select=prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_category,prmtk_section,createdon,modifiedon,statuscode&` +
      `$orderby=importsequencenumber%20asc`;

    console.log("[OData Proxy] Fetching Manuals from Power Apps");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Manuals Error:", error);
    res.status(500).json({
      error: "Failed to fetch Manuals content",
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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("[OData Proxy] Response Status:", response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("[OData Proxy] Response Error Body:", errorText);
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log("[OData Proxy] Successfully fetched Open Role, available fields:", Object.keys(data));

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Open Role by ID Error:", error);
    res.status(500).json({
      error: "Failed to fetch Open Role",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Open Roles for an Engagement
 * GET /api/odata/open-roles/:engagementId
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

    console.log("[OData Proxy] Fetching Open Roles for Engagement:", engagementId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Open Roles Error:", error);
    res.status(500).json({
      error: "Failed to fetch Open Roles",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get single Engagement by ID
 * GET /api/odata/engagements/:id
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

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Engagement by ID Error:", error);
    res.status(500).json({
      error: "Failed to fetch Engagement",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get all Engagement Contacts
 * GET /api/odata/engagement-contacts
 */
export const handleGetEngagementContacts: RequestHandler = async (req, res) => {
  try {
    const url =
      `${ODATA_BASE_URL}/prmtk_engagementcontacts?` +
      `$select=prmtk_engagementcontactid,prmtk_id,prmtk_email,prmtk_phonenumber,prmtk_status,prmtk_uaeresident,_prmtk_engagement_value,createdon,modifiedon,statuscode&` +
      `$orderby=prmtk_id%20asc`;

    console.log("[OData Proxy] Fetching all Engagement Contacts from Power Apps");
    console.log("[OData Proxy] URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[OData Proxy] API returned status ${response.status}: ${response.statusText}`);
      const errorText = await response.text();
      console.error("[OData Proxy] Error response:", errorText);
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
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
      error: "Failed to fetch Engagement Contacts",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Engagement Contact Personal Photo
 * GET /api/odata/engagement-contact-photo/:id
 */
export const handleGetEngagementContactPhoto: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

    console.log("[OData Proxy] Fetching contact photo for ID:", id);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData Proxy] Photo not found for contact:", id);
        return res.status(404).json({ error: "Photo not found" });
      }
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();

    // Get content type from response headers
    const contentType = response.headers.get("content-type") || "image/jpeg";

    console.log("[OData Proxy] Successfully fetched contact photo, size:", buffer.byteLength, "bytes");

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
 */
export const handleGetCandidateContact: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Candidate Contact ID is required" });
    }

    const url =
      `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})?` +
      `$select=prmtk_engagementcontactid,prmtk_id,prmtk_email,prmtk_phonenumber,prmtk_status,prmtk_personalphoto,prmtk_uaeresident,prmtk_cvfile_name,prmtk_introductiondocument_name,prmtk_educationalcertificate_name,prmtk_eid_name,prmtk_salarycertificate_name,prmtk_passport_name,prmtk_experienceletter_name,prmtk_policeclearance_name,createdon,modifiedon,statuscode`;

    console.log("[OData Proxy] Fetching Candidate Contact by ID:", id);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Add cache headers for performance
    res.set("Cache-Control", "public, max-age=300"); // Cache for 5 minutes
    res.json(data);
  } catch (error) {
    console.error("[OData Proxy] Candidate Contact by ID Error:", error);
    res.status(500).json({
      error: "Failed to fetch Candidate Contact",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
};

/**
 * Get Candidate Contact Personal Photo
 * GET /api/odata/candidate-contact-photo/:id
 */
export const handleGetCandidateContactPhoto: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})/prmtk_personalphoto/$value`;

    console.log("[OData Proxy] Fetching candidate contact photo for ID:", id);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "image/*",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData Proxy] Photo not found for candidate contact:", id);
        return res.status(404).json({ error: "Photo not found" });
      }
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    // Get the image buffer
    const buffer = await response.arrayBuffer();

    // Get content type from response headers
    const contentType = response.headers.get("content-type") || "image/jpeg";

    console.log("[OData Proxy] Successfully fetched candidate contact photo, size:", buffer.byteLength, "bytes");

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
export const handleGetEngagementContactDocument: RequestHandler = async (req, res) => {
  try {
    const { id, fieldName } = req.params;

    if (!id || !fieldName) {
      return res.status(400).json({ error: "Contact ID and field name are required" });
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

    console.log("[OData Proxy] Fetching document for ID:", id, "Field:", fieldName);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData Proxy] Document not found for contact:", id, "Field:", fieldName);
        return res.status(404).json({ error: "Document not found" });
      }
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}`
      );
    }

    // Get the document buffer
    const buffer = await response.arrayBuffer();

    // Get content type from response headers - for documents, often application/octet-stream
    const contentType = response.headers.get("content-type") || "application/octet-stream";

    // Try to extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get("content-disposition") || "";

    console.log("[OData Proxy] Successfully fetched document, size:", buffer.byteLength, "bytes");

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
export const handleCreateEngagementContact: RequestHandler = async (req, res) => {
  try {
    const { prmtk_id, prmtk_email, prmtk_phonenumber, prmtk_uaeresident } = req.body;

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
    if (prmtk_phonenumber !== undefined) createData.prmtk_phonenumber = prmtk_phonenumber;
    if (prmtk_uaeresident !== undefined) createData.prmtk_uaeresident = prmtk_uaeresident;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Add authentication if available from environment
    if (process.env.POWER_APPS_USERNAME && process.env.POWER_APPS_PASSWORD) {
      const credentials = Buffer.from(
        `${process.env.POWER_APPS_USERNAME}:${process.env.POWER_APPS_PASSWORD}`
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
      console.error("[OData Proxy] Create Error Response:", response.status, errorText);
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}. Details: ${errorText}`
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
export const handleUpdateCandidateContact: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { prmtk_id, prmtk_email, prmtk_phonenumber, prmtk_uaeresident } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Contact ID is required" });
    }

    const url = `${ODATA_BASE_URL}/prmtk_engagementcontacts(${id})`;

    console.log("[OData Proxy] Updating Engagement Contact by ID:", id);

    // Build the update payload
    const updateData: Record<string, any> = {};
    if (prmtk_id !== undefined) updateData.prmtk_id = prmtk_id;
    if (prmtk_email !== undefined) updateData.prmtk_email = prmtk_email;
    if (prmtk_phonenumber !== undefined) updateData.prmtk_phonenumber = prmtk_phonenumber;
    if (prmtk_uaeresident !== undefined) updateData.prmtk_uaeresident = prmtk_uaeresident;

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Add authentication if available from environment
    if (process.env.POWER_APPS_USERNAME && process.env.POWER_APPS_PASSWORD) {
      const credentials = Buffer.from(
        `${process.env.POWER_APPS_USERNAME}:${process.env.POWER_APPS_PASSWORD}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OData Proxy] Update Error Response:", response.status, errorText);
      throw new Error(
        `OData API returned ${response.status}: ${response.statusText}. Details: ${errorText}`
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
