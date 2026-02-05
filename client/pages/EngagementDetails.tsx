import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { EngagementItem, fetchEngagementById } from "@/services/odata";
import { useOpenRoles } from "@/hooks/useOpenRoles";

interface EngagementDetailsData extends EngagementItem {
  budget?: number;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Mock data for fallback
const mockEngagements: Record<string, EngagementDetailsData> = {
  "1": {
    id: "1",
    name: "Cloud Migration Project Phase 1",
    ecaEngagementManager: "Ahmed Abdullah",
    startDate: "2025-10-10",
    endDate: "2025-12-15",
    status: "Pending Vendor Submission",
    createdOn: "2025-01-01",
    modifiedOn: "2025-01-15",
    description: "This engagement involves migrating our infrastructure to a cloud-based environment, ensuring minimal downtime and optimal performance.",
    vendorName: "Tech Solutions LLC",
    contractNumber: "CTR-2025-001",
    contractDescription: "Cloud infrastructure migration and implementation services",
    typeOfEngagement: "Services",
    budget: 500000,
  },
  "2": {
    id: "2",
    name: "ERP System Upgrade",
    ecaEngagementManager: "Ali Khouri",
    startDate: "2025-10-01",
    endDate: "2025-11-30",
    status: "Pending Vendor Submission",
    createdOn: "2025-01-01",
    modifiedOn: "2025-01-15",
    description: "Upgrading the current ERP system to the latest version with enhanced features and improved performance.",
    vendorName: "Enterprise Systems Inc",
    contractNumber: "CTR-2025-002",
    contractDescription: "ERP system upgrade and implementation",
    typeOfEngagement: "Software License",
    budget: 350000,
  },
};

const getStatusColor = (status: string): string => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower.includes("progress") || statusLower.includes("pending")) {
    return "bg-orange-100 text-orange-700";
  }
  if (statusLower.includes("completed") || statusLower.includes("done")) {
    return "bg-green-100 text-green-700";
  }
  if (statusLower.includes("hold") || statusLower.includes("suspended")) {
    return "bg-yellow-100 text-yellow-700";
  }
  if (statusLower.includes("planned") || statusLower.includes("scheduled")) {
    return "bg-purple-100 text-purple-700";
  }
  return "bg-gray-100 text-gray-700";
};

