import { useState, useRef } from "react";
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
              onClick={() => {
                triggerValidation();
                if (validateForm()) {
                  // Form is valid, proceed with save
                  console.log("Saving resource...");
                  // TODO: Implement save logic
                }
              }}
              disabled={!isFormValid}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition ${
                isFormValid
                  ? "bg-navy text-white hover:bg-navy/90 cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
              }`}
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
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Save
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
