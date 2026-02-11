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
import SupplierApplicationConfirmDialog from "@/components/SupplierApplicationConfirmDialog";
import SupplierApplicationSuccess from "@/components/SupplierApplicationSuccess";
import ValidationErrorsDialog from "@/components/ValidationErrorsDialog";
import { validateSupplierApplicationForm, ValidationError, getFirstErrorStep } from "@/utils/formValidation";
import { useToast } from "@/hooks/use-toast";

export interface ApplicationFormData {
  // Section A: Company Information
  companyName: string;
  yearsInBusiness: string;
  numberOfEmployees: string;
  tradeLicenseType: string;
  registeredAddress: string;
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
    companyName: "",
    yearsInBusiness: "",
    numberOfEmployees: "",
    tradeLicenseType: "",
    registeredAddress: "",
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
  });

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationErrorsDialog, setShowValidationErrorsDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    trackingId: string;
    companyName: string;
    submissionDate: string;
    contactEmail: string;
  } | null>(null);

  const handleUpdateFormData = (updates: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        companyName: formData.companyName,
        yearsInBusiness: formData.yearsInBusiness,
        numberOfEmployees: formData.numberOfEmployees,
        tradeLicenseType: formData.tradeLicenseType,
        registeredAddress: formData.registeredAddress,
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

  const renderStep = () => {
    const stepProps = { formData, updateFormData: handleUpdateFormData };

    switch (currentStep) {
      case 0:
        return <CompanyInformationStep {...stepProps} />;
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

        {/* Form Content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-navy mb-8">{STEPS[currentStep].title}</h2>

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
    </>
  );
}
