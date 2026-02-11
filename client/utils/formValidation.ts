import { ApplicationFormData } from "@/components/SupplierApplicationForm";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic UAE format)
 */
const isValidPhone = (phone: string): boolean => {
  // Accept formats like +971, 00971, 0, etc.
  const phoneRegex = /^(\+|00)?971|0[0-9]\d{8,9}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ""));
};

/**
 * Validate URL format
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Comprehensive form validation
 */
export const validateSupplierApplicationForm = (
  formData: ApplicationFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Section A: Company Information Validation
  if (!formData.companyName || formData.companyName.trim() === "") {
    errors.push({
      field: "companyName",
      message: "Company name is required",
    });
  }

  if (!formData.yearsInBusiness || parseInt(formData.yearsInBusiness) < 0) {
    errors.push({
      field: "yearsInBusiness",
      message: "Years in business must be a valid positive number",
    });
  }

  if (!formData.numberOfEmployees || parseInt(formData.numberOfEmployees) < 0) {
    errors.push({
      field: "numberOfEmployees",
      message: "Number of employees must be a valid positive number",
    });
  }

  if (!formData.tradeLicenseType) {
    errors.push({
      field: "tradeLicenseType",
      message: "Trade license type is required",
    });
  }

  if (!formData.country || formData.country.trim() === "") {
    errors.push({
      field: "country",
      message: "Country is required",
    });
  }

  if (!formData.city || formData.city.trim() === "") {
    errors.push({
      field: "city",
      message: "City is required",
    });
  }

  if (formData.website === "yes") {
    if (!formData.websiteUrl || formData.websiteUrl.trim() === "") {
      errors.push({
        field: "websiteUrl",
        message: "Website URL is required when answering 'Yes'",
      });
    } else if (!isValidUrl(formData.websiteUrl)) {
      errors.push({
        field: "websiteUrl",
        message: "Website URL must be a valid URL (e.g., https://example.com)",
      });
    }
  }

  // Section B: Operational Capabilities Validation
  if (formData.supplyCategorySelections.length === 0) {
    errors.push({
      field: "supplyCategorySelections",
      message: "Please select at least one supply category",
    });
  }

  // Check for at least one supplier
  const validSuppliers = formData.suppliers.filter((s) => s.name.trim() !== "");
  if (validSuppliers.length < 3) {
    errors.push({
      field: "suppliers",
      message: "All three supplier names are required",
    });
  }

  // Check for at least two client references
  const validReferences = formData.clientReferences.filter((r) => r.name.trim() !== "");
  if (validReferences.length < 2) {
    errors.push({
      field: "clientReferences",
      message: "At least two client references are required",
    });
  }

  // Validate client reference details
  validReferences.forEach((ref, index) => {
    if (!ref.organization || ref.organization.trim() === "") {
      errors.push({
        field: `clientReference_${index}_organization`,
        message: `Reference ${index + 1}: Organization is required`,
      });
    }
    if (!ref.email || !isValidEmail(ref.email)) {
      errors.push({
        field: `clientReference_${index}_email`,
        message: `Reference ${index + 1}: Valid email is required`,
      });
    }
    if (!ref.category || ref.category.trim() === "") {
      errors.push({
        field: `clientReference_${index}_category`,
        message: `Reference ${index + 1}: Category/Service type is required`,
      });
    }
    if (!ref.projectName || ref.projectName.trim() === "") {
      errors.push({
        field: `clientReference_${index}_projectName`,
        message: `Reference ${index + 1}: Project name is required`,
      });
    }
  });

  // Section D: Supplier Declaration Validation
  if (!formData.fullName || formData.fullName.trim() === "") {
    errors.push({
      field: "fullName",
      message: "Full name is required",
    });
  }

  if (!formData.designation || formData.designation.trim() === "") {
    errors.push({
      field: "designation",
      message: "Designation/Position is required",
    });
  }

  if (!formData.phone || !isValidPhone(formData.phone)) {
    errors.push({
      field: "phone",
      message: "Valid phone number is required (UAE format)",
    });
  }

  if (!formData.email || !isValidEmail(formData.email)) {
    errors.push({
      field: "email",
      message: "Valid email address is required",
    });
  }

  if (!formData.date) {
    errors.push({
      field: "date",
      message: "Declaration date is required",
    });
  }

  // Section E: Attachments Validation
  if (!formData.attachments.tradeLicense) {
    errors.push({
      field: "attachments.tradeLicense",
      message: "Trade License attachment is required",
    });
  }

  if (!formData.attachments.companyProfile) {
    errors.push({
      field: "attachments.companyProfile",
      message: "Company Profile attachment is required",
    });
  }

  if (!formData.attachments.powerOfAttorney) {
    errors.push({
      field: "attachments.powerOfAttorney",
      message: "Power of Attorney attachment is required",
    });
  }

  return errors;
};

