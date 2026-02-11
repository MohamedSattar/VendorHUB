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

  if (!formData.registeredAddress || formData.registeredAddress.trim() === "") {
    errors.push({
      field: "registeredAddress",
      message: "Registered company address is required",
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
