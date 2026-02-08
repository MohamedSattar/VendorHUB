import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { CandidateDetail } from "@/services/odata";

interface AddResourceFormProps {
  mode?: "new" | "edit";
  resourceData?: CandidateDetail | null;
}

interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  uaeResident: boolean;
  personalPhoto: string | null;
}

export default function AddResourceForm({ mode = "new", resourceData }: AddResourceFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    uaeResident: false,
    personalPhoto: null,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Bind form fields from API data when in edit mode
  useEffect(() => {
    if (mode === "edit" && resourceData) {
      setFormData({
        fullName: resourceData.name || "",
        email: resourceData.email || "",
        phoneNumber: resourceData.phoneNumber || "",
        uaeResident: resourceData.uaeResident || false,
        personalPhoto: resourceData.personalPhoto || null,
      });
    }
  }, [mode, resourceData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        personalPhoto: previewUrl,
      }));
    }
  };

  const handlePhotoDelete = () => {
    setPhotoFile(null);
    setFormData((prev) => ({
      ...prev,
      personalPhoto: null,
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Candidate Details Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-navy mb-6">Candidate Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-navy mb-2">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+971 50 000 0000"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* UAE Resident Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-navy mb-4">
              UAE Resident
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="uaeResident"
                  checked={formData.uaeResident === true}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uaeResident: true,
                    }))
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="uaeResident"
                  checked={formData.uaeResident === false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      uaeResident: false,
                    }))
                  }
                  className="w-4 h-4 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">No</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
