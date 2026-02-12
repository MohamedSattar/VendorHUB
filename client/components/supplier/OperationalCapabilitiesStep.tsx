import { ApplicationFormData } from "@/components/SupplierApplicationForm";
import { Info } from "lucide-react";

interface OperationalCapabilitiesStepProps {
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

const SUPPLY_CATEGORIES = [
  "Human Resources & Staff Development",
  "Professional & Advisory Services",
  "IT Systems, Licenses, Support & Maintenance",
  "Facilities & Operational Services",
  "Events, Marketing & Communications",
  "Office & Administrative Supplies",
  "Travel & Employee-Related Services",
];

export default function OperationalCapabilitiesStep({
  formData,
  updateFormData,
}: OperationalCapabilitiesStepProps) {
  const handleCategoryToggle = (category: string) => {
    const selections = formData.supplyCategorySelections;
    if (selections.includes(category)) {
      updateFormData({
        supplyCategorySelections: selections.filter((c) => c !== category),
      });
    } else {
      updateFormData({
        supplyCategorySelections: [...selections, category],
      });
    }
  };

  const handleSupplierChange = (index: number, value: string) => {
    const newSuppliers = [...formData.suppliers];
    newSuppliers[index].name = value;
    updateFormData({ suppliers: newSuppliers });
  };

  const handleReferenceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const newReferences = [...formData.clientReferences];
    newReferences[index] = { ...newReferences[index], [field]: value };
    updateFormData({ clientReferences: newReferences });
  };

  return (
    <div className="space-y-8">
      {/* Environmental Practices */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          Does your company implement environmentally responsible practices? <span className="text-red-600">*</span>
        </label>
        <div className="space-y-2 mb-4">
          {[
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ].map((option) => (
            <label key={String(option.value)} className="flex items-center">
              <input
                type="radio"
                name="environmentalPractices"
                checked={formData.hasEnvironmentalPractices === option.value}
                onChange={() => updateFormData({ hasEnvironmentalPractices: option.value })}
                className="w-4 h-4 text-primary"
              />
              <span className="ml-3 text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>

        {formData.hasEnvironmentalPractices && (
          <textarea
            value={formData.environmentalPracticesDetails}
            onChange={(e) =>
              updateFormData({ environmentalPracticesDetails: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Please specify your environmental practices (e.g., recycling, energy efficiency, sustainable sourcing)"
            rows={4}
          />
        )}
        <InfoTip text="Environmental responsibility is increasingly important in business operations. Share details about your sustainability initiatives, green certifications, waste management, or energy-efficient practices." />
      </div>

      {/* Category of Supply/Service */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          What is your company's primary Category of Supply / Service? <span className="text-red-600">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-4">(Select all that apply)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SUPPLY_CATEGORIES.map((category) => (
            <label key={category} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.supplyCategorySelections.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="w-4 h-4 text-primary rounded"
              />
              <span className="ml-3 text-gray-700 text-sm">{category}</span>
            </label>
          ))}
        </div>
        <InfoTip text="Selecting your service categories helps us understand your core business capabilities and match you with relevant opportunities and procurement requirements." />
      </div>

      {/* Main Suppliers */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-4">
          Please list your three main suppliers <span className="text-red-600">*</span>
        </label>
        <div className="space-y-3">
          {formData.suppliers.map((supplier, index) => (
            <div key={index}>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                Supplier {index + 1}
              </label>
              <input
                type="text"
                value={supplier.name}
                onChange={(e) => handleSupplierChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={`Enter supplier ${index + 1} name`}
              />
            </div>
          ))}
        </div>
        <InfoTip text="List your key suppliers to demonstrate your supply chain network and reliability. This helps assess your operational stability and sourcing capabilities." />
      </div>

      {/* Client References */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-4">
          Please provide two client references for similar or relevant projects <span className="text-red-600">*</span>
        </label>
        <div className="space-y-6">
          {formData.clientReferences.map((reference, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-semibold text-navy mb-4">Client {index + 1}</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={reference.name}
                  onChange={(e) => handleReferenceChange(index, "name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Contact Person Name"
                />
                <input
                  type="text"
                  value={reference.organization}
                  onChange={(e) =>
                    handleReferenceChange(index, "organization", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Organization"
                />
                <input
                  type="email"
                  value={reference.email}
                  onChange={(e) => handleReferenceChange(index, "email", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Email"
                />
                <input
                  type="text"
                  value={reference.category}
                  onChange={(e) =>
                    handleReferenceChange(index, "category", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Category / Service Type"
                />
                <input
                  type="text"
                  value={reference.projectName}
                  onChange={(e) =>
                    handleReferenceChange(index, "projectName", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Project Name"
                />
              </div>
            </div>
          ))}
        </div>
        <InfoTip text="Client references validate your track record and experience. Provide details of previous clients you've worked with on similar projects so we can verify your capabilities." />
      </div>
    </div>
  );
}
