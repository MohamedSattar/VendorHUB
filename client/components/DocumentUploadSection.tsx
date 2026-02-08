import { useRef, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { CandidateDetail } from "@/services/odata";

interface DocumentConfig {
  id: string;
  label: string;
  apiField: keyof CandidateDetail;
  downloadField: string; // The Power Apps field name for download URL
}

interface DocumentUploadSectionProps {
  contactId?: string;
  documentData?: CandidateDetail | null;
}

const documents: DocumentConfig[] = [
  { id: "cv", label: "CV File", apiField: "cvFile", downloadField: "prmtk_cvfile" },
  { id: "introduction", label: "Introduction Document", apiField: "introductionDocument", downloadField: "prmtk_introductiondocument" },
  { id: "education", label: "Educational Certificate", apiField: "educationalCertificate", downloadField: "prmtk_educationalcertificate" },
  { id: "eid", label: "Emirates ID", apiField: "eid", downloadField: "prmtk_eid" },
  { id: "salary", label: "Salary Certificate", apiField: "salaryCertificate", downloadField: "prmtk_salarycertificate" },
  { id: "passport", label: "Passport", apiField: "passport", downloadField: "prmtk_passport" },
  { id: "experience", label: "Experience Letter", apiField: "experienceLetter", downloadField: "prmtk_experienceletter" },
  { id: "police", label: "Police Clearance", apiField: "policeClearance", downloadField: "prmtk_policeclearance" },
];

export default function DocumentUploadSection({ contactId, documentData }: DocumentUploadSectionProps) {
  // Create refs for file inputs
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [updatedFiles, setUpdatedFiles] = useState<Record<string, File>>({});

  const handleDownload = (downloadField: string) => {
    if (!contactId) return;

    // Construct download URL: /api/odata/engagement-contact/{id}/{field}/$value
    const downloadUrl = `/api/odata/engagement-contact/${contactId}/${downloadField}/$value`;

    // Create a temporary link to download the file
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank"; // Open in new tab
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (docId: string, file: File) => {
    setUpdatedFiles((prev) => ({
      ...prev,
      [docId]: file,
    }));
    console.log(`File selected for ${docId}:`, file.name);
  };

  const triggerFileInput = (docId: string) => {
    fileInputRefs.current[docId]?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-navy mb-6">Documents</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          // Check if document has a value from API
          const isUploaded = documentData && documentData[doc.apiField];
          const fileName = isUploaded ? documentData?.[doc.apiField] : null;
          const bgColor = isUploaded ? "bg-white" : "bg-yellow-50";
          const borderColor = isUploaded ? "border-gray-300" : "border-yellow-300";

          return (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-4 border rounded transition ${bgColor} ${borderColor}`}
            >
              <div className="flex-1 min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {doc.label}
                </label>
                {isUploaded ? (
                  <p className="text-xs text-blue-600 break-words">
                    {fileName}
                  </p>
                ) : (
                  <p className="text-xs text-yellow-700">Not uploaded</p>
                )}
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                {isUploaded && contactId && (
                  <button
                    onClick={() => handleDownload(doc.downloadField)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <button
                  className="px-3 py-2 border border-navy text-navy text-xs rounded hover:bg-navy/5 transition cursor-not-allowed opacity-50"
                  disabled
                  title="Upload via API"
                >
                  {isUploaded ? "Update" : "Upload"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
