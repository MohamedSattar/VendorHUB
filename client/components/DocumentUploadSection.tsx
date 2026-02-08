import { Trash2 } from "lucide-react";

interface DocumentItem {
  id: string;
  label: string;
  fileName?: string;
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
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-navy mb-6">Documents</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {doc.label}
              </label>
              {doc.fileName && (
                <p className="text-xs text-gray-500">{doc.fileName}</p>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <label className="cursor-pointer">
                <input type="file" className="hidden" />
                <button className="px-3 py-1 border border-navy text-navy text-xs rounded hover:bg-navy/5 transition">
                  Upload
                </button>
              </label>
              {doc.fileName && (
                <button className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
