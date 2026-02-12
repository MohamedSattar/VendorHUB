import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import AddResourceForm, { AddResourceFormHandle } from "@/components/AddResourceForm";
import DocumentUploadSection, { DocumentUploadHandle } from "@/components/DocumentUploadSection";
import ImportCVModal from "@/components/ImportCVModal";
import { Plus, ChevronDown, Flag } from "lucide-react";
import { useUserContact } from "@/contexts/UserContactContext";

export default function AddResource() {
  const navigate = useNavigate();
  const formRef = useRef<AddResourceFormHandle>(null);
  const docsRef = useRef<DocumentUploadHandle>(null);
  const [activeResource, setActiveResource] = useState(1);
  const [resources, setResources] = useState([1]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedContactId, setSavedContactId] = useState<string | null>(null);
  const [savedContactData, setSavedContactData] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);

  const handleAddResource = () => {
    const newResourceNum = Math.max(...resources) + 1;
    setResources([...resources, newResourceNum]);
    setActiveResource(newResourceNum);
  };

  const handleCVImport = (file: File) => {
    // Handle CV file import
    // This would typically send the file to a backend API for processing
    console.log("CV imported:", file.name);
    // After processing, show a success message
    alert(`CV "${file.name}" imported successfully! Form fields will be populated with extracted data.`);
  };

  const validateForm = () => {
    if (!formRef.current || !docsRef.current) return false;

    const isFormDataValid = formRef.current.isFormValid();
    const uaeResident = formRef.current.getUAEResident();
    const areDocsValid = docsRef.current.areDocumentsValid(uaeResident);

    return isFormDataValid && areDocsValid;
  };

  // Periodically check form validity
  const [checkCount, setCheckCount] = useState(0);
  const triggerValidation = () => {
    setCheckCount(prev => prev + 1);
    setIsFormValid(validateForm());
  };

  // Set up interval to check form validity frequently and track unsaved changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFormValid(validateForm());
      // If form is valid, it means user has entered data
      if (validateForm() || (formRef.current &&
          (formRef.current.getFormData().fullName !== "" ||
           formRef.current.getFormData().email !== "" ||
           formRef.current.getFormData().phoneNumber !== ""))) {
        setHasUnsavedChanges(true);
      }
    }, 500); // Check every 500ms

    return () => clearInterval(interval);
  }, [formRef, docsRef]);

  const { getVendorId } = useUserContact();

  const handleSave = async () => {
    if (!formRef.current || !docsRef.current || !validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Step 1: Create the contact record
      const formData = formRef.current.getFormData();
      const vendorId = getVendorId();

      if (!vendorId) {
        throw new Error("Vendor information not available. Please reload the page and try again.");
      }

      const createResponse = await fetch("/api/odata/engagement-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prmtk_id: formData.fullName,
          prmtk_email: formData.email,
          prmtk_phonenumber: formData.phoneNumber,
          prmtk_uaeresident: formData.uaeResident,
          _prmtk_vendor_value: vendorId,
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create contact: ${createResponse.statusText}`);
      }

      const createData = await createResponse.json();
      const contactId = createData.id;

      if (!contactId) {
        throw new Error("No contact ID returned from API");
      }

      // Step 2: Upload documents to the created record
      const updatedFiles = docsRef.current.getUpdatedFiles();
      const documentFieldMap: Record<string, string> = {
        cv: "prmtk_cvfile",
        introduction: "prmtk_introductiondocument",
        passport: "prmtk_passport",
        education: "prmtk_educationalcertificate",
        eid: "prmtk_eid",
        salary: "prmtk_salarycertificate",
        experience: "prmtk_experienceletter",
        police: "prmtk_policeclearance",
      };

      if (Object.keys(updatedFiles).length > 0) {
        console.log("[AddResource] Starting document uploads for contact:", contactId);

        for (const [docId, file] of Object.entries(updatedFiles)) {
          const fieldName = documentFieldMap[docId];
          if (fieldName && file) {
            try {
              const docFormData = new FormData();
              docFormData.append("file", file);

              const uploadResponse = await fetch(
                `/api/odata/engagement-contact/${contactId}/document/${fieldName}`,
                {
                  method: "POST",
                  body: docFormData,
                }
              );

              if (!uploadResponse.ok) {
                console.warn(`Failed to upload document ${docId}: ${uploadResponse.statusText}`);
                // Continue with other documents even if one fails
              } else {
                console.log(`Successfully uploaded document: ${docId}`);
              }
            } catch (docError) {
              console.error(`Error uploading document ${docId}:`, docError);
              // Continue with other documents even if one fails
            }
          }
        }
      }

      // Step 3: Reset unsaved changes and redirect to edit page
      setHasUnsavedChanges(false);
      navigate(`/resources/edit/${contactId}`);
    } catch (error) {
      console.error("Error saving resource:", error);
      alert(`Failed to save: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">Home / Add Resource</p>
            <h1 className="text-3xl font-bold text-navy mb-6">
              Add New Resource
            </h1>

            {/* Import from CV button - Disabled */}
            <button
              disabled
              className="flex items-center gap-2 text-sm text-gray-400 border border-gray-300 px-4 py-2 rounded bg-gray-50 cursor-not-allowed opacity-60"
              title="Import from CV is currently disabled"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Import from CV
            </button>
          </div>

          {/* Candidate Details and Documents Combined */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12">
            {/* Collapsible Header for Candidate Details and Documents */}
            <button
              type="button"
              onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
              className="flex items-center gap-3 w-full text-left mb-6 hover:opacity-75 transition"
              aria-expanded={!isDetailsCollapsed}
            >
              <ChevronDown
                className={`w-5 h-5 text-navy transition-transform duration-200 flex-shrink-0 ${
                  isDetailsCollapsed ? "-rotate-90" : ""
                }`}
              />
              <h3 className="text-lg font-semibold text-navy">Candidate Details & Documents</h3>
            </button>

            {/* Collapsed Preview */}
            {isDetailsCollapsed && (
              <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-4">
                {/* Photo */}
                <div className="w-16 h-16 rounded-lg bg-gray-200 border border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {formRef.current?.getPhotoUrl() ? (
                    <img
                      src={formRef.current.getPhotoUrl() || ""}
                      alt="Candidate"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl font-bold text-gray-400">
                        {(formRef.current?.getFormData().fullName || "?").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Candidate Info */}
                <div className="flex-1 min-w-0">
                  {formRef.current?.getFormData().fullName ? (
                    <>
                      <p className="text-sm font-medium text-gray-600">Assigned Candidate</p>
                      <p className="text-base font-semibold text-navy truncate">{formRef.current.getFormData().fullName}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-600">Status</p>
                      <p className="text-base font-semibold text-orange-600">Not Assigned yet</p>
                    </>
                  )}
                </div>

                {/* Status Flag */}
                <div className="flex flex-col items-center gap-1">
                  {formRef.current?.getFormData().fullName ? (
                    <>
                      <Flag className="w-6 h-6 text-green-500 fill-current" />
                      <span className="text-xs font-semibold text-green-600">Ready</span>
                    </>
                  ) : (
                    <>
                      <Flag className="w-6 h-6 text-orange-500 fill-current" />
                      <span className="text-xs font-semibold text-orange-600">Pending</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Collapsible Content */}
            {!isDetailsCollapsed && (
              <>
                <AddResourceForm ref={formRef} mode="new" isCollapsed={isDetailsCollapsed} />

                {/* Documents Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <DocumentUploadSection ref={docsRef} hideHeader={true} isCollapsed={isDetailsCollapsed} uaeResident={formRef.current?.getUAEResident()} />
                </div>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-4 mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    setShowCancelConfirm(true);
                  } else {
                    navigate("/resources");
                  }
                }}
                className="px-6 py-3 border border-navy text-navy rounded-lg font-medium hover:bg-navy/5 transition"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={!isFormValid || isSaving}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition ${
                isFormValid && !isSaving
                  ? "bg-navy text-white hover:bg-navy/90 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
              }`}
            >
              {isSaving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-navy mb-2">
              Discard Changes?
            </h3>
            <p className="text-gray-600 mb-6">
              You have unsaved changes. Are you sure you want to discard them?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-navy text-navy rounded-lg font-medium hover:bg-navy/5 transition"
              >
                Continue Editing
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  navigate("/resources");
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CV Modal */}
      <ImportCVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onFileSelected={handleCVImport}
      />
    </div>
  );
}
