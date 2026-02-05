/**
 * OData Service for Power Apps Portal API
 * Handles fetching website content from the Power Apps portal via backend proxy
 * This avoids CORS issues by routing through our Express server
 */

// Use backend proxy instead of direct API calls to avoid CORS issues
const ODATA_PROXY_URL = "/api/odata";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  createdOn: string;
  modifiedOn: string;
  section: number;
}

export interface ManualItem {
  id: string;
  title: string;
  description: string;
  category: string;
  createdOn: string;
  modifiedOn: string;
  section: number;
}

export interface WebsiteContentItem {
  id: string;
  header: string;
  description: string;
  section: string;
  createdOn: string;
  modifiedOn: string;
}

interface ODataResponse {
  value: ODataFAQItem[];
}

interface ODataFAQItem {
  prmtk_websitecontentid: string;
  prmtk_header: string;
  prmtk_description: string;
  prmtk_section: number;
  createdon: string;
  modifiedon: string;
  statuscode: number;
}

/**
 * Fetch FAQ content from Power Apps OData API via backend proxy
 * Filters by prmtk_section = 2 (FAQ section)
 * Uses /api/odata/faq endpoint to avoid CORS issues
 */
export async function fetchFAQContent(): Promise<FAQItem[]> {
  try {
    const url = `${ODATA_PROXY_URL}/faq`;

    console.log("[OData] Fetching FAQ content via proxy from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch FAQ content: ${response.status} ${response.statusText}`
      );
    }

    const data: ODataResponse = await response.json();

    // Transform OData response to our FAQ format
    const faqItems: FAQItem[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item) => ({
        id: item.prmtk_websitecontentid,
        question: item.prmtk_header,
        answer: item.prmtk_description,
        createdOn: item.createdon,
        modifiedOn: item.modifiedon,
        section: item.prmtk_section,
      }));

    console.log("[OData] Fetched FAQ items:", faqItems.length);

    return faqItems;
  } catch (error) {
    console.error("[OData] Error fetching FAQ:", error);
    throw error;
  }
}

/**
 * Fetch Manuals content from Power Apps OData API via backend proxy
 * Filters by prmtk_section = 3 (Manuals section)
 * Uses /api/odata/manuals endpoint to avoid CORS issues
 */
export async function fetchManualsContent(): Promise<ManualItem[]> {
  try {
    const url = `${ODATA_PROXY_URL}/manuals`;

    console.log("[OData] Fetching Manuals content via proxy from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Manuals content: ${response.status} ${response.statusText}`
      );
    }

    const data: ODataResponse = await response.json();

    // Transform OData response to our Manuals format
    const manualItems: ManualItem[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item) => ({
        id: item.prmtk_websitecontentid,
        title: item.prmtk_header,
        description: item.prmtk_description,
        category: item.prmtk_category || "General", // Default category if not set
        createdOn: item.createdon,
        modifiedOn: item.modifiedon,
        section: item.prmtk_section,
      }));

    console.log("[OData] Fetched Manual items:", manualItems.length);

    return manualItems;
  } catch (error) {
    console.error("[OData] Error fetching Manuals:", error);
    throw error;
  }
}

/**
 * Fetch website content by header name
 * Filters by prmtk_header to find specific content records
 * Returns the first matching active record
 */
export async function fetchContentByHeaderName(
  headerName: string
): Promise<WebsiteContentItem | null> {
  try {
    const url = new URL(`${window.location.origin}${ODATA_PROXY_URL}/websitecontents`);
    url.searchParams.append(
      "filter",
      `prmtk_header eq '${headerName.replace(/'/g, "''")}'`
    );
    url.searchParams.append(
      "select",
      "prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_section,createdon,modifiedon,statuscode"
    );
    url.searchParams.append("top", "1");

    console.log("[OData] Fetching content by header name:", headerName);

    const response = await fetch(url.pathname + url.search, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch content: ${response.status} ${response.statusText}`
      );
    }

    const data: ODataResponse = await response.json();

    if (data.value.length === 0) {
      console.log("[OData] No content found with header:", headerName);
      return null;
    }

    const item = data.value[0];

    // Only return active items
    if (item.statuscode !== 1) {
      return null;
    }

    return {
      id: item.prmtk_websitecontentid,
      header: item.prmtk_header,
      description: item.prmtk_description,
      section: item.prmtk_section.toString(),
      createdOn: item.createdon,
      modifiedOn: item.modifiedon,
    };
  } catch (error) {
    console.error("[OData] Error fetching content by header name:", error);
    throw error;
  }
}

/**
 * Fetch all website content via backend proxy
 * Useful for fetching any section from Power Apps OData API
 */
export async function fetchWebsiteContent(
  sectionFilter?: number
): Promise<ODataFAQItem[]> {
  try {
    let url = `${ODATA_PROXY_URL}/websitecontents`;

    if (sectionFilter !== undefined) {
      url += `?filter=prmtk_section eq ${sectionFilter}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status}`);
    }

    const data: ODataResponse = await response.json();
    return data.value.filter((item) => item.statuscode === 1); // Only active items
  } catch (error) {
    console.error("[OData] Error fetching content:", error);
    throw error;
  }
}
