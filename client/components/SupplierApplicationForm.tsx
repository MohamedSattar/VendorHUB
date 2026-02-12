import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import CompanyInformationStep from "@/components/supplier/CompanyInformationStep";
import OperationalCapabilitiesStep from "@/components/supplier/OperationalCapabilitiesStep";
import ComplianceStep from "@/components/supplier/ComplianceStep";
import ReferencesStep from "@/components/supplier/ReferencesStep";
import DeclarationStep from "@/components/supplier/DeclarationStep";
import AttachmentsStep from "@/components/supplier/AttachmentsStep";
import ReviewStep from "@/components/supplier/ReviewStep";
import FormProgressBar from "@/components/supplier/FormProgressBar";
import { useEffect } from "react";
import SupplierApplicationConfirmDialog from "@/components/SupplierApplicationConfirmDialog";
import SupplierApplicationSuccess from "@/components/SupplierApplicationSuccess";
import ValidationErrorsDialog from "@/components/ValidationErrorsDialog";
import {
  validateSupplierApplicationForm,
  ValidationError,
  validateCompanyInformationStep,
  validateOperationalCapabilitiesStep,
  validateClientReferencesStep,
  validateSupplierDeclarationStep,
  validateAttachmentsStep,
} from "@/utils/formValidation";
import { scheduleDraftAutosave, cancelPendingAutosave } from "@/utils/draftAutosave";
import { useToast } from "@/hooks/use-toast";

export interface ApplicationFormData {
  // Section A: Company Information
  tradeLicenseNumber: string; // Unique identifier
  companyName: string;
  yearsInBusiness: string;
  numberOfEmployees: string;
  tradeLicenseType: number; // 1 = ADDED, 2 = Non-ADDED
  country: string; // Lookup field ID
  countryName: string; // Display name
  city: string; // Lookup field ID
  cityName: string; // Display name
  website: string;
  websiteUrl: string;
  isEmiratiSME: boolean;
  isKhalifaFundRegistered: boolean;
  hasICVCertificate: boolean;
  icvScore: string;

  // Section B: Operational Capabilities
  hasEnvironmentalPractices: boolean;
  environmentalPracticesDetails: string;
  supplyCategorySelections: string[];
  suppliers: Array<{ name: string }>;
  clientReferences: Array<{
    name: string;
    organization: string;
    email: string;
    category: string;
    projectName: string;
  }>;

  // Section C: Quality & Compliance
  hasCertifications: boolean;
  certifications: string;
  otherCertifications: string;

  // Section D: Supplier Declaration
  fullName: string;
  designation: string;
  phone: string;
  email: string;
  date: string;
  signature: string;

  // Section E: Mandatory Attachments
  attachments: {
    tradeLicense: File | null;
    companyProfile: File | null;
    powerOfAttorney: File | null;
    icvCertificate: File | null;
  };

  // Draft tracking
  draftId?: string;
}

const STEPS = [
  { id: 0, label: "Company Info", title: "Company Information" },
  { id: 1, label: "Capabilities", title: "Operational Capabilities" },
  { id: 2, label: "Compliance", title: "Quality & Compliance" },
  { id: 3, label: "References", title: "Client References" },
  { id: 4, label: "Declaration", title: "Supplier Declaration" },
  { id: 5, label: "Attachments", title: "Mandatory Attachments" },
  { id: 6, label: "Review", title: "Review & Submit" },
];

