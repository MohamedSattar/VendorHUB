import { useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Download, Trash2, Info } from "lucide-react";
import { CandidateDetail } from "@/services/odata";

interface DocumentConfig {
  id: string;
  label: string;
  apiField: keyof CandidateDetail;
  downloadField: string; // The Power Apps field name for download URL
  tooltip?: string; // Description of what should be uploaded
}

interface DocumentUploadSectionProps {
  contactId?: string;
  documentData?: CandidateDetail | null;
  uaeResident?: boolean | null;
  hideHeader?: boolean;
}

export interface DocumentUploadHandle {
  areDocumentsValid: (uaeResident: boolean | null) => boolean;
  getMandatoryDocuments: () => string[];
}

interface DocumentConfigExtended extends DocumentConfig {
  id: string;
  mandatory?: boolean;
  isRequired?: (uaeResident: boolean) => boolean;
}

const documents: DocumentConfigExtended[] = [
  {
    id: "cv",
    label: "CV File",
    apiField: "cvFile",
    downloadField: "prmtk_cvfile",
    tooltip: "Upload your professional curriculum vitae (CV) or resume documenting your work experience and qualifications"
  },
  {
    id: "introduction",
    label: "Introduction Document",
    apiField: "introductionDocument",
    downloadField: "prmtk_introductiondocument",
    tooltip: "Professional introduction letter highlighting your background, qualifications, and interest in the role"
  },
  {
    id: "education",
    label: "Educational Certificate",
    apiField: "educationalCertificate",
    downloadField: "prmtk_educationalcertificate",
    tooltip: "Copy of your highest educational qualification or diploma"
  },
  {
    id: "eid",
    label: "Emirates ID",
    apiField: "eid",
    downloadField: "prmtk_eid",
    tooltip: "Scanned copy of your valid Emirates ID",
    isRequired: (uaeResident: boolean) => uaeResident === true
  },
  {
    id: "salary",
    label: "Salary Certificate",
    apiField: "salaryCertificate",
    downloadField: "prmtk_salarycertificate",
    tooltip: "Certificate or letter from your current/previous employer confirming your salary details"
  },
  {
    id: "passport",
    label: "Passport",
    apiField: "passport",
    downloadField: "prmtk_passport",
    tooltip: "Scanned copy of your valid passport"
  },
  {
    id: "experience",
    label: "Experience Letter",
    apiField: "experienceLetter",
    downloadField: "prmtk_experienceletter",
    tooltip: "Letter from your employer confirming your work experience and responsibilities"
  },
  {
    id: "police",
    label: "Police Clearance",
    apiField: "policeClearance",
    downloadField: "prmtk_policeclearance",
    tooltip: "Official police clearance certificate from your country of residence"
  },
];

