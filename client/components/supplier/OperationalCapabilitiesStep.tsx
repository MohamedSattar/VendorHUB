import { ApplicationFormData } from "@/components/SupplierApplicationForm";

interface OperationalCapabilitiesStepProps {
  formData: ApplicationFormData;
  updateFormData: (updates: Partial<ApplicationFormData>) => void;
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
      {/* B1. Environmental Practices */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          B1. Does your company implement environmentally responsible practices?
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
      </div>

      {/* B2. Category of Supply/Service */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-3">
          B2. What is your company's primary Category of Supply / Service? *
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
      </div>

      {/* B3. Main Suppliers */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-4">
          B3. Please list your three main suppliers *
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
      </div>

      {/* B4. Client References */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-4">
          B4. Please provide two client references for similar or relevant projects *
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
      </div>
    </div>
  );
}
