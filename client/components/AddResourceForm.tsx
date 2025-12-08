import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FormSection {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const sections: FormSection[] = [
  {
    id: "personal",
    title: "Personal Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
      </svg>
    ),
  },
  {
    id: "non-locals",
    title: "Details for Non-locals",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
      </svg>
    ),
  },
  {
    id: "bank",
    title: "Bank Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" />
      </svg>
    ),
  },
  {
    id: "qualification",
    title: "Qualification Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    id: "social",
    title: "Social and Family Status Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 6a3 3 0 11-6 0 3 3 0 016 0zm12 0a3 3 0 11-6 0 3 3 0 016 0zM9 6a3 3 0 11-6 0 3 3 0 016 0zm7 9a4 4 0 11-8 0 4 4 0 018 0zm-7 4a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
    ),
  },
  {
    id: "relatives",
    title: "Relatives Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
      </svg>
    ),
  },
  {
    id: "friends",
    title: "Friends Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM16 11a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    ),
  },
  {
    id: "living",
    title: "Living Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    id: "acts",
    title: "Acts Performed within the Country",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
      </svg>
    ),
  },
  {
    id: "visited",
    title: "Countries He has Visited Before",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 4a4 4 0 110 8 4 4 0 010-8zM2 9a7 7 0 1112.658.662l2.825 2.825a1 1 0 11-1.414 1.414l-2.825-2.825A7 7 0 012 9z" />
      </svg>
    ),
  },
  {
    id: "worked",
    title: "Countries He has Worked in Before",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 4a4 4 0 110 8 4 4 0 010-8zM2 9a7 7 0 1112.658.662l2.825 2.825a1 1 0 11-1.414 1.414l-2.825-2.825A7 7 0 012 9z" />
      </svg>
    ),
  },
  {
    id: "car",
    title: "Car Details and Drive License",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 9V7a1 1 0 011-1h8a1 1 0 011 1v2M5 9c0 1-1 4-1 5v3h12v-3c0-1-1-4-1-5M5 9h10m-7 5a1 1 0 11-2 0 1 1 0 012 0zm6 0a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
  {
    id: "military",
    title: "Military Details",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 7H7v6h6V7z" />
      </svg>
    ),
  },
];

interface CollapsibleSectionProps {
  section: FormSection;
  isOpen: boolean;
  onToggle: () => void;
}

function CollapsibleSection({
  section,
  isOpen,
  onToggle,
}: CollapsibleSectionProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-navy">{section.icon}</span>
          <span className="font-medium text-navy">{section.title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.id === "personal" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    placeholder="Ahmed Alef Elrafra"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    First Name*
                  </label>
                  <input
                    type="text"
                    placeholder="Ahmed"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Surname*
                  </label>
                  <input
                    type="text"
                    placeholder="Elrafra"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Date of Birth*
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Place of Birth*
                  </label>
                  <input
                    type="text"
                    placeholder="New York"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Current Nationality*
                  </label>
                  <input
                    type="text"
                    placeholder="USA"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Religion
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Sect
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Entries ID No.*
                  </label>
                  <input
                    type="text"
                    placeholder="AE1-123456"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Family Book No.
                  </label>
                  <input
                    type="text"
                    placeholder="12312"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Family No.
                  </label>
                  <input
                    type="text"
                    placeholder="12312"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Town No.
                  </label>
                  <input
                    type="text"
                    placeholder="1232"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Passport No.*
                  </label>
                  <input
                    type="text"
                    placeholder="AE234432"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Issuing Authority*
                  </label>
                  <input
                    type="text"
                    placeholder="Place"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Date of Issue*
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Date of Expiry*
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Father's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Mother's Name
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Their Nationality
                  </label>
                  <input
                    type="text"
                    placeholder="AE1-12345-4323"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Their DOB
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Their Place of Birth
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Their Position
                  </label>
                  <input
                    type="text"
                    placeholder="AE1-43894-43833"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Their Place of Work
                  </label>
                  <input
                    type="text"
                    placeholder="Tech-Only"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Previous Nationality
                  </label>
                  <input
                    type="text"
                    placeholder="If applicable"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
              </>
            )}

            {section.id !== "personal" && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>Form fields for {section.title} will be added here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddResourceForm() {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["personal"]));

  const toggleSection = (id: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenSections(newOpen);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {sections.map((section) => (
        <CollapsibleSection
          key={section.id}
          section={section}
          isOpen={openSections.has(section.id)}
          onToggle={() => toggleSection(section.id)}
        />
      ))}
    </div>
  );
}
