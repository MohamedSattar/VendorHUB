import { ApplicationFormData } from "@/components/SupplierApplicationForm";

let autosaveTimeout: NodeJS.Timeout | null = null;

/**
 * Debounced autosave function
 * Saves draft after a delay to avoid too many API calls
 */
export const scheduleDraftAutosave = (
  formData: ApplicationFormData,
  onSaveComplete?: (draftId: string) => void,
  delayMs: number = 2000
): void => {
  // Clear any pending autosave
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout);
  }

  // Schedule new autosave
  autosaveTimeout = setTimeout(() => {
    saveDraftToDB(formData, onSaveComplete);
  }, delayMs);
};

/**
 * Save draft to database
 */
export const saveDraftToDB = async (
  formData: ApplicationFormData,
  onSaveComplete?: (draftId: string) => void
): Promise<void> => {
  try {
    console.log("[DraftAutosave] Saving draft...");

    // Prepare data for draft save (exclude file attachments for now)
    const draftData = {
      draftId: formData.draftId,
      companyName: formData.companyName,
      yearsInBusiness: formData.yearsInBusiness,
      numberOfEmployees: formData.numberOfEmployees,
      tradeLicenseType: formData.tradeLicenseType,
      country: formData.country,
      city: formData.city,
      website: formData.website,
      websiteUrl: formData.websiteUrl,
      isEmiratiSME: formData.isEmiratiSME,
      isKhalifaFundRegistered: formData.isKhalifaFundRegistered,
      hasICVCertificate: formData.hasICVCertificate,
      icvScore: formData.icvScore,
      hasEnvironmentalPractices: formData.hasEnvironmentalPractices,
      environmentalPracticesDetails: formData.environmentalPracticesDetails,
      supplyCategorySelections: formData.supplyCategorySelections,
      suppliers: formData.suppliers,
      clientReferences: formData.clientReferences,
      hasCertifications: formData.hasCertifications,
      certifications: formData.certifications,
      otherCertifications: formData.otherCertifications,
      fullName: formData.fullName,
      designation: formData.designation,
      phone: formData.phone,
      email: formData.email,
      date: formData.date,
    };

    const response = await fetch("/api/odata/supplier-registration/draft", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(draftData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || "Failed to save draft");
    }

    const result = await response.json();
    console.log("[DraftAutosave] Draft saved successfully:", result.draftId);

    if (onSaveComplete) {
      onSaveComplete(result.draftId);
    }
  } catch (error) {
    console.error("[DraftAutosave] Error saving draft:", error);
    // Don't throw - autosave should fail silently
  }
};

/**
 * Cancel pending autosave
 */
export const cancelPendingAutosave = (): void => {
  if (autosaveTimeout) {
    clearTimeout(autosaveTimeout);
    autosaveTimeout = null;
  }
};
