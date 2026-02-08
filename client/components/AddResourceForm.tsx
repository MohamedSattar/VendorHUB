import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { CandidateDetail } from "@/services/odata";

interface AddResourceFormProps {
  mode?: "new" | "edit";
  resourceData?: CandidateDetail | null;
  contactId?: string;
}

export interface FormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  uaeResident: boolean;
}

export interface AddResourceFormHandle {
  getFormData: () => FormData;
  getUAEResident: () => boolean;
  isFormValid: () => boolean;
  getPhotoUrl: () => string | null;
}

const AddResourceForm = forwardRef<AddResourceFormHandle, AddResourceFormProps>(
  function AddResourceForm({ mode = "new", resourceData }, ref) {
    const [formData, setFormData] = useState<FormData>({
      fullName: "",
      email: "",
      phoneNumber: "",
      uaeResident: false,
    });

    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoLoaded, setPhotoLoaded] = useState(false);

    // Expose form data through ref
    useImperativeHandle(ref, () => ({
      getFormData: () => formData,
      getUAEResident: () => formData.uaeResident,
    }), [formData]);

    // Bind form fields from API data when in edit mode
    useEffect(() => {
      if (mode === "edit" && resourceData) {
        setFormData({
          fullName: resourceData.name || "",
          email: resourceData.email || "",
          phoneNumber: resourceData.phoneNumber || "",
          uaeResident: resourceData.uaeResident || false,
        });
        // Set photo URL from resourceData
        if (resourceData.personalPhoto) {
          setPhotoUrl(resourceData.personalPhoto);
          setPhotoLoaded(false);
        }
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

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Candidate Details Section */}
        <h3 className="text-lg font-semibold text-navy mb-6">Candidate Details</h3>

        <div className="mb-8">
          {/* Personal Photo */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-navy mb-3">
              Personal Photo
            </label>
            <div className="flex flex-col gap-4">
              {/* Photo Display */}
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 rounded-lg bg-gray-200 border-2 border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {photoUrl && !photoLoaded ? (
                    <>
                      <img
                        src={photoUrl}
                        alt="Personal Photo"
                        className="w-full h-full object-cover"
                        onLoad={() => setPhotoLoaded(true)}
                        onError={() => setPhotoLoaded(true)}
                      />
                    </>
                  ) : photoUrl && photoLoaded ? (
                    <img
                      src={photoUrl}
                      alt="Personal Photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-4xl font-bold text-gray-400">
                        {formData.fullName.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Change Photo Section */}
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    {photoUrl ? "Current Photo" : "No photo uploaded"}
                  </p>
                  <label className="inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setPhotoUrl(url);
                          setPhotoLoaded(false);
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.currentTarget.parentElement?.querySelector("input")?.click();
                      }}
                      className="px-4 py-2 border border-navy text-navy rounded text-sm hover:bg-navy/5 transition font-medium"
                    >
                      {photoUrl ? "Change Photo" : "Upload Photo"}
                    </button>
                  </label>
                </div>
              </div>
            </div>
          </div>

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
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    uaeResident: true,
                  }))
                }
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  formData.uaeResident === true
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    uaeResident: false,
                  }))
                }
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  formData.uaeResident === false
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                No
              </button>
            </div>
            {formData.uaeResident === true && (
              <p className="text-xs text-green-600 mt-2 font-medium">
                ✓ Emirates ID is required
              </p>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }
);

AddResourceForm.displayName = "AddResourceForm";

export default AddResourceForm;
