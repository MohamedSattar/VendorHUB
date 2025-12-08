import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import AddResourceForm from "@/components/AddResourceForm";
import DocumentUploadSection from "@/components/DocumentUploadSection";
import { Plus } from "lucide-react";

export default function AddResource() {
  const navigate = useNavigate();
  const [activeResource, setActiveResource] = useState(1);
  const [resources, setResources] = useState([1]);

  const handleAddResource = () => {
    const newResourceNum = Math.max(...resources) + 1;
    setResources([...resources, newResourceNum]);
    setActiveResource(newResourceNum);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-4">Home / Add Resources</p>
            <div className="flex items-center gap-4 mb-8">
              <h1 className="text-3xl font-bold text-navy">
                External Employee Onboarding Form
              </h1>
              {/* Avatar indicators */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-sm">
                  +
                </div>
              </div>
            </div>

            {/* Import from CV button */}
            <button className="flex items-center gap-2 text-sm text-navy border border-navy px-4 py-2 rounded hover:bg-navy/5 transition">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Import from CV
            </button>
          </div>

          {/* Resource tabs */}
          <div className="mb-8 flex items-center gap-3 flex-wrap bg-white p-4 rounded-lg border border-gray-200">
            {resources.map((resourceNum) => (
              <button
                key={resourceNum}
                onClick={() => setActiveResource(resourceNum)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  activeResource === resourceNum
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-navy hover:bg-gray-200"
                }`}
              >
                Resource #{resourceNum}
              </button>
            ))}
            <button
              onClick={handleAddResource}
              className="px-3 py-2 rounded-full font-medium bg-gray-100 text-navy hover:bg-gray-200 transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Form */}
          <div className="mb-8">
            <AddResourceForm />
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
                Cancel All
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
            <button className="px-6 py-3 bg-navy text-white rounded-lg font-medium hover:bg-navy/90 transition flex items-center gap-2">
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
              Submit All
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
