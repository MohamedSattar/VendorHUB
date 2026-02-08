import { useState } from "react";
import { X, ChevronDown, Upload } from "lucide-react";
import { EngagementContact } from "@/services/odata";

interface EditResourceModalProps {
  isOpen: boolean;
  contact: EngagementContact | null;
  onClose: () => void;
}

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
    id: "contact",
    title: "Contact Information",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.26.559.738 1.382 1.498 2.142.759.76 1.583 1.237 2.142 1.498l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 4 14.18 4 9.5V5a1 1 0 01-1-1H3z" />
      </svg>
    ),
  },
  {
    id: "documents",
    title: "Documents & Files",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
    ),
  },
];

interface CollapsibleSectionProps {
  section: FormSection;
  isOpen: boolean;
  onToggle: () => void;
  contact: EngagementContact | null;
}

function CollapsibleSection({
  section,
  isOpen,
  onToggle,
  contact,
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
          {section.id === "personal" && (
            <div className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-navy mb-3">
                  Personal Photo
                </label>
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {contact?.personalPhoto ? (
                      <img
                        src={contact.personalPhoto}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400">
                        {contact?.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition">
                    <Upload className="w-4 h-4" />
                    Change Photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={contact?.name || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={contact?.email || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue={contact?.phoneNumber || ""}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
              </div>
            </div>
          )}

          {section.id === "contact" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue={contact?.phoneNumber || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={contact?.email || ""}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-navy mb-2">
                  Status
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20">
                  <option value="assigned">Assigned</option>
                  <option value="not-assigned">Not Assigned</option>
                </select>
              </div>
            </div>
          )}

          {section.id === "documents" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">Upload or manage resource documents</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "CV/Resume",
                  "Introduction Document",
                  "Educational Certificate",
                  "EID/Passport",
                  "Salary Certificate",
                  "Experience Letter",
                  "Police Clearance",
                ].map((docName) => (
                  <div
                    key={docName}
                    className="flex items-center justify-between p-3 border border-gray-300 rounded hover:bg-gray-50 transition"
                  >
                    <span className="text-sm text-gray-700">{docName}</span>
                    <button className="px-3 py-1 border border-navy text-navy text-xs rounded hover:bg-navy/5 transition">
                      Upload
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EditResourceModal({
  isOpen,
  contact,
  onClose,
}: EditResourceModalProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["personal"])
  );

  const toggleSection = (id: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenSections(newOpen);
  };

  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-navy">Edit Resource</h2>
            <p className="text-sm text-gray-600 mt-1">{contact.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Sections */}
        <div className="bg-white">
          {sections.map((section) => (
            <CollapsibleSection
              key={section.id}
              section={section}
              isOpen={openSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              contact={contact}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