export default function EngagementDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isArabic } = useLanguage();

  // Fetch engagement data from API
  const {
    data: apiEngagement,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["engagement", id],
    queryFn: () => (id ? fetchEngagementById(id) : Promise.reject("No ID")),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Use API data if available, otherwise fallback to mock data
  const engagement: EngagementDetailsData | null =
    apiEngagement ||
    (id && mockEngagements[id] ? mockEngagements[id] : null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<EngagementDetailsData>>({
    name: engagement?.name,
    description: engagement?.description,
    vendorName: engagement?.vendorName,
    contractNumber: engagement?.contractNumber,
    contractDescription: engagement?.contractDescription,
    typeOfEngagement: engagement?.typeOfEngagement,
    budget: engagement?.budget,
    startDate: engagement?.startDate,
    endDate: engagement?.endDate,
  });

  // Update edit data when engagement data changes
  useEffect(() => {
    if (engagement) {
      setEditData({
        name: engagement.name,
        description: engagement.description,
        vendorName: engagement.vendorName,
        contractNumber: engagement.contractNumber,
        contractDescription: engagement.contractDescription,
        typeOfEngagement: engagement.typeOfEngagement,
        budget: engagement.budget,
        startDate: engagement.startDate,
        endDate: engagement.endDate,
      });
    }
  }, [engagement]);

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!editData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Engagement name is required.",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    if (engagement) {
      setEngagement({
        ...engagement,
        ...editData,
      });
    }

    setIsEditMode(false);
    toast({
      title: "Success",
      description: "Engagement has been saved successfully.",
    });
  };

  const handleCancel = () => {
    setEditData({
      name: engagement?.name,
      description: engagement?.description,
      budget: engagement?.budget,
      startDate: engagement?.startDate,
      endDate: engagement?.endDate,
    });
    setIsEditMode(false);
  };

  if (!engagement) {
    return (
      <div className={`flex flex-col min-h-screen bg-gray-50 ${isArabic ? "rtl" : "ltr"}`}>
        <DashboardHeader />
        <main className="flex-grow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-navy hover:text-primary mb-6 transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-navy mb-4">Engagement Not Found</h1>
              <p className="text-gray-600">The engagement you're looking for doesn't exist.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`flex flex-col min-h-screen bg-gray-50 ${isArabic ? "rtl" : "ltr"}`} dir={isArabic ? "rtl" : "ltr"}>
      <DashboardHeader />

      <main className="flex-grow">
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isArabic ? "text-right" : "text-left"}`}>
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-navy hover:text-primary mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">Pages / Engagements / Details</p>
            <h1 className="text-3xl font-bold text-navy">{engagement.name}</h1>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              <p className="text-gray-600">Loading engagement details...</p>
            </div>
          )}

          {/* Error state */}
          {error && engagement && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-yellow-800 mb-4">
                Unable to fetch from API. Showing cached or sample data.
              </p>
              <button
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
              >
                <RefreshCw size={18} />
                Retry
              </button>
            </div>
          )}

          {/* Not found error */}
          {error && !engagement && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-800">Unable to load engagement details.</p>
            </div>
          )}

          {/* Main content card */}
          {!isEditMode ? (
            /* VIEW MODE */
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              {/* Header section */}
              <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-navy mb-4">{engagement.name}</h2>
                  <div className={`space-y-2 ${isArabic ? "text-right" : "text-left"}`}>
                    <p className="text-gray-700">
                      <span className="font-medium">Requested By:</span> {engagement.ecaEngagementManager}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Start Date:</span> {formatDate(engagement.startDate)}
                    </p>
                    {engagement.endDate && (
                      <p className="text-gray-700">
                        <span className="font-medium">End Date:</span> {formatDate(engagement.endDate)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-sm font-semibold px-4 py-2 rounded-full ${getStatusColor(engagement.status)}`}>
                    {engagement.status}
                  </span>
                </div>
              </div>

              {/* Description section */}
              {engagement.description && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-navy mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{engagement.description}</p>
                </div>
              )}

              {/* Budget section */}
              {engagement.budget && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-navy mb-4">Budget</h3>
                  <p className="text-2xl font-bold text-primary">
                    AED {engagement.budget.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Vendor and Contract Information */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-navy mb-4">Vendor & Contract Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {engagement.vendorName && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Vendor Name</p>
                      <p className="text-gray-900 font-medium">{engagement.vendorName}</p>
                    </div>
                  )}
                  {engagement.typeOfEngagement && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Type of Engagement</p>
                      <p className="text-gray-900 font-medium">{engagement.typeOfEngagement}</p>
                    </div>
                  )}
                  {engagement.contractNumber && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Contract Number</p>
                      <p className="text-gray-900 font-medium">{engagement.contractNumber}</p>
                    </div>
                  )}
                </div>
                {engagement.contractDescription && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Contract Description</p>
                    <p className="text-gray-700 leading-relaxed">{engagement.contractDescription}</p>
                  </div>
                )}
              </div>

              {/* Open Roles Section */}
              {engagement.openRoles && engagement.openRoles.length > 0 && (
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-navy mb-4">Open Roles ({engagement.openRoles.length})</h3>
                  <div className="space-y-3">
                    {engagement.openRoles.map((role) => (
                      <div key={role.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{role.title}</h4>
                          <span className="inline-block px-3 py-1 bg-primary text-white text-sm font-medium rounded-full">
                            {role.count} Position{role.count > 1 ? 's' : ''}
                          </span>
                        </div>
                        {role.description && (
                          <p className="text-sm text-gray-600">{role.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-navy mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="text-gray-900 font-medium">{formatDate(engagement.createdOn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Modified</p>
                    <p className="text-gray-900 font-medium">{formatDate(engagement.modifiedOn)}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                >
                  Edit Engagement
                </button>
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                  Close Engagement
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy mb-6">Edit Engagement</h2>
                <p className={`text-sm text-gray-600 mb-6 ${isArabic ? "text-right" : "text-left"}`}>
                  <span className="font-medium">Status:</span> {engagement.status}
                </p>
              </div>

              <form className="space-y-6">
                {/* Engagement Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Engagement Name
                  </label>
                  <input
                    type="text"
                    value={editData.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editData.startDate || ""}
                    onChange={(e) => handleEditChange("startDate", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editData.endDate || ""}
                    onChange={(e) => handleEditChange("endDate", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editData.description || ""}
                    onChange={(e) => handleEditChange("description", e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (AED)
                  </label>
                  <input
                    type="number"
                    value={editData.budget || ""}
                    onChange={(e) => handleEditChange("budget", parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Vendor & Contract Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-navy mb-6">Vendor & Contract Information</h3>

                  {/* Vendor Name */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      value={editData.vendorName || ""}
                      onChange={(e) => handleEditChange("vendorName", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Contract Number */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Number
                    </label>
                    <input
                      type="text"
                      value={editData.contractNumber || ""}
                      onChange={(e) => handleEditChange("contractNumber", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Contract Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Description
                    </label>
                    <textarea
                      value={editData.contractDescription || ""}
                      onChange={(e) => handleEditChange("contractDescription", e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Type of Engagement */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type of Engagement
                    </label>
                    <input
                      type="text"
                      value={editData.typeOfEngagement || ""}
                      onChange={(e) => handleEditChange("typeOfEngagement", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
