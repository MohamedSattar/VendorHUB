import { ApplicationFormData } from "@/components/SupplierApplicationForm";

interface DeclarationStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
}

export default function DeclarationStep({
  formData,
  updateFormData,
}: DeclarationStepProps) {
  return (
    <div className="space-y-6">
      {/* Declaration Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-900 mb-2">Section D: Supplier Declaration</h3>
        <p className="text-sm text-red-800">
          This declaration confirms that all information provided in this questionnaire is true, complete, and accurate.
        </p>
      </div>

      {/* Declaration Text */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-6">
        <p className="text-gray-700 italic mb-4">
          "I hereby declare that all the information provided in this questionnaire is true, complete, and accurate to the 
          best of my knowledge. I confirm that by submitting this questionnaire, my company agrees to comply with the requirements 
          of the Abu Dhabi Early Childhood Authority (ECA) and understands that any false or misleading information may result 
          in disqualification."
        </p>
      </div>

      {/* Declaration Details */}
      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => updateFormData({ fullName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Designation / Position */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Designation / Position *
          </label>
          <input
            type="text"
            value={formData.designation}
            onChange={(e) => updateFormData({ designation: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Managing Director, CEO, etc."
            required
          />
        </div>

        {/* Phone / Mobile */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Phone / Mobile *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+971 XX XXX XXXX"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your email address"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-navy mb-2">
            Date *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => updateFormData({ date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>

        {/* Signature Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-navy mb-2">Signature & Company Stamp</h4>
          <p className="text-sm text-gray-700 mb-3">
            Digital signatures or scanned company stamps will be collected in the attachments section. 
            You may also provide these documents as part of your Company Profile in the next step.
          </p>
          <p className="text-xs text-gray-600 italic">
            Note: The signature field and company stamp can be submitted as a PDF or image file in the attachments section.
          </p>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-900 mb-2">Important Notice</h4>
        <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
          <li>All fields marked with * are mandatory</li>
          <li>False or misleading information may result in disqualification</li>
          <li>This declaration is legally binding</li>
          <li>Ensure the authorized person signs the declaration</li>
        </ul>
      </div>
    </div>
  );
}
