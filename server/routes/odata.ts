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
      `$select=prmtk_engagementid,prmtk_engagementname,prmtk_startdate,prmtk_enddate,prmtk_status,_prmtk_ecaengagementmanager_value,createdon,modifiedon,statuscode&` +
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
      `$select=prmtk_engagementid,prmtk_engagementname,prmtk_description,prmtk_startdate,prmtk_enddate,prmtk_status,_prmtk_ecaengagementmanager_value,_prmtk_vendor_value,prmtk_contractnumber,prmtk_contractdescription,prmtk_typeofengagement,createdon,modifiedon,statuscode`;

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