export default function SupplierApplicationForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormData>({
    tradeLicenseNumber: "",
    companyName: "",
    yearsInBusiness: "",
    numberOfEmployees: "",
    tradeLicenseType: 0,
    country: "",
    countryName: "",
    city: "",
    cityName: "",
    website: "",
    websiteUrl: "",
    isEmiratiSME: false,
    isKhalifaFundRegistered: false,
    hasICVCertificate: false,
    icvScore: "",
    hasEnvironmentalPractices: false,
    environmentalPracticesDetails: "",
    supplyCategorySelections: [],
    suppliers: [{ name: "" }, { name: "" }, { name: "" }],
    clientReferences: [
      {
        name: "",
        organization: "",
        email: "",
        category: "",
        projectName: "",
      },
      {
        name: "",
        organization: "",
        email: "",
        category: "",
        projectName: "",
      },
    ],
    hasCertifications: false,
    certifications: "",
    otherCertifications: "",
    fullName: "",
    designation: "",
    phone: "",
    email: "",
    date: "",
    signature: "",
    attachments: {
      tradeLicense: null,
      companyProfile: null,
      powerOfAttorney: null,
      icvCertificate: null,
    },
    draftId: undefined,
  });

  const [recordId, setRecordId] = useState<string>(() => {
    // Load from localStorage on component mount
    if (typeof window !== "undefined") {
      return localStorage.getItem("supplierRegistrationRecordId") || "";
    }
    return "";
  });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [stepValidationErrors, setStepValidationErrors] = useState<Record<number, ValidationError[]>>({});
  const [showValidationErrorsDialog, setShowValidationErrorsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [isLoadingRecord, setIsLoadingRecord] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    trackingId: string;
    companyName: string;
    submissionDate: string;
    contactEmail: string;
  } | null>(null);

  // Validate a specific step
  const validateCurrentStep = (): ValidationError[] => {
    switch (currentStep) {
      case 0:
        return validateCompanyInformationStep(formData);
      case 1:
        return validateOperationalCapabilitiesStep(formData);
      case 3:
        return validateClientReferencesStep(formData);
      case 4:
        return validateSupplierDeclarationStep(formData);
      case 5:
        return validateAttachmentsStep(formData);
      default:
        return [];
    }
  };

  // Update form data and trigger autosave
  const handleUpdateFormData = (updates: Partial<ApplicationFormData>) => {
    setFormData((prev) => {
      const newFormData = { ...prev, ...updates };

      // Schedule autosave
      setIsSavingDraft(true);
      scheduleDraftAutosave(newFormData, (draftId) => {
        setFormData((f) => ({ ...f, draftId }));
        setIsSavingDraft(false);
        console.log("[Form] Draft saved with ID:", draftId);
      });

      return newFormData;
    });

    // Validate current step after changes
    const stepErrors = validateCurrentStep();
    setStepValidationErrors((prev) => ({
      ...prev,
      [currentStep]: stepErrors,
    }));
  };

  // Cleanup autosave on unmount
  useEffect(() => {
    return () => {
      cancelPendingAutosave();
    };
  }, []);

  // Load existing record from server when recordId is found in localStorage
  useEffect(() => {
    if (recordId && recordId.trim() !== "") {
      const loadRecord = async () => {
        setIsLoadingRecord(true);
        try {
          // You can make an API call here to fetch the full record details if needed
          // For now, the record will be loaded when the trade license number is entered
          console.log("[Form] Record ID found in localStorage:", recordId);
        } catch (error) {
          console.error("[Form] Error loading record:", error);
          toast({
            title: "Warning",
            description: "Could not fully load your previous registration. You can continue editing.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingRecord(false);
        }
      };

      loadRecord();
    }
  }, [recordId, toast]);

  // Handle trade license number lookup for duplicates and auto-population
  const handleTradeLicenseNumberChange = async (tradeLicenseNum: string) => {
    updateFormData({ tradeLicenseNumber: tradeLicenseNum });
    setDuplicateError(null);

    if (!tradeLicenseNum.trim()) {
      return;
    }

    setIsCheckingDuplicate(true);
    try {
      const response = await fetch(
        `/api/odata/supplier-registration/lookup?tradeLicenseNumber=${encodeURIComponent(tradeLicenseNum)}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No existing record found, which is good for new registrations
          console.log("[Form] No existing supplier found for trade license:", tradeLicenseNum);
          setDuplicateError(null);
        } else {
          throw new Error("Failed to check trade license");
        }
        return;
      }

      const existingSupplier = await response.json();

      if (existingSupplier && existingSupplier.prmtk_supplierregistrationid) {
        // Found existing record - populate form with existing data
        setRecordId(existingSupplier.prmtk_supplierregistrationid);
        localStorage.setItem(
          "supplierRegistrationRecordId",
          existingSupplier.prmtk_supplierregistrationid
        );

        // Auto-populate form fields from existing record
        const populatedData: Partial<ApplicationFormData> = {
          companyName: existingSupplier.prmtk_name || existingSupplier.prmtk_companylegalname || "",
          yearsInBusiness: existingSupplier.prmtk_yearsinbusiness?.toString() || "",
          numberOfEmployees: existingSupplier.prmtk_numberofemployees?.toString() || "",
          tradeLicenseType: existingSupplier.prmtk_tradelicensetype || 0,
          country: existingSupplier._prmtk_country_value || "",
          city: existingSupplier._prmtk_city_value || "",
          website: existingSupplier.prmtk_companywebsite ? "yes" : "no",
          websiteUrl: existingSupplier.prmtk_websiteurl || "",
          isEmiratiSME: existingSupplier.prmtk_sme || false,
          isKhalifaFundRegistered: existingSupplier.prmtk_khalifafundregistration || false,
          hasICVCertificate: existingSupplier.prmtk_icvcertificate || false,
          icvScore: existingSupplier.prmtk_icvcertificate ? "Yes" : "",
          hasEnvironmentalPractices: existingSupplier.prmtk_environmentalpractices || false,
          hasCertifications: existingSupplier.prmtk_relevantcertifications || false,
          certifications: existingSupplier.prmtk_certifications || "",
          otherCertifications: existingSupplier.prmtk_othercertifications || "",
          fullName: existingSupplier.prmtk_designation || "",
          email: existingSupplier.prmtk_email || "",
          phone: existingSupplier.prmtk_mobilenumber || "",
        };

        updateFormData(populatedData);
        toast({
          title: "Existing Record Found",
          description:
            "Form has been populated with your existing supplier registration data. You can update it before proceeding.",
        });
      }
    } catch (error) {
      console.error("[Form] Error checking trade license:", error);
      setDuplicateError("Error checking trade license. Please try again.");
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      // Validate current step before moving to next
      const errors = validateCurrentStep();

      if (errors.length > 0) {
        // Show validation errors
        setValidationErrors(errors);
        setShowValidationErrorsDialog(true);
        toast({
          title: "Validation Error",
          description: `Please fix the errors in ${STEPS[currentStep].title} before proceeding`,
          variant: "destructive",
        });
        return;
      }

      // Save current step to database
      try {
        setIsSubmitting(true);

        let newRecordId = recordId;
        let saveData = getStepData(currentStep);

        // On first step, always create a new record
        if (currentStep === 0 && !recordId) {
          const createResponse = await fetch("/api/odata/supplier-registration/draft", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(saveData),
          });

          if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.details || "Failed to create supplier registration");
          }

          const result = await createResponse.json();
          newRecordId = result.draftId;
          setRecordId(newRecordId);
          localStorage.setItem("supplierRegistrationRecordId", newRecordId);

          toast({
            title: "Success",
            description: "Supplier registration created successfully",
          });
        } else if (newRecordId) {
          // Update existing record
          const updateResponse = await fetch(
            `/api/odata/supplier-registration/draft`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...saveData,
                draftId: newRecordId,
              }),
            }
          );

          if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.details || "Failed to save step");
          }

          toast({
            title: "Success",
            description: `${STEPS[currentStep].title} saved successfully`,
          });
        }

        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        console.error("[SupplierApplicationForm] Error saving step:", error);
        toast({
          title: "Error Saving Step",
          description:
            error instanceof Error ? error.message : "Failed to save step. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Helper function to get step-specific data
  const getStepData = (step: number): Record<string, any> => {
    const filterEmpty = (obj: Record<string, any>) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => {
          // Keep false values for boolean fields, remove empty strings, null, undefined
          if (value === false) return true;
          // For numeric fields, keep 0 and positive numbers, filter out 0 only for choice fields like tradeLicenseType
          if (typeof value === "number" && value === 0) return false;
          return value !== "" && value !== undefined && value !== null;
        })
      );
    };

    switch (step) {
      case 0: // Company Information
        return filterEmpty({
          tradeLicenseNumber: formData.tradeLicenseNumber,
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
        });

      case 1: // Operational Capabilities
        return filterEmpty({
          hasEnvironmentalPractices: formData.hasEnvironmentalPractices,
          environmentalPracticesDetails: formData.environmentalPracticesDetails,
          supplyCategorySelections: formData.supplyCategorySelections,
          suppliers: formData.suppliers,
        });

      case 2: // Compliance
        return filterEmpty({
          hasCertifications: formData.hasCertifications,
          certifications: formData.certifications,
          otherCertifications: formData.otherCertifications,
        });

      case 3: // References
        return filterEmpty({
          clientReferences: formData.clientReferences,
        });

      case 4: // Declaration
        return filterEmpty({
          fullName: formData.fullName,
          designation: formData.designation,
          phone: formData.phone,
          email: formData.email,
          date: formData.date,
        });

      case 5: // Attachments
        return filterEmpty({
          attachments: formData.attachments,
        });

      default:
        return {};
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = () => {
    // Validate the form
    const errors = validateSupplierApplicationForm(formData);
    setValidationErrors(errors);

    if (errors.length === 0) {
      // Show confirmation dialog if validation passes
      setShowConfirmDialog(true);
    } else {
      // Show detailed errors dialog
      setShowValidationErrorsDialog(true);
    }
  };

  const handleGoToErrorStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Prepare the data for submission
      const submissionData = {
        draftId: recordId,
        tradeLicenseNumber: formData.tradeLicenseNumber,
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

      console.log("[SupplierApplicationForm] Submitting application:", submissionData);

      const response = await fetch("/api/odata/supplier-registration/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || "Failed to submit application"
        );
      }

      const result = await response.json();

      // Show success screen
      setSubmissionResult({
        success: true,
        trackingId: result.trackingId,
        companyName: result.companyName,
        submissionDate: result.submissionDate,
        contactEmail: result.contactEmail,
      });

      // Clear localStorage after successful submission
      localStorage.removeItem("supplierRegistrationRecordId");
      setRecordId("");

      setShowConfirmDialog(false);

      toast({
        title: "Success",
        description: "Your application has been submitted successfully!",
      });
    } catch (error) {
      console.error("[SupplierApplicationForm] Submission error:", error);
      toast({
        title: "Submission Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
      setShowConfirmDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle withdraw (delete) registration
  const handleWithdrawRegistration = async () => {
    if (!recordId) {
      toast({
        title: "No Registration",
        description: "There is no registration to withdraw.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsWithdrawing(true);

      const response = await fetch(
        `/api/odata/supplier-registration/delete/${encodeURIComponent(recordId)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to withdraw registration"
        );
      }

      // Clear localStorage and reset form
      localStorage.removeItem("supplierRegistrationRecordId");
      setRecordId("");
      handleResetForm();

      toast({
        title: "Registration Withdrawn",
        description: "Your supplier registration has been deleted successfully.",
      });

      setShowWithdrawConfirm(false);
    } catch (error) {
      console.error("[Form] Error withdrawing registration:", error);
      toast({
        title: "Withdrawal Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to withdraw registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Handle reset form
  const handleResetForm = () => {
    setFormData({
      tradeLicenseNumber: "",
      companyName: "",
      yearsInBusiness: "",
      numberOfEmployees: "",
      tradeLicenseType: 0,
      country: "", // Will be set to UAE default
      countryName: "United Arab Emirates",
      city: "", // Will be set to Abu Dhabi default
      cityName: "Abu Dhabi",
      website: "",
      websiteUrl: "",
      isEmiratiSME: false,
      isKhalifaFundRegistered: false,
      hasICVCertificate: false,
      icvScore: "",
      hasEnvironmentalPractices: false,
      environmentalPracticesDetails: "",
      supplyCategorySelections: [],
      suppliers: [{ name: "" }, { name: "" }, { name: "" }],
      clientReferences: [
        {
          name: "",
          organization: "",
          email: "",
          category: "",
          projectName: "",
        },
        {
          name: "",
          organization: "",
          email: "",
          category: "",
          projectName: "",
        },
      ],
      hasCertifications: false,
      certifications: "",
      otherCertifications: "",
      fullName: "",
      designation: "",
      phone: "",
      email: "",
      date: "",
      signature: "",
      attachments: {
        tradeLicense: null,
        companyProfile: null,
        powerOfAttorney: null,
        icvCertificate: null,
      },
      draftId: undefined,
    });

    setCurrentStep(0);
    setValidationErrors([]);
    setStepValidationErrors({});
    setDuplicateError(null);
    setIsCheckingDuplicate(false);

    toast({
      title: "Form Reset",
      description: "The form has been reset to default values.",
    });
  };

  const renderStep = () => {
    const stepProps = { formData, updateFormData: handleUpdateFormData };

    switch (currentStep) {
      case 0:
        return (
          <CompanyInformationStep
            {...stepProps}
            onTradeLicenseCheck={handleTradeLicenseNumberChange}
            isCheckingDuplicate={isCheckingDuplicate}
            duplicateError={duplicateError}
          />
        );
      case 1:
        return <OperationalCapabilitiesStep {...stepProps} />;
      case 2:
        return <ComplianceStep {...stepProps} />;
      case 3:
        return <ReferencesStep {...stepProps} />;
      case 4:
        return <DeclarationStep {...stepProps} />;
      case 5:
        return <AttachmentsStep {...stepProps} />;
      case 6:
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  // If submission was successful, show success screen
  if (submissionResult?.success) {
    return (
      <SupplierApplicationSuccess
        trackingId={submissionResult.trackingId}
        companyName={submissionResult.companyName}
        contactEmail={submissionResult.contactEmail}
        submissionDate={submissionResult.submissionDate}
      />
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Progress Bar */}
        <FormProgressBar currentStep={currentStep} totalSteps={STEPS.length} steps={STEPS} />

        {/* Draft Saving Indicator */}
        {isSavingDraft && (
          <div className="bg-blue-50 border-b border-blue-200 px-8 py-2 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-sm text-blue-700 font-medium">Saving draft...</span>
          </div>
        )}

        {/* Form Content */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-navy">{STEPS[currentStep].title}</h2>
            <div className="flex items-center gap-4">
              {formData.draftId && (
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Draft #{formData.draftId.substring(0, 8)}...
                </span>
              )}

              {recordId && (
                <>
                  <button
                    onClick={() => setShowWithdrawConfirm(true)}
                    disabled={isWithdrawing}
                    className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete this draft registration"
                  >
                    {isWithdrawing ? "Withdrawing..." : "Withdraw"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Reset the form to defaults? This will not delete your saved registration.")) {
                        handleResetForm();
                      }
                    }}
                    className="text-xs px-3 py-1 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition"
                    title="Reset form fields"
                  >
                    Reset Form
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mb-8">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {STEPS.length}
            </div>

            {currentStep === STEPS.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition"
              >
                Next
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Validation Errors Dialog */}
      <ValidationErrorsDialog
        isOpen={showValidationErrorsDialog}
        errors={validationErrors}
        onClose={() => setShowValidationErrorsDialog(false)}
        onGoToStep={handleGoToErrorStep}
      />

      {/* Confirmation Dialog */}
      <SupplierApplicationConfirmDialog
        isOpen={showConfirmDialog}
        isLoading={isSubmitting}
        companyName={formData.companyName}
        contactEmail={formData.email}
        validationErrors={validationErrors}
        onConfirm={handleConfirmSubmit}
        onCancel={() => {
          setShowConfirmDialog(false);
          setValidationErrors([]);
        }}
      />

      {/* Withdraw Confirmation Dialog */}
      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Withdraw Registration?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to withdraw this supplier registration? This action will permanently delete your draft registration and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                disabled={isWithdrawing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawRegistration}
                disabled={isWithdrawing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? "Withdrawing..." : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
