import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import AddResourceForm, { AddResourceFormHandle } from "@/components/AddResourceForm";
import DocumentUploadSection, { DocumentUploadHandle } from "@/components/DocumentUploadSection";
import ImportCVModal from "@/components/ImportCVModal";
import { Plus } from "lucide-react";

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

  const handleSave = async () => {
    if (!formRef.current || !docsRef.current || !validateForm()) {
      return;
    }

    setIsSaving(true);
    try {
      // Step 1: Create the contact record
      const formData = formRef.current.getFormData();

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

      // Step 2: Upload documents
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

      for (const [docId, file] of Object.entries(updatedFiles)) {
        const fieldName = documentFieldMap[docId];
        if (fieldName) {
          const docFormData = new FormData();
          docFormData.append("file", file);

          // Note: Document upload endpoint would need to be implemented on the backend
          // This is a placeholder for the actual implementation
          console.log(`Would upload document: ${docId} to field: ${fieldName}`);
        }
      }

      // Step 3: Redirect to edit page
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
            <AddResourceForm ref={formRef} mode="new" />

            {/* Documents Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <DocumentUploadSection ref={docsRef} hideHeader={true} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-4 mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/resources")}
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

      {/* Import CV Modal */}
      <ImportCVModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onFileSelected={handleCVImport}
      />
    </div>
  );
}
