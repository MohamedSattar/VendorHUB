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
  categoryFormatted?: string;
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

export interface AboutPageContent {
  mission: WebsiteContentItem | null;
  whatWeDo: WebsiteContentItem | null;
  email: WebsiteContentItem | null;
  hours: WebsiteContentItem | null;
}

export interface EngagementItem {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
  ecaEngagementManager: string;
  vendorName?: string;
  contractNumber?: string;
  contractDescription?: string;
  typeOfEngagement?: string;
  createdOn: string;
  modifiedOn: string;
}

export interface CandidateDetail {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  title?: string;
  organization?: string;
  createdOn: string;
  modifiedOn: string;
}

export interface OpenRole {
  id: string;
  name: string;
  candidateName?: string;
  expectedStartDate: string;
  status: string;
  readyForSubmission?: boolean | null;
  candidateContactId?: string;
  candidateDetails?: CandidateDetail;
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

interface ODataManualItem extends ODataFAQItem {
  prmtk_category?: string;
  prmtk_category_expanded?: {
    prmtk_categoryid: string;
    prmtk_name: string;
  };
  ["prmtk_category@OData.Community.Display.V1.FormattedValue"]?: string;
}

interface ODataEngagementItem {
  prmtk_engagementid: string;
  prmtk_engagementname: string;
  prmtk_description?: string;
  prmtk_startdate: string;
  prmtk_enddate: string;
  prmtk_status?: number;
  "prmtk_status@OData.Community.Display.V1.FormattedValue"?: string;
  _prmtk_ecaengagementmanager_value?: string;
  "_prmtk_ecaengagementmanager_value@OData.Community.Display.V1.FormattedValue"?: string;
  _prmtk_vendor_value?: string;
  "_prmtk_vendor_value@OData.Community.Display.V1.FormattedValue"?: string;
  prmtk_uniqueid?: string;
  prmtk_type?: string;
  "prmtk_type@OData.Community.Display.V1.FormattedValue"?: string;
  createdon: string;
  modifiedon: string;
  statuscode: number;
}

interface ODataCandidateDetail {
  prmtk_engagementcontactid: string;
  prmtk_firstname?: string;
  prmtk_lastname?: string;
  prmtk_email?: string;
  prmtk_phone?: string;
  prmtk_title?: string;
  prmtk_organization?: string;
  createdon: string;
  modifiedon: string;
  statuscode: number;
}

interface ODataOpenRole {
  prmtk_candidateengagementnameid: string;
  prmtk_rolename: string;
  prmtk_startdate: string;
  prmtk_enddate?: string;
  prmtk_status?: number;
  "prmtk_status@OData.Community.Display.V1.FormattedValue"?: string;
  prmtk_readyforsubmission?: boolean | null;
  _prmtk_candidate_value?: string;
  "_prmtk_candidate_value@OData.Community.Display.V1.FormattedValue"?: string;
  _prmtk_engagementcontact_value?: string;
  prmtk_name?: string;
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
      .map((item: any) => {
        // Try to get formatted category value, fallback to raw value or default
        const formattedValue = item["prmtk_category@OData.Community.Display.V1.FormattedValue"];
        const categoryValue = formattedValue || item.prmtk_category || "General";

        return {
          id: item.prmtk_websitecontentid,
          title: item.prmtk_header,
          description: item.prmtk_description,
          category: categoryValue,
          categoryFormatted: formattedValue,
          createdOn: item.createdon,
          modifiedOn: item.modifiedon,
          section: item.prmtk_section,
        };
      });

    console.log("[OData] Fetched Manual items:", manualItems.length);

    return manualItems;
  } catch (error) {
    console.error("[OData] Error fetching Manuals:", error);
    throw error;
  }
}

/**
 * Helper function to convert OData item to WebsiteContentItem
 */
function transformODataItem(item: ODataFAQItem): WebsiteContentItem {
  return {
    id: item.prmtk_websitecontentid,
    header: item.prmtk_header,
    description: item.prmtk_description,
    section: item.prmtk_section.toString(),
    createdOn: item.createdon,
    modifiedOn: item.modifiedon,
  };
}

/**
 * Fetch all About page content with a single API call
 * Retrieves Mission, What We Do, Email, and Hours sections
 * Returns null for any section that doesn't exist or is inactive
 */
