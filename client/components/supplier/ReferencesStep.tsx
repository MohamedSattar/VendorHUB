import { ApplicationFormData } from "@/components/SupplierApplicationForm";
import { Info } from "lucide-react";

interface ReferencesStepProps {
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

export default function ReferencesStep({
  formData,
}: ReferencesStepProps) {
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-navy mb-2">Client References Review</h3>
        <p className="text-sm text-gray-700">
          Below is a summary of the client references you provided. These will be used to verify your company's experience and capabilities.
        </p>
      </div>

      {/* References Summary */}
      <div className="space-y-4">
        {formData.clientReferences.map((reference, index) => (
          <div
            key={index}
            className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Contact Person
                </p>
                <p className="text-gray-900 font-medium">
                  {reference.name || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Organization
                </p>
                <p className="text-gray-900 font-medium">
                  {reference.organization || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Email
                </p>
                <p className="text-gray-900 font-medium">
                  {reference.email || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Category / Service Type
                </p>
                <p className="text-gray-900 font-medium">
                  {reference.category || "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-600 font-semibold uppercase mb-1">
                  Project Name
                </p>
                <p className="text-gray-900 font-medium">
                  {reference.projectName || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoTip text="Review the information above carefully. Your references are critical for verifying your experience and capabilities. Our team may contact them directly to validate the details you've provided." />

      {/* Information Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-900 mb-2">Reference Verification Tips</h4>
        <p className="text-sm text-yellow-800 mb-2">
          Please ensure that the contact information you provided is accurate and current. 
          Our team may reach out to these references to verify your company's experience and the quality of your work.
        </p>
        <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
          <li>Ensure contacts are willing to serve as references</li>
          <li>Double-check email addresses and phone numbers for accuracy</li>
          <li>Provide accurate project descriptions and delivery timelines</li>
          <li>Include diverse references showing range of experience</li>
        </ul>
      </div>
    </div>
  );
}
