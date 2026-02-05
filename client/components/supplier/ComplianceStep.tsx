import { ApplicationFormData } from "@/components/SupplierApplicationForm";

interface ComplianceStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
}

const CERTIFICATION_OPTIONS = [
  { value: "iso", label: "ISO" },
  { value: "fsc", label: "FSC" },
  { value: "hse", label: "HSE" },
];

export default function ComplianceStep({
  formData,
  updateFormData,
}: ComplianceStepProps) {
  return (
    <div className="space-y-6">
      {/* Section C: Quality & Compliance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-navy mb-2">Section C: Quality & Compliance</h3>
        <p className="text-sm text-gray-700">
          Please provide information about your company's certifications and compliance status.
        </p>
      </div>

      {/* C1. Certifications */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          C1. Do you hold any relevant certifications (e.g., ISO, FSC, HSE, etc.)?
        </label>
        <div className="space-y-2 mb-4">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((option) => (
            <label key={String(option.value)} className="flex items-center">
              <input
                type="radio"
                name="hasCertifications"
                checked={formData.hasCertifications === option.value}
                onChange={() => updateFormData({ hasCertifications: option.value })}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>

        {formData.hasCertifications && (
          <div className="space-y-4">
            {/* Standard Certifications */}
            <div>
              <p className="text-sm text-gray-600 mb-3">Select applicable certifications:</p>
              <div className="space-y-2">
                {CERTIFICATION_OPTIONS.map((cert) => (
                  <label key={cert.value} className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.certifications.includes(cert.label)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFormData({
                            certifications: (formData.certifications ? formData.certifications + ", " : "") + cert.label,
                          });
                        } else {
                          const certs = formData.certifications
                            .split(", ")
                            .filter((c) => c !== cert.label)
                            .join(", ");
                          updateFormData({ certifications: certs });
                        }
                      }}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span className="ml-3 text-gray-700">{cert.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Other Certifications */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Other certifications (please specify):
              </label>
              <textarea
                value={formData.otherCertifications}
                onChange={(e) => updateFormData({ otherCertifications: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Industry-specific certifications, quality management systems, etc."
                rows={4}
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">Quality & Compliance Importance</h4>
        <p className="text-sm text-green-800">
          Certifications and compliance documentation help us verify your company's commitment to quality and adherence to industry standards. 
          This information is crucial for our partnership evaluation process.
        </p>
      </div>
    </div>
  );
}
