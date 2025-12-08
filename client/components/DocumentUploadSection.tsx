import { Upload } from "lucide-react";
import { useState } from "react";

interface UploadField {
  id: string;
  label: string;
  acceptedFormats: string;
}

const uploadFields: UploadField[] = [
  { id: "id-front", label: "Upload ID front image", acceptedFormats: "image/*" },
  { id: "id-back", label: "Upload ID back image", acceptedFormats: "image/*" },
  { id: "passport", label: "Upload Passport image", acceptedFormats: "image/*" },
  {
    id: "emirates-front",
    label: "Upload Emirates ID (front) image",
    acceptedFormats: "image/*",
  },
  {
    id: "emirates-back",
    label: "Upload Emirates ID (back) image",
    acceptedFormats: "image/*",
  },
  {
    id: "cv",
    label: "Upload CV (pdf, excel, etc.)",
    acceptedFormats: ".pdf,.doc,.docx,.xls,.xlsx",
  },
];

interface UploadFieldComponentProps {
  field: UploadField;
}

function UploadFieldComponent({ field }: UploadFieldComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFileName(files[0].name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFileName(files[0].name);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-navy mb-3">
        {field.label}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          isDragging
            ? "border-navy bg-navy/5"
            : "border-gray-300 hover:border-navy/50"
        }`}
      >
        {fileName ? (
          <div className="text-center">
            <p className="text-sm font-medium text-green-600 mb-2">✓ {fileName}</p>
            <button
              type="button"
              onClick={() => setFileName(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Change file
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              No uploaded files yet
            </p>
            <label className="inline-block">
              <input
                type="file"
                accept={field.acceptedFormats}
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="text-navy font-semibold cursor-pointer hover:underline">
                Choose file
              </span>
            </label>
          </>
        )}
      </div>
    </div>
  );
}

export default function DocumentUploadSection() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-navy mb-6">
        Upload Resource Documents
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {uploadFields.map((field) => (
          <UploadFieldComponent key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
}
