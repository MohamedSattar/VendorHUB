import { ApplicationFormData } from "@/components/SupplierApplicationForm";
import { Upload, File, X } from "lucide-react";

interface AttachmentsStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
}

const REQUIRED_ATTACHMENTS = [
  {
    key: "tradeLicense",
    label: "Trade License (TL)",
    description: "Copy of your company's trade license",
    required: true,
  },
  {
    key: "companyProfile",
    label: "Company Profile",
    description: "Brief company profile or company overview document",
    required: true,
  },
  {
    key: "powerOfAttorney",
    label: "Power of Attorney (POA)",
    description: "Authorization document if applicable",
    required: true,
  },
  {
    key: "icvCertificate",
    label: "ICV Certificate",
    description: "If available (optional but encouraged)",
    required: false,
  },
];

export default function AttachmentsStep({
  formData,
  updateFormData,
}: AttachmentsStepProps) {
  const handleFileChange = (
    key: keyof typeof formData.attachments,
    file: File | null
  ) => {
    updateFormData({
      attachments: {
        ...formData.attachments,
        [key]: file,
      },
    });
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    key: keyof typeof formData.attachments
  ) => {
    const file = event.target.files?.[0] || null;
    handleFileChange(key, file);
  };

  return (
    <div className="space-y-6">
      {/* Section E Header */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">
          Section E: Mandatory Attachments
        </h3>
        <p className="text-sm text-purple-800">
          Please upload the required documents to complete your application.
        </p>
      </div>

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Upload Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Supported formats: PDF, DOC, DOCX, JPG, PNG</li>
          <li>Maximum file size: 10 MB per document</li>
          <li>Ensure documents are clear and legible</li>
          <li>All mandatory documents must be uploaded</li>
        </ul>
      </div>

      {/* Attachments List */}
      <div className="space-y-4">
        {REQUIRED_ATTACHMENTS.map((attachment) => {
          const file = formData.attachments[attachment.key as keyof typeof formData.attachments];

          return (
            <div
              key={attachment.key}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-navy flex items-center gap-2">
                    {attachment.label}
                    {attachment.required && (
                      <span className="text-red-500 font-bold">*</span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {attachment.description}
                  </p>
                </div>
              </div>

              {/* File Upload Area */}
              {!file ? (
                <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition">
                  <Upload size={20} className="text-gray-500" />
                  <div className="text-center">
                    <p className="font-medium text-gray-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG (max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={(e) =>
                      handleFileSelect(
                        e,
                        attachment.key as keyof typeof formData.attachments
                      )
                    }
                    accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <File size={20} className="text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{file.name}</p>
                      <p className="text-xs text-green-700">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFileChange(attachment.key as keyof typeof formData.attachments, null)}
                    className="p-1 hover:bg-red-100 rounded transition"
                  >
                    <X size={20} className="text-red-600" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Important Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Important Notice</h4>
        <p className="text-sm text-red-800 mb-2">
          All mandatory attachments (*) must be uploaded before you can submit your application.
        </p>
        <p className="text-sm text-red-800">
          Ensure that all documents are clear, legible, and contain the required information. 
          Incomplete or unclear documents may result in application rejection.
        </p>
      </div>
    </div>
  );
}
