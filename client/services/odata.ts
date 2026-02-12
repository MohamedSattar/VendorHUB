/**
 * OData Service for Power Apps Portal API
 * Handles fetching website content from the Power Apps portal via backend proxy
 * This avoids CORS issues by routing through our Express server
 */

// Use backend proxy instead of direct API calls to avoid CORS issues
const ODATA_PROXY_URL = "/api/odata";

/**
 * Get the Dataverse organization URL from environment or build from common patterns
 * This is used to construct direct image URLs
 */
function getDataverseOrgUrl(): string {
  // Try to get from environment variable (would need to be exposed via Vite)
  const envUrl = import.meta.env.VITE_DATAVERSE_ORG_URL;
  if (envUrl) {
    return envUrl;
  }

  // Fallback to known organization URL
  return "https://org2a23f983.crm15.dynamics.com";
}

/**
 * Build a Dynamics image download URL for entity attributes
 * Format: https://org.crm.dynamics.com/Image/download.aspx?Entity={entity}&Attribute={attribute}&Id={id}&Timestamp={timestamp}&full=true
 */
function buildDynamicsImageUrl(
  entity: string,
  attribute: string,
  id: string,
  modifiedOn?: string
): string {
  const orgUrl = getDataverseOrgUrl();

  // Convert modifiedOn date to Windows FileTime format timestamp
  // If modifiedOn is not provided, use current time
  let timestamp = "";
  if (modifiedOn) {
    try {
      const date = new Date(modifiedOn);
      // Windows FileTime is 100-nanosecond intervals since 1601-01-01
      // JavaScript dates are milliseconds since 1970-01-01
      // Difference: 11644473600000 milliseconds
      const fileTime = BigInt(date.getTime() + 11644473600000) * BigInt(10000);
      timestamp = fileTime.toString();
    } catch {
      // If date parsing fails, use current time
      const now = new Date();
      const fileTime = BigInt(now.getTime() + 11644473600000) * BigInt(10000);
      timestamp = fileTime.toString();
    }
  } else {
    // Use current time if modifiedOn not provided
    const now = new Date();
    const fileTime = BigInt(now.getTime() + 11644473600000) * BigInt(10000);
    timestamp = fileTime.toString();
  }

  const params = new URLSearchParams({
    Entity: entity,
    Attribute: attribute,
    Id: id,
    Timestamp: timestamp,
    full: "true",
  });

  return `${orgUrl}/Image/download.aspx?${params.toString()}`;
}

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
  vendorId?: string; // Vendor ID for filtering
  contractNumber?: string;
  contractDescription?: string;
  typeOfEngagement?: string;
  createdOn: string;
  modifiedOn: string;
}

export interface CandidateDetail {
  id: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  personalPhoto?: string;
  uaeResident?: boolean | null;
  cvFile?: string;
  introductionDocument?: string;
  educationalCertificate?: string;
  eid?: string;
  salaryCertificate?: string;
  passport?: string;
  experienceLetter?: string;
  policeClearance?: string;
  createdOn: string;
  modifiedOn: string;
}

export interface EngagementContact {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  personalPhoto?: string;
  status: "Assigned" | "Not Assigned";
  engagementId?: string;
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
  candidateId?: string;
  candidateDetails?: CandidateDetail;
  designation?: string;
  designationArabic?: string;
  currentSalary?: number;
  proposedSalary?: number;
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
  prmtk_personalphoto?: string;
  prmtk_uaeresident?: boolean | null;
  prmtk_cvfile?: string;
  prmtk_introductiondocument?: string;
  prmtk_educationalcertificate?: string;
  prmtk_eid?: string;
  prmtk_salarycertificate?: string;
  prmtk_passport?: string;
  prmtk_experienceletter?: string;
  prmtk_policeclearance?: string;
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
  prmtk_currenttitle?: string;
  prmtk_proposedtitle?: string;
  prmtk_currentsalaryaed?: number;
  prmtk_proposedsalaryaed?: number;
  prmtk_name?: string;
  createdon: string;
  modifiedon: string;
  statuscode: number;
}

