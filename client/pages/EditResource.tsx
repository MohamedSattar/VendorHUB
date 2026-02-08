import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import AddResourceForm from "@/components/AddResourceForm";
import DocumentUploadSection from "@/components/DocumentUploadSection";
import { ChevronLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useContactDetails } from "@/hooks/useContactDetails";

export default function EditResource() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch full contact details for editing
  const { data: contactDetails, isLoading, error } = useContactDetails(id);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement actual save logic to backend
      console.log("Saving resource:", id);
      // After saving, redirect back to resources
      setTimeout(() => {
        navigate("/resources");
      }, 500);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-navy mb-4"></div>
            <p className="text-gray-600">Loading resource...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !contactDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <DashboardHeader />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Resource Not Found
            </h2>
            <p className="text-red-700 mb-4">
              {error?.message || "The resource you're trying to edit could not be found."}
            </p>
            <button
              onClick={() => navigate("/resources")}
              className="text-red-700 font-medium hover:text-red-800 underline"
            >
              Back to Resources
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/resources")}
              className="flex items-center gap-2 text-navy font-medium mb-4 hover:text-primary transition"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Resources
            </button>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">Home / Resources / Edit</p>
                <h1 className="text-3xl font-bold text-navy">Edit Resource</h1>
              </div>
              {contactDetails && (
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Resource:</p>
                  <p className="text-lg font-semibold text-navy">{contactDetails.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Resource Info Section */}
          {contactDetails && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Photo */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center mb-4">
                    {contactDetails.personalPhoto ? (
                      <img
                        src={contactDetails.personalPhoto}
                        alt={contactDetails.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="text-4xl font-bold text-gray-400">
                        {contactDetails.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button className="px-4 py-2 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-100 transition">
                    Change Photo
                  </button>
                </div>

                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Full Name</label>
                      <p className="font-medium text-navy">{contactDetails.name}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Email</label>
                      <p className="font-medium text-navy">{contactDetails.email || "—"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Phone</label>
                      <p className="font-medium text-navy">{contactDetails.phoneNumber || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-4">Status</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500">Assignment Status</label>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            contactDetails.status === "Assigned"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {contactDetails.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="mb-12">
            <AddResourceForm mode="edit" resourceData={contactDetails} />
          </div>

          {/* Document Upload Section */}
          <div className="mb-12">
            <DocumentUploadSection />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center gap-4 mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/resources")}
                className="px-6 py-3 border border-navy text-navy rounded-lg font-medium hover:bg-navy/5 transition"
              >
                Cancel
              </button>
              <button className="px-6 py-3 border border-gray-300 text-navy rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"
                  />
                </svg>
                Save Draft
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 disabled:opacity-50 transition flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