const DocumentUploadSection = forwardRef<DocumentUploadHandle, DocumentUploadSectionProps>(
  function DocumentUploadSection({ contactId, documentData, uaeResident, hideHeader = false }, ref) {
    // Create refs for file inputs
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const [updatedFiles, setUpdatedFiles] = useState<Record<string, File>>({});
    const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
    const [templateLoading, setTemplateLoading] = useState(false);

    // Mandatory documents
    const mandatoryDocIds = ["cv", "introduction", "passport", "education"];

    // Expose validation through ref
    useImperativeHandle(ref, () => ({
      areDocumentsValid: (uaeResidentValue: boolean | null) => {
        // All mandatory documents must be uploaded
        const allMandatoryUploaded = mandatoryDocIds.every(docId => {
          const doc = documents.find(d => d.id === docId);
          if (!doc) return false;
          return documentData && documentData[doc.apiField];
        });

        // If UAE Resident is Yes, Emirates ID must also be uploaded
        const emiratesIdValid = uaeResidentValue === true
          ? documentData && documentData.eid
          : true;

        return allMandatoryUploaded && emiratesIdValid;
      },
      getMandatoryDocuments: () => mandatoryDocIds,
    }), [documentData]);

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

  const handleDownloadTemplate = async () => {
    try {
      setTemplateLoading(true);

      // Fetch manuals content to find Introduction Template
      const response = await fetch("/api/odata/manuals");
      if (!response.ok) {
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();

      // Find Introduction Template in manuals
      const template = data.value?.find((item: any) =>
        item.prmtk_header?.toLowerCase().includes("introduction") &&
        item.prmtk_header?.toLowerCase().includes("template")
      );

      if (!template) {
        alert("Introduction Template not found in manuals");
        return;
      }

      // The description contains the file download information
      // Try to download the attachment if available, otherwise create from description
      if (template.prmtk_description) {
        // Create a text file with the template content
        const element = document.createElement("a");
        const file = new Blob([template.prmtk_description], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "Introduction_Template.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
      } else {
        alert("Template content not available");
      }
    } catch (error) {
      console.error("Error downloading template:", error);
      alert("Failed to download template");
    } finally {
      setTemplateLoading(false);
    }
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          // Check if document has a value from API
          const isUploaded = documentData && documentData[doc.apiField];
          const fileName = isUploaded ? documentData?.[doc.apiField] : null;
          const isRequired = doc.isRequired ? doc.isRequired(uaeResident || false) : false;

          const bgColor = isRequired && !isUploaded
            ? "bg-red-50"
            : isUploaded
            ? "bg-green-50"
            : "bg-yellow-50";
          const borderColor = isRequired && !isUploaded
            ? "border-red-300"
            : isUploaded
            ? "border-green-300"
            : "border-yellow-300";

          const hasLocalFile = updatedFiles[doc.id];

          return (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-4 border rounded transition ${bgColor} ${borderColor}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    {doc.label}
                    {isRequired && (
                      <span className="ml-1 text-red-600 font-bold">*</span>
                    )}
                  </label>
                  {doc.tooltip && (
                    <div
                      className="relative"
                      onMouseEnter={() => setHoveredTooltip(doc.id)}
                      onMouseLeave={() => setHoveredTooltip(null)}
                    >
                      <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                      {hoveredTooltip === doc.id && (
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-gray-900 text-white text-xs rounded p-2 z-10 shadow-lg">
                          {doc.tooltip}
                          <div className="absolute top-full left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {hasLocalFile ? (
                  <p className="text-xs text-green-600 break-words font-medium">
                    {hasLocalFile.name} (pending upload)
                  </p>
                ) : isUploaded ? (
                  <p className="text-xs text-blue-600 break-words">
                    {fileName}
                  </p>
                ) : isRequired ? (
                  <p className="text-xs text-red-600 font-medium">Required - Not uploaded</p>
                ) : (
                  <p className="text-xs text-yellow-700">Not uploaded</p>
                )}
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                {doc.id === "introduction" && (
                  <button
                    onClick={handleDownloadTemplate}
                    disabled={templateLoading}
                    className="px-2 py-2 text-green-600 border border-green-300 text-xs rounded hover:bg-green-50 transition disabled:opacity-50"
                    title="Download empty template"
                  >
                    {templateLoading ? "Loading..." : "Template"}
                  </button>
                )}
                {isUploaded && contactId && (
                  <button
                    onClick={() => handleDownload(doc.downloadField)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <div className="relative">
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current[doc.id] = el;
                    }}
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileSelect(doc.id, file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => triggerFileInput(doc.id)}
                    className="px-3 py-2 border border-navy text-navy text-xs rounded hover:bg-navy/5 transition"
                  >
                    {isUploaded ? "Update" : "Upload"}
                  </button>
                </div>
                {isUploaded && (
                  <button
                    onClick={() => {
                      setUpdatedFiles((prev) => {
                        const newFiles = { ...prev };
                        delete newFiles[doc.id];
                        return newFiles;
                      });
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
  }
);

export default DocumentUploadSection;
