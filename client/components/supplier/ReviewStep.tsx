import { ApplicationFormData } from "@/components/SupplierApplicationForm";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface ReviewStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
}

interface InfoTipProps {
  text: string;
}

function InfoTip({ text }: InfoTipProps) {
  return (
    <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-blue-700">{text}</p>
    </div>
  );
}

export default function ReviewStep({ formData }: ReviewStepProps) {
  // Helper function to check if data is complete
  const isFieldComplete = (value: any) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    if (typeof value === "number" && value === 0) return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };

  // Helper function to get choice label from value
  const getTradeLicenseTypeLabel = (value: number): string => {
    switch (value) {
      case 1:
        return "Abu Dhabi Department of Economic Development (ADDED)";
      case 2:
        return "Non-ADDED";
      default:
        return "Not selected";
    }
  };

  const sections = [
    {
      title: "Company Information",
      items: [
        { label: "Trade License Number", value: formData.tradeLicenseNumber },
        { label: "Company Name", value: formData.companyName },
        { label: "Years in Business", value: formData.yearsInBusiness },
        { label: "Number of Employees", value: formData.numberOfEmployees },
        { label: "Trade License Type", value: getTradeLicenseTypeLabel(formData.tradeLicenseType) },
        { label: "Country", value: formData.countryName || formData.country },
        { label: "City", value: formData.cityName || formData.city },
        { label: "Website", value: formData.website === "yes" ? formData.websiteUrl : "No" },
        { label: "Emirati SME", value: formData.isEmiratiSME ? "Yes" : "No" },
        { label: "Khalifa Fund Registered", value: formData.isKhalifaFundRegistered ? "Yes" : "No" },
        { label: "ICV Certificate", value: formData.hasICVCertificate ? "Yes" : "No" },
      ],
    },
    {
      title: "Operational Capabilities",
      items: [
        { label: "Environmental Practices", value: formData.hasEnvironmentalPractices ? "Yes" : "No" },
        { label: "Supply Categories", value: formData.supplyCategorySelections.join(", ") || "Not selected" },
        { label: "Main Suppliers", value: formData.suppliers.filter(s => s.name).map(s => s.name).join(", ") || "Not provided" },
      ],
    },
    {
      title: "Quality & Compliance",
      items: [
        { label: "Has Certifications", value: formData.hasCertifications ? "Yes" : "No" },
        { label: "Certifications", value: formData.certifications || (formData.hasCertifications ? "No details provided" : "N/A") },
      ],
    },
    {
      title: "Supplier Declaration",
      items: [
        { label: "Full Name", value: formData.fullName },
        { label: "Designation", value: formData.designation },
        { label: "Phone", value: formData.phone },
        { label: "Email", value: formData.email },
        { label: "Date", value: formData.date },
      ],
    },
    {
      title: "Attachments",
      items: [
        { label: "Trade License", value: formData.attachments.tradeLicense ? "✓ Uploaded" : "✗ Not uploaded" },
        { label: "Company Profile", value: formData.attachments.companyProfile ? "✓ Uploaded" : "✗ Not uploaded" },
        { label: "Power of Attorney", value: formData.attachments.powerOfAttorney ? "✓ Uploaded" : "✗ Not uploaded" },
        { label: "ICV Certificate", value: formData.attachments.icvCertificate ? "✓ Uploaded" : "Optional" },
      ],
    },
  ];

  // Check if mandatory fields are complete
  const isMandatoryComplete =
    formData.tradeLicenseNumber &&
    formData.companyName &&
    formData.yearsInBusiness &&
    formData.numberOfEmployees &&
    formData.tradeLicenseType > 0 &&
    formData.supplyCategorySelections.length > 0 &&
    formData.fullName &&
    formData.designation &&
    formData.phone &&
    formData.email &&
    formData.date &&
    formData.attachments.tradeLicense &&
    formData.attachments.companyProfile &&
    formData.attachments.powerOfAttorney;

  return (
    <div className="space-y-8">
      {/* Submission Status */}
      <div
        className={`p-4 rounded-lg border ${
          isMandatoryComplete
            ? "bg-green-50 border-green-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-start gap-3">
          {isMandatoryComplete ? (
            <>
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-green-900">Ready to Submit</h3>
                <p className="text-sm text-green-800 mt-1">
                  All mandatory fields are complete. You can now submit your application.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-900">Incomplete Application</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  Some mandatory fields are missing. Please review and complete all required fields before submission.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <InfoTip text="Please carefully review all information before submitting. Once submitted, this application will be processed and you will receive confirmation via email." />

      {/* Review Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-navy">{section.title}</h3>
            </div>

            {/* Section Items */}
            <div className="divide-y divide-gray-200">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="px-4 py-3 flex items-start justify-between hover:bg-gray-50 transition"
                >
                  <p className="font-medium text-gray-700 text-sm">{item.label}</p>
                  <p
                    className={`text-sm text-right max-w-md ${
                      isFieldComplete(item.value)
                        ? "text-gray-900 font-medium"
                        : "text-gray-400 italic"
                    }`}
                  >
                    {item.value || "Not provided"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Client References Summary */}
      {formData.clientReferences.some(r => r.name) && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-navy">Client References</h3>
          </div>
          <div className="p-4 space-y-4">
            {formData.clientReferences.map((ref, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="font-semibold text-navy mb-2">Reference {index + 1}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {ref.name || "Not provided"}
                  </p>
                  <p>
                    <span className="font-medium">Org:</span> {ref.organization || "Not provided"}
                  </p>
                  <p className="col-span-2">
                    <span className="font-medium">Email:</span> {ref.email || "Not provided"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="font-semibold text-red-900 mb-2">Before You Submit</h4>
        <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
          <li>Review all information carefully for accuracy</li>
          <li>Ensure all mandatory fields are completed</li>
          <li>Verify that all attachments are properly uploaded</li>
          <li>Confirm that you have authorization to submit this application</li>
          <li>Once submitted, you will receive a confirmation email with tracking ID</li>
        </ul>
      </div>
    </div>
  );
}
