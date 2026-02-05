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
 * Fetch all website content (not just FAQ)
 * Useful for fetching other sections like Manuals, etc.
 */
export async function fetchWebsiteContent(
  sectionFilter?: number
): Promise<ODataFAQItem[]> {
  try {
    let url = `${ODATA_BASE_URL}/prmtk_websitecontents`;

    if (sectionFilter !== undefined) {
      url += `?$filter=prmtk_section eq ${sectionFilter}`;
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
