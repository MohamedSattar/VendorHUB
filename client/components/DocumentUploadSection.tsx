import { useState } from "react";
import { Download, Trash2 } from "lucide-react";

interface DocumentItem {
  id: string;
  label: string;
  fileName?: string;
  fileUrl?: string;
}

const documents: DocumentItem[] = [
  { id: "cv", label: "CV File" },
  { id: "introduction", label: "Introduction Document" },
  { id: "education", label: "Educational Certificate" },
  { id: "eid", label: "Emirates ID" },
  { id: "salary", label: "Salary Certificate" },
  { id: "passport", label: "Passport" },
  { id: "experience", label: "Experience Letter" },
  { id: "police", label: "Police Clearance" },
];

export default function DocumentUploadSection() {
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, { fileName: string; fileUrl: string }>>({});

  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the file
      const fileUrl = URL.createObjectURL(file);
      setUploadedDocuments((prev) => ({
        ...prev,
        [docId]: {
          fileName: file.name,
          fileUrl: fileUrl,
        },
      }));
    }
  };

  const handleDownload = (docId: string) => {
    const doc = uploadedDocuments[docId];
    if (doc && doc.fileUrl) {
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (docId: string) => {
    setUploadedDocuments((prev) => {
      const newDocs = { ...prev };
      delete newDocs[docId];
      return newDocs;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-navy mb-6">Documents</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => {
          const isUploaded = uploadedDocuments[doc.id];
          const bgColor = isUploaded ? "bg-white" : "bg-yellow-50";
          const borderColor = isUploaded ? "border-gray-300" : "border-yellow-300";

          return (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-4 border rounded transition ${bgColor} ${borderColor}`}
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {doc.label}
                </label>
                {isUploaded ? (
                  <a
                    href={isUploaded.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-words"
                  >
                    {isUploaded.fileName}
                  </a>
                ) : (
                  <p className="text-xs text-yellow-700">Not uploaded</p>
                )}
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                {isUploaded && (
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(doc.id, e)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.currentTarget.parentElement?.querySelector("input")?.click();
                    }}
                    className="px-3 py-2 border border-navy text-navy text-xs rounded hover:bg-navy/5 transition"
                  >
                    {isUploaded ? "Update" : "Upload"}
                  </button>
                </label>
                {isUploaded && (
                  <button
                    onClick={() => handleDelete(doc.id)}
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
    </div>
  );
}