interface ODataEngagementContact {
  prmtk_engagementcontactid: string;
  prmtk_id: string;
  prmtk_email?: string;
  prmtk_phonenumber?: string;
  prmtk_status?: string;
  "prmtk_status@OData.Community.Display.V1.FormattedValue"?: string;
  prmtk_personalphoto?: string;
  prmtk_uaeresident?: boolean | null;
  _prmtk_engagement_value?: string;
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
        `Failed to fetch FAQ content: ${response.status} ${response.statusText}`,
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
 * Returns category labels instead of numeric values
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
        `Failed to fetch Manuals content: ${response.status} ${response.statusText}`,
      );
    }

    const data: ODataResponse = await response.json();

    console.log("[OData] Raw API response - First item:", data.value[0]);

    // Transform OData response to our Manuals format
    const manualItems: ManualItem[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item: any) => {
        // The backend has already transformed the category value to a formatted label
        // Use the transformed prmtk_category or prmtk_category_formatted
        const categoryLabel = item.prmtk_category || item.prmtk_category_formatted || "General";

        console.log("[OData] Processing manual:", {
          id: item.prmtk_websitecontentid,
          title: item.prmtk_header,
          categoryLabel: categoryLabel,
        });

        return {
          id: item.prmtk_websitecontentid,
          title: item.prmtk_header,
          description: item.prmtk_description,
          category: categoryLabel,
          categoryFormatted: categoryLabel,
          createdOn: item.createdon,
          modifiedOn: item.modifiedon,
          section: item.prmtk_section,
        };
      });

    console.log("[OData] Fetched Manual items:", manualItems.length);
    console.log("[OData] Sample manuals with categories:", manualItems.slice(0, 3));

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
      "prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_section,createdon,modifiedon,statuscode",
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
        `Failed to fetch content: ${response.status} ${response.statusText}`,
      );
    }

    const data: ODataResponse = await response.json();

    // Filter and organize content by header name
    const activeItems = data.value.filter((item) => item.statuscode === 1);

    const findByHeader = (headerName: string): WebsiteContentItem | null => {
      const item = activeItems.find(
        (i) => i.prmtk_header.toLowerCase() === headerName.toLowerCase(),
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
  headerName: string,
): Promise<WebsiteContentItem | null> {
  try {
    // Build query parameters for OData filter
    const params = new URLSearchParams();
    params.append(
      "filter",
      `prmtk_header eq '${headerName.replace(/'/g, "''")}'`,
    );
    params.append(
      "select",
      "prmtk_websitecontentid,prmtk_header,prmtk_description,prmtk_section,createdon,modifiedon,statuscode",
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
        `Failed to fetch content: ${response.status} ${response.statusText}`,
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
  sectionFilter?: number,
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
export async function fetchEngagements(vendorId?: string): Promise<EngagementItem[]> {
  try {
    const url = `${ODATA_PROXY_URL}/engagements`;

    console.log(
      "[OData] Fetching Engagements content via proxy from:",
      url,
      vendorId ? `for vendor: ${vendorId}` : ""
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Engagements content: ${response.status} ${response.statusText}`,
      );
    }

    const data: { value: ODataEngagementItem[] } = await response.json();

    // Transform OData response to our Engagement format
    let engagementItems: EngagementItem[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item: any) => ({
        id: item.prmtk_engagementid,
        name: item.prmtk_engagementname,
        description: item.prmtk_description,
        startDate: item.prmtk_startdate,
        endDate: item.prmtk_enddate,
        // Use formatted status value from API
        status:
          item["prmtk_status@OData.Community.Display.V1.FormattedValue"] ||
          "Pending",
        // Use formatted manager name from API
        ecaEngagementManager:
          item[
            "_prmtk_ecaengagementmanager_value@OData.Community.Display.V1.FormattedValue"
          ] || "Not assigned",
        vendorName:
          item["_prmtk_vendor_value@OData.Community.Display.V1.FormattedValue"],
        contractNumber: item.prmtk_uniqueid,
        contractDescription: item.prmtk_description,
        typeOfEngagement:
          item["prmtk_type@OData.Community.Display.V1.FormattedValue"],
        createdOn: item.createdon,
        modifiedOn: item.modifiedon,
        vendorId: item._prmtk_vendor_value, // Add vendor ID for filtering
      }));

    // Filter by vendor ID if provided
    if (vendorId) {
      engagementItems = engagementItems.filter(
        (item) => item.vendorId === vendorId
      );
      console.log(
        "[OData] Filtered Engagement items for vendor:",
        vendorId,
        "Count:",
        engagementItems.length
      );
    } else {
      console.log("[OData] Fetched all Engagement items:", engagementItems.length);
    }

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
  engagementId: string,
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
        `Failed to fetch Engagement: ${response.status} ${response.statusText}`,
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
      status:
        item["prmtk_status@OData.Community.Display.V1.FormattedValue"] ||
        "Pending",
      ecaEngagementManager:
        item[
          "_prmtk_ecaengagementmanager_value@OData.Community.Display.V1.FormattedValue"
        ] || "Not assigned",
      vendorName:
        item["_prmtk_vendor_value@OData.Community.Display.V1.FormattedValue"],
      contractNumber: item.prmtk_uniqueid,
      contractDescription: item.prmtk_description,
      typeOfEngagement:
        item["prmtk_type@OData.Community.Display.V1.FormattedValue"],
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
  openRoleId: string,
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
        `Failed to fetch Open Role: ${response.status} ${response.statusText}`,
      );
    }

    const item: any = await response.json();

    // Transform OData response to our OpenRole format
    const openRole: OpenRole = {
      id: item.prmtk_candidateengagementnameid,
      name: item.prmtk_rolename,
      candidateName:
        item[
          "_prmtk_candidate_value@OData.Community.Display.V1.FormattedValue"
        ] || item.prmtk_name,
      expectedStartDate: item.prmtk_startdate,
      status:
        item["prmtk_status@OData.Community.Display.V1.FormattedValue"] ||
        "Open",
      readyForSubmission: item.prmtk_readyforsubmission,
      candidateId: item._prmtk_candidate_value,
      candidateContactId: item._prmtk_engagementcontact_value,
      designation: item.prmtk_currenttitle || undefined,
      designationArabic: item.prmtk_proposedtitle || undefined,
      currentSalary: item.prmtk_currentsalaryaed || undefined,
      proposedSalary: item.prmtk_proposedsalaryaed || undefined,
      createdOn: item.createdon,
      modifiedOn: item.modifiedon,
    };

    console.log(
      "[OData] Fetched Open Role with candidateId:",
      openRole.candidateId,
    );

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
  contactId: string,
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
        `Failed to fetch Candidate Contact: ${response.status} ${response.statusText}`,
      );
    }

    const item: any = await response.json();

    console.log("[OData] Raw API response for Candidate Contact:", {
      id: item.prmtk_engagementcontactid,
      fields: Object.keys(item),
      rawData: item,
    });

    // Transform OData response to our CandidateDetail format
    const candidateDetail: CandidateDetail = {
      id: item.prmtk_engagementcontactid,
      name: item.prmtk_id,
      email: item.prmtk_email,
      phoneNumber: item.prmtk_phonenumber,
      status:
        item["prmtk_status@OData.Community.Display.V1.FormattedValue"] ||
        "Unknown",
      // Use backend proxy to fetch the image (avoids CORS issues)
      personalPhoto: `/api/odata/candidate-contact-photo/${item.prmtk_engagementcontactid}`,
      uaeResident: item.prmtk_uaeresident,
      cvFile: item.prmtk_cvfile_name,
      introductionDocument: item.prmtk_introductiondocument_name,
      educationalCertificate: item.prmtk_educationalcertificate_name,
      eid: item.prmtk_eid_name,
      salaryCertificate: item.prmtk_salarycertificate_name,
      passport: item.prmtk_passport_name,
      experienceLetter: item.prmtk_experienceletter_name,
      policeClearance: item.prmtk_policeclearance_name,
      createdOn: item.createdon,
      modifiedOn: item.modifiedon,
    };

    console.log("[OData] Fetched Candidate Contact:", {
      ...candidateDetail,
      documents: {
        cvFile: candidateDetail.cvFile,
        introductionDocument: candidateDetail.introductionDocument,
        educationalCertificate: candidateDetail.educationalCertificate,
        eid: candidateDetail.eid,
        salaryCertificate: candidateDetail.salaryCertificate,
        passport: candidateDetail.passport,
        experienceLetter: candidateDetail.experienceLetter,
        policeClearance: candidateDetail.policeClearance,
      },
    });

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
  engagementId: string,
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
        `Failed to fetch Open Roles: ${response.status} ${response.statusText}`,
      );
    }

    const data: { value: ODataOpenRole[] } = await response.json();

    // Transform OData response to our OpenRole format
    const openRoles: OpenRole[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item: any) => {
        // Get candidate name from formatted value annotation or fallback to direct mapping
        const candidateName =
          item["_prmtk_candidate_value@OData.Community.Display.V1.FormattedValue"] ||
          item.prmtk_name ||
          item._prmtk_candidate_value;

        return {
          id: item.prmtk_candidateengagementnameid,
          name: item.prmtk_rolename,
          candidateName: candidateName,
          expectedStartDate: item.prmtk_startdate,
          status:
            item["prmtk_status@OData.Community.Display.V1.FormattedValue"] ||
            "Open",
          readyForSubmission: item.prmtk_readyforsubmission,
          candidateId: item._prmtk_candidate_value,
          candidateContactId: item._prmtk_engagementcontact_value,
          designation: item.prmtk_currenttitle,
          designationArabic: item.prmtk_proposedtitle,
          currentSalary: item.prmtk_currentsalaryaed,
          proposedSalary: item.prmtk_proposedsalaryaed,
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

/**
 * Fetch all Engagement Contacts from Power Apps OData API via backend proxy
 * Returns all contacts with status (Assigned/Not Assigned) based on active engagements
 */
export async function fetchEngagementContacts(vendorId?: string): Promise<EngagementContact[]> {
  try {
    const params = new URLSearchParams();
    if (vendorId) {
      params.append("vendorId", vendorId);
    }

    const url = `${ODATA_PROXY_URL}/engagement-contacts${params.toString() ? `?${params.toString()}` : ""}`;

    console.log(
      "[OData] Fetching Engagement Contacts via proxy from:",
      url,
      vendorId ? `for vendor: ${vendorId}` : "",
    );

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[OData] Engagement Contacts API error:", {
        status: response.status,
        statusText: response.statusText,
        errorBody: errorText.substring(0, 500),
      });
      throw new Error(
        `Failed to fetch Engagement Contacts: ${response.status} ${response.statusText}`,
      );
    }

    const data: { value: ODataEngagementContact[] } = await response.json();

    // Handle empty or missing data
    if (!data.value) {
      console.log("[OData] No engagement contacts returned from API");
      return [];
    }

    console.log("[OData] Raw API response:", {
      hasValue: !!data.value,
      itemCount: data.value.length,
      firstItem: data.value[0],
    });

    // Transform OData response to our EngagementContact format
    const contacts: EngagementContact[] = data.value
      .filter((item) => item.statuscode === 1) // Only active items
      .map((item: any) => {
        const transformed = {
          id: item.prmtk_engagementcontactid,
          name: item.prmtk_id,
          email: item.prmtk_email,
          phoneNumber: item.prmtk_phonenumber,
          // Use backend proxy to fetch the image (avoids CORS issues)
          personalPhoto: `/api/odata/engagement-contact-photo/${item.prmtk_engagementcontactid}`,
          // If engagement ID is present, contact is assigned; otherwise not assigned
          status: item._prmtk_engagement_value ? "Assigned" : "Not Assigned",
          engagementId: item._prmtk_engagement_value,
          createdOn: item.createdon,
          modifiedOn: item.modifiedon,
        };
        console.log("[OData] Transformed contact:", transformed);
        return transformed;
      });

    console.log(
      "[OData] Fetched Engagement Contacts:",
      contacts.length,
      contacts,
    );

    return contacts;
  } catch (error) {
    console.error("[OData] Error fetching Engagement Contacts:", error);
    throw error;
  }
}

/**
 * Update an open role with a selected candidate assignment
 */
export async function assignCandidateToOpenRole(
  openRoleId: string,
  candidateId: string,
  candidateName: string,
  formData?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    uaeResident?: boolean | null;
  },
): Promise<OpenRole> {
  try {
    const response = await fetch(
      `/api/odata/open-role/${openRoleId}/assign-candidate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateId,
          candidateName,
          candidateContactId: candidateId,
          formData,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to assign candidate");
    }

    const data = await response.json();
    console.log("[OData] Successfully assigned candidate to open role:", data);
    return data;
  } catch (error) {
    console.error("[OData] Error assigning candidate:", error);
    throw error;
  }
}