export async function fetchAboutPageContent(): Promise<AboutPageContent> {
  try {
    // Build query to fetch all content without filters first
    const params = new URLSearchParams();
    params.append(
      "select",
      "prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_section,createdon,modifiedon,statuscode"
    );

    const url = `${ODATA_PROXY_URL}/websitecontents?${params.toString()}`;

    console.log("[OData] Fetching all About page content with single API call");

    const response = await fetch(url, {
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

    // Filter and organize content by header name
    const activeItems = data.value.filter((item) => item.statuscode === 1);

    const findByHeader = (headerName: string): WebsiteContentItem | null => {
      const item = activeItems.find(
        (i) => i.prmtk_header.toLowerCase() === headerName.toLowerCase()
      );
      return item ? transformODataItem(item) : null;
    };

    const aboutContent: AboutPageContent = {
      mission: findByHeader("Our Mission"),
      whatWeDo: findByHeader("What We Do"),
      email: findByHeader("Email"),
      hours: findByHeader("Hours"),
    };

    console.log("[OData] Fetched About page content:", aboutContent);

    return aboutContent;
  } catch (error) {
    console.error("[OData] Error fetching About page content:", error);
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
    // Build query parameters for OData filter
    const params = new URLSearchParams();
    params.append("filter", `prmtk_header eq '${headerName.replace(/'/g, "''")}'`);
    params.append(
      "select",
      "prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_section,createdon,modifiedon,statuscode"
    );
    params.append("top", "1");

    const url = `${ODATA_PROXY_URL}/websitecontents?${params.toString()}`;

    console.log("[OData] Fetching content by header name:", headerName);

    const response = await fetch(url, {
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

    return transformODataItem(item);
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

/**
 * Fetch Engagements content from Power Apps OData API via backend proxy
 * Returns engagement basic details: name, dates, status, manager
 */
export async function fetchEngagements(): Promise<EngagementItem[]> {
  try {
    const url = `${ODATA_PROXY_URL}/engagements`;

    console.log("[OData] Fetching Engagements content via proxy from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Engagements content: ${response.status} ${response.statusText}`
      );
    }

    const data: { value: ODataEngagementItem[] } = await response.json();

    // Transform OData response to our Engagement format
    const engagementItems: EngagementItem[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item: any) => ({
        id: item.prmtk_engagementid,
        name: item.prmtk_engagementname,
        description: item.prmtk_description,
        startDate: item.prmtk_startdate,
        endDate: item.prmtk_enddate,
        // Use formatted status value from API
        status: item["prmtk_status@OData.Community.Display.V1.FormattedValue"] || "Pending",
        // Use formatted manager name from API
        ecaEngagementManager: item["_prmtk_ecaengagementmanager_value@OData.Community.Display.V1.FormattedValue"] || "Not assigned",
        vendorName: item["_prmtk_vendor_value@OData.Community.Display.V1.FormattedValue"],
        contractNumber: item.prmtk_uniqueid,
        contractDescription: item.prmtk_description,
        typeOfEngagement: item["prmtk_type@OData.Community.Display.V1.FormattedValue"],
        createdOn: item.createdon,
        modifiedOn: item.modifiedon,
      }));

    console.log("[OData] Fetched Engagement items:", engagementItems.length);

    return engagementItems;
  } catch (error) {
    console.error("[OData] Error fetching Engagements:", error);
    throw error;
  }
}

/**
 * Fetch single Engagement by ID from Power Apps OData API via backend proxy
 * Returns detailed engagement information
 */
export async function fetchEngagementById(
  engagementId: string
): Promise<EngagementItem | null> {
  try {
    const url = `${ODATA_PROXY_URL}/engagements/${engagementId}`;

    console.log("[OData] Fetching Engagement by ID:", engagementId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData] Engagement not found:", engagementId);
        return null;
      }
      throw new Error(
        `Failed to fetch Engagement: ${response.status} ${response.statusText}`
      );
    }

    const item: ODataEngagementItem = await response.json();

    // Transform OData response to our Engagement format
    const engagement: EngagementItem = {
      id: item.prmtk_engagementid,
      name: item.prmtk_engagementname,
      description: item.prmtk_description,
      startDate: item.prmtk_startdate,
      endDate: item.prmtk_enddate,
      status: item["prmtk_status@OData.Community.Display.V1.FormattedValue"] || "Pending",
      ecaEngagementManager: item["_prmtk_ecaengagementmanager_value@OData.Community.Display.V1.FormattedValue"] || "Not assigned",
      vendorName: item["_prmtk_vendor_value@OData.Community.Display.V1.FormattedValue"],
      contractNumber: item.prmtk_uniqueid,
      contractDescription: item.prmtk_description,
      typeOfEngagement: item["prmtk_type@OData.Community.Display.V1.FormattedValue"],
      createdOn: item.createdon,
      modifiedOn: item.modifiedon,
    };

    console.log("[OData] Fetched Engagement:", engagement);

    return engagement;
  } catch (error) {
    console.error("[OData] Error fetching Engagement by ID:", error);
    throw error;
  }
}

/**
 * Fetch single Open Role by ID from Power Apps OData API via backend proxy
 * Returns detailed open role information
 */
export async function fetchOpenRoleById(
  openRoleId: string
): Promise<OpenRole | null> {
  try {
    const url = `${ODATA_PROXY_URL}/open-role/${openRoleId}`;

    console.log("[OData] Fetching Open Role by ID:", openRoleId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData] Open Role not found:", openRoleId);
        return null;
      }
      throw new Error(
        `Failed to fetch Open Role: ${response.status} ${response.statusText}`
      );
    }

    const item: any = await response.json();

    console.log("[OData] Raw Open Role API Response:", JSON.stringify(item, null, 2));

    // Transform OData response to our OpenRole format
    const openRole: OpenRole = {
      id: item.prmtk_candidateengagementnameid,
      name: item.prmtk_rolename,
      candidateName: item["_prmtk_candidate_value@OData.Community.Display.V1.FormattedValue"] || item.prmtk_name,
      expectedStartDate: item.prmtk_startdate,
      status: item["prmtk_status@OData.Community.Display.V1.FormattedValue"] || "Open",
      readyForSubmission: item.prmtk_readyforsubmission,
      candidateContactId: item._prmtk_engagementcontact_value,
      createdOn: item.createdon,
      modifiedOn: item.modifiedon,
    };

    console.log("[OData] Fetched Open Role:", openRole);

    return openRole;
  } catch (error) {
    console.error("[OData] Error fetching Open Role by ID:", error);
    throw error;
  }
}