/**
 * Get validation errors for display
 */
export const getValidationErrorsByField = (
  errors: ValidationError[]
): Record<string, string> => {
  const errorMap: Record<string, string> = {};
  errors.forEach((error) => {
    errorMap[error.field] = error.message;
  });
  return errorMap;
};

/**
 * Check if form is valid
 */
export const isFormValid = (formData: ApplicationFormData): boolean => {
  const errors = validateSupplierApplicationForm(formData);
  return errors.length === 0;
};

/**
 * Map field names to their step number
 */
const FIELD_TO_STEP: Record<string, number> = {
  // Section A: Company Information (Step 0)
  companyName: 0,
  yearsInBusiness: 0,
  numberOfEmployees: 0,
  tradeLicenseType: 0,
  country: 0,
  city: 0,
  website: 0,
  websiteUrl: 0,
  isEmiratiSME: 0,
  isKhalifaFundRegistered: 0,
  hasICVCertificate: 0,
  icvScore: 0,

  // Section B: Operational Capabilities (Step 1)
  hasEnvironmentalPractices: 1,
  environmentalPracticesDetails: 1,
  supplyCategorySelections: 1,
  suppliers: 1,

  // Section C: Quality & Compliance (Step 2)
  hasCertifications: 2,
  certifications: 2,
  otherCertifications: 2,

  // Section B continued: Client References (Step 3)
  clientReferences: 3,

  // Section D: Supplier Declaration (Step 4)
  fullName: 4,
  designation: 4,
  phone: 4,
  email: 4,
  date: 4,

  // Section E: Attachments (Step 5)
  "attachments.tradeLicense": 5,
  "attachments.companyProfile": 5,
  "attachments.powerOfAttorney": 5,
  "attachments.icvCertificate": 5,
};

/**
 * Get step name by step index
 */
export const getStepName = (stepIndex: number): string => {
  const steps = [
    "Company Information",
    "Operational Capabilities",
    "Quality & Compliance",
    "Client References",
    "Supplier Declaration",
    "Mandatory Attachments",
    "Review & Submit",
  ];
  return steps[stepIndex] || "Unknown";
};

/**
 * Group validation errors by step
 */
export const groupErrorsByStep = (
  errors: ValidationError[]
): Record<number, ValidationError[]> => {
  const grouped: Record<number, ValidationError[]> = {};

  errors.forEach((error) => {
    // Try to find the field in the mapping
    let fieldBase = error.field;

    // Handle nested field references (e.g., "clientReference_0_organization")
    if (error.field.includes("clientReference_")) {
      fieldBase = "clientReferences";
    } else if (error.field.startsWith("attachments.")) {
      fieldBase = error.field;
    } else {
      // Extract just the field name before any underscore suffix
      fieldBase = fieldBase.split("_")[0];
    }

    const stepIndex = FIELD_TO_STEP[fieldBase] ?? 6;

    if (!grouped[stepIndex]) {
      grouped[stepIndex] = [];
    }
    grouped[stepIndex].push(error);
  });

  return grouped;
};

/**
 * Get the first step with errors
 */
export const getFirstErrorStep = (
  errors: ValidationError[]
): number | null => {
  if (errors.length === 0) return null;

  const grouped = groupErrorsByStep(errors);
  const steps = Object.keys(grouped).map((s) => parseInt(s));
  return steps.length > 0 ? Math.min(...steps) : null;
};

/**
 * Validate a specific step
 */
export const validateStep = (
  stepIndex: number,
  formData: ApplicationFormData
): ValidationError[] => {
  const allErrors = validateSupplierApplicationForm(formData);
  return allErrors.filter((error) => {
    const grouped = groupErrorsByStep([error]);
    const errorStep = Object.keys(grouped)[0];
    return parseInt(errorStep) === stepIndex;
  });
};

/**
 * Validate Section A: Company Information (Step 0)
 */
