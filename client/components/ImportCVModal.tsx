import { useState } from "react";
import { Upload, X } from "lucide-react";

interface ImportCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
}

export default function ImportCVModal({
  isOpen,
  onClose,
  onFileSelected,
}: ImportCVModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!isOpen) return null;

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
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid CV file (PDF, DOC, or DOCX)");
      return;
    }

    setSelectedFile(file);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    // Simulate processing the CV
    // In a real application, you would send this to a backend API
    // that would extract information using OCR or document parsing
    setTimeout(() => {
      setIsProcessing(false);
      onFileSelected(selectedFile);
      onClose();
      setSelectedFile(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-navy">Import from CV</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Upload your CV (PDF, DOC, or DOCX) to automatically fill in your
            form details. We'll extract information like your name, contact
            details, qualifications, and work experience.
          </p>

          {selectedFile ? (
            <div className="space-y-4">
              {/* Selected file info */}
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-12 h-12 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-green-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Processing info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  ℹ️ Your CV will be processed to extract personal information,
                  qualifications, and work experience. You can review and edit
                  the details after import.
                </p>
              </div>

              {/* Change file button */}
              <button
                onClick={() => setSelectedFile(null)}
                className="text-sm text-navy font-medium hover:underline"
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-lg p-12 text-center transition ${
                isDragging
                  ? "border-navy bg-navy/5"
                  : "border-gray-300 hover:border-navy/50"
              }`}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-navy mb-2">
                Drop your CV here
              </h3>
              <p className="text-gray-600 mb-4">
                or click to browse your computer
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Supported formats: PDF, DOC, DOCX (Max 10 MB)
              </p>
              <label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="inline-block px-6 py-3 bg-navy text-white font-semibold rounded-lg hover:bg-navy/90 transition cursor-pointer">
                  Select CV File
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-navy rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleProcess}
            disabled={!selectedFile || isProcessing}
            className="px-6 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing && (
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isProcessing ? "Processing..." : "Import CV"}
          </button>
        </div>
      </div>
    </div>
  );
}