/**
 * Fetch Candidate Contact by ID from Power Apps OData API via backend proxy
 * Returns candidate contact information
 */
export async function fetchCandidateContactById(
  contactId: string
): Promise<CandidateDetail | null> {
  try {
    const url = `${ODATA_PROXY_URL}/candidate-contact/${contactId}`;

    console.log("[OData] Fetching Candidate Contact by ID:", contactId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log("[OData] Candidate Contact not found:", contactId);
        return null;
      }
      throw new Error(
        `Failed to fetch Candidate Contact: ${response.status} ${response.statusText}`
      );
    }

    const item: any = await response.json();

    // Transform OData response to our CandidateDetail format
    const candidateDetail: CandidateDetail = {
      id: item.prmtk_engagementcontactid,
      firstName: item.prmtk_firstname,
      lastName: item.prmtk_lastname,
      email: item.prmtk_email,
      phone: item.prmtk_phone,
      title: item.prmtk_title,
      organization: item.prmtk_organization,
      createdOn: item.createdon,
      modifiedOn: item.modifiedon,
    };

    console.log("[OData] Fetched Candidate Contact:", candidateDetail);

    return candidateDetail;
  } catch (error) {
    console.error("[OData] Error fetching Candidate Contact by ID:", error);
    throw error;
  }
}

/**
 * Fetch Open Roles for an Engagement from Power Apps OData API via backend proxy
 * Returns list of open roles/positions needed for the engagement
 */
export async function fetchOpenRoles(
  engagementId: string
): Promise<OpenRole[]> {
  try {
    const url = `${ODATA_PROXY_URL}/open-roles/${engagementId}`;

    console.log("[OData] Fetching Open Roles for Engagement:", engagementId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Open Roles: ${response.status} ${response.statusText}`
      );
    }

    const data: { value: ODataOpenRole[] } = await response.json();

    console.log("[OData] Raw API Response for Open Roles:", JSON.stringify(data.value, null, 2));

    // Transform OData response to our OpenRole format
    const openRoles: OpenRole[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item: any) => {
        console.log("[OData] Processing item with fields:", Object.keys(item));
        return {
          id: item.prmtk_candidateengagementnameid,
          name: item.prmtk_rolename,
          candidateName: item["_prmtk_candidate_value@OData.Community.Display.V1.FormattedValue"] || item.prmtk_name,
          expectedStartDate: item.prmtk_startdate,
          status: item["prmtk_status@OData.Community.Display.V1.FormattedValue"] || "Open",
          readyForSubmission: item.prmtk_readyforsubmission,
          candidateContactId: item.prmtk_engagementcontactid || item._prmtk_engagementcontact_value,
          createdOn: item.createdon,
          modifiedOn: item.modifiedon,
        };
      });

    console.log("[OData] Fetched Open Roles:", openRoles.length);

    return openRoles;
  } catch (error) {
    console.error("[OData] Error fetching Open Roles:", error);
    throw error;
  }
}