export const validateCompanyInformationStep = (
  formData: ApplicationFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.companyName || formData.companyName.trim() === "") {
    errors.push({ field: "companyName", message: "Company name is required" });
  }

  if (!formData.yearsInBusiness || parseInt(formData.yearsInBusiness) < 0) {
    errors.push({ field: "yearsInBusiness", message: "Years in business must be a valid positive number" });
  }

  if (!formData.numberOfEmployees || parseInt(formData.numberOfEmployees) < 0) {
    errors.push({ field: "numberOfEmployees", message: "Number of employees must be a valid positive number" });
  }

  if (!formData.tradeLicenseType) {
    errors.push({ field: "tradeLicenseType", message: "Trade license type is required" });
  }

  if (!formData.country || formData.country.trim() === "") {
    errors.push({ field: "country", message: "Country is required" });
  }

  if (!formData.city || formData.city.trim() === "") {
    errors.push({ field: "city", message: "City is required" });
  }

  if (formData.website === "yes") {
    if (!formData.websiteUrl || formData.websiteUrl.trim() === "") {
      errors.push({ field: "websiteUrl", message: "Website URL is required when answering 'Yes'" });
    } else if (!isValidUrl(formData.websiteUrl)) {
      errors.push({ field: "websiteUrl", message: "Website URL must be a valid URL" });
    }
  }

  return errors;
};

/**
 * Validate Section B: Operational Capabilities (Steps 1 & 3)
 */
export const validateOperationalCapabilitiesStep = (
  formData: ApplicationFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (formData.supplyCategorySelections.length === 0) {
    errors.push({ field: "supplyCategorySelections", message: "Please select at least one supply category" });
  }

  const validSuppliers = formData.suppliers.filter((s) => s.name.trim() !== "");
  if (validSuppliers.length < 3) {
    errors.push({ field: "suppliers", message: "All three supplier names are required" });
  }

  return errors;
};

/**
 * Validate Section B: Client References (Step 3)
 */
export const validateClientReferencesStep = (
  formData: ApplicationFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  const validReferences = formData.clientReferences.filter((r) => r.name.trim() !== "");
  if (validReferences.length < 2) {
    errors.push({ field: "clientReferences", message: "At least two client references are required" });
  }

  validReferences.forEach((ref, index) => {
    if (!ref.organization || ref.organization.trim() === "") {
      errors.push({ field: `clientReference_${index}_organization`, message: `Reference ${index + 1}: Organization is required` });
    }
    if (!ref.email || !isValidEmail(ref.email)) {
      errors.push({ field: `clientReference_${index}_email`, message: `Reference ${index + 1}: Valid email is required` });
    }
    if (!ref.category || ref.category.trim() === "") {
      errors.push({ field: `clientReference_${index}_category`, message: `Reference ${index + 1}: Category/Service type is required` });
    }
    if (!ref.projectName || ref.projectName.trim() === "") {
      errors.push({ field: `clientReference_${index}_projectName`, message: `Reference ${index + 1}: Project name is required` });
    }
  });

  return errors;
};

/**
 * Validate Section D: Supplier Declaration (Step 4)
 */
export const validateSupplierDeclarationStep = (
  formData: ApplicationFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.fullName || formData.fullName.trim() === "") {
    errors.push({ field: "fullName", message: "Full name is required" });
  }

  if (!formData.designation || formData.designation.trim() === "") {
    errors.push({ field: "designation", message: "Designation/Position is required" });
  }

  if (!formData.phone || !isValidPhone(formData.phone)) {
    errors.push({ field: "phone", message: "Valid phone number is required (UAE format)" });
  }

  if (!formData.email || !isValidEmail(formData.email)) {
    errors.push({ field: "email", message: "Valid email address is required" });
  }

  if (!formData.date) {
    errors.push({ field: "date", message: "Declaration date is required" });
  }

  return errors;
};

/**
 * Validate Section E: Attachments (Step 5)
 */
export const validateAttachmentsStep = (
  formData: ApplicationFormData
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.attachments.tradeLicense) {
    errors.push({ field: "attachments.tradeLicense", message: "Trade License attachment is required" });
  }

  if (!formData.attachments.companyProfile) {
    errors.push({ field: "attachments.companyProfile", message: "Company Profile attachment is required" });
  }

  if (!formData.attachments.powerOfAttorney) {
    errors.push({ field: "attachments.powerOfAttorney", message: "Power of Attorney attachment is required" });
  }

  return errors;
};
