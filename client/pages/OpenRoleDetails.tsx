import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, RefreshCw, ChevronDown, Flag, Search, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import AddResourceForm, { AddResourceFormHandle } from "@/components/AddResourceForm";
import DocumentUploadSection from "@/components/DocumentUploadSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOpenRoleDetails } from "@/hooks/useOpenRoleDetails";
import { useCandidateDetails } from "@/hooks/useCandidateDetails";
import { OpenRole, CandidateDetail, fetchEngagementContacts } from "@/services/odata";

interface OpenRoleDetailsData extends OpenRole {}

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0]; // Return YYYY-MM-DD format
  } catch {
    return dateString;
  }
};

const parseDate = (dateString: string): string => {
  if (!dateString) return "";
  // If already in ISO format, return as is
  if (dateString.includes("T")) {
    return dateString.split("T")[0];
  }
  return dateString;
};

const getStatusColor = (status: string): { bg: string; text: string; border: string } => {
  if (!status) return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };

  const statusLower = status.toLowerCase();

  if (statusLower.includes("active") || statusLower.includes("in progress")) {
    return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" };
  }
  if (statusLower.includes("pending") || statusLower.includes("draft")) {
    return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" };
  }
  if (statusLower.includes("completed") || statusLower.includes("closed")) {
    return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" };
  }
  if (statusLower.includes("canceled") || statusLower.includes("cancelled") || statusLower.includes("reject")) {
    return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
  }

  return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
};

const formatDateOnly = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatReadableDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return dateString;
  }
};

export default function OpenRoleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isArabic } = useLanguage();

  // Fetch open role data from API
  const {
    data: openRole,
    isLoading,
    error,
    refetch,
  } = useOpenRoleDetails(id);

  // Fetch candidate details from API using candidateId
  const {
    data: candidateDetails,
    isLoading: isCandidateLoading,
  } = useCandidateDetails(openRole?.candidateId);

  // Debug logging
  useEffect(() => {
    console.log("[OpenRoleDetails] Open Role Data:", {
      id: openRole?.id,
      name: openRole?.name,
      candidateId: openRole?.candidateId,
      hasCandidateDetails: !!candidateDetails,
      candidateDetailsKeys: candidateDetails ? Object.keys(candidateDetails) : [],
    });
  }, [openRole, candidateDetails]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [assignResourceMode, setAssignResourceMode] = useState<"existing" | "new" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [allResources, setAllResources] = useState<any[]>([]);
  const selectedResourceRef = useRef<AddResourceFormHandle>(null);
  const [editData, setEditData] = useState<Partial<OpenRoleDetailsData>>({
    name: openRole?.name,
    candidateName: openRole?.candidateName,
    expectedStartDate: openRole?.expectedStartDate,
    status: openRole?.status,
    readyForSubmission: openRole?.readyForSubmission,
    designation: openRole?.designation,
    designationArabic: openRole?.designationArabic,
    currentSalary: openRole?.currentSalary,
    proposedSalary: openRole?.proposedSalary,
  });

  // Update edit data when open role data changes
  useEffect(() => {
    if (openRole) {
      setEditData({
        name: openRole.name,
        candidateName: openRole.candidateName,
        expectedStartDate: openRole.expectedStartDate,
        status: openRole.status,
        readyForSubmission: openRole.readyForSubmission,
        designation: openRole.designation,
        designationArabic: openRole.designationArabic,
        currentSalary: openRole.currentSalary,
        proposedSalary: openRole.proposedSalary,
      });

      // If pending candidate assignment, open in edit mode automatically
      const isPendingAssignment = !openRole.candidateName || !openRole.candidateId;
      if (isPendingAssignment) {
        setIsEditMode(true);
      }
    }
  }, [openRole]);

  // Fetch available resources when entering search mode
  useEffect(() => {
    if (assignResourceMode === "existing") {
      const loadResources = async () => {
        try {
          setIsSearching(true);
          const resources = await fetchEngagementContacts();
          setAllResources(resources);
        } catch (error) {
          console.error("Error fetching resources:", error);
          setAllResources([]);
        } finally {
          setIsSearching(false);
        }
      };
      loadResources();
    }
  }, [assignResourceMode]);

  // Filter resources based on search query
  useEffect(() => {
    if (searchQuery.trim() && allResources.length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = allResources.filter((resource) => {
        const name = (resource.name || "").toLowerCase();
        const email = (resource.email || "").toLowerCase();
        return name.includes(query) || email.includes(query);
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allResources]);

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
        description: "Role name is required.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Open role has been saved successfully.",
    });
    setIsEditMode(false);
  };


  const handleCancel = () => {
    if (openRole) {
      setEditData({
        name: openRole.name,
        candidateName: openRole.candidateName,
        expectedStartDate: openRole.expectedStartDate,
        status: openRole.status,
        readyForSubmission: openRole.readyForSubmission,
        designation: openRole.designation,
        designationArabic: openRole.designationArabic,
        currentSalary: openRole.currentSalary,
        proposedSalary: openRole.proposedSalary,
      });
    }
    setIsEditMode(false);
  };

  if (!openRole && !isLoading) {
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
              <h1 className="text-3xl font-bold text-navy mb-4">Open Role Not Found</h1>
              <p className="text-gray-600">The open role you're looking for doesn't exist.</p>
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
            <p className="text-sm text-gray-600 mb-2">Pages / Engagements / Open Roles / Details</p>
            <h1 className="text-3xl font-bold text-navy">{openRole?.name || "Open Role Details"}</h1>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 flex items-center justify-center gap-3">
              <RefreshCw className="w-5 h-5 text-primary animate-spin" />
              <p className="text-gray-600">Loading open role details...</p>
            </div>
          )}

          {/* Error state */}
          {error && openRole && (
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

          {/* Main content card */}
          {openRole && !isEditMode ? (
            /* VIEW MODE */
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
              {/* Header section */}
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-navy">{openRole.name}</h2>
                  </div>
                  {/* Status Badge - Prominent Position */}
                  {openRole.status && (
                    <div className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm whitespace-nowrap ${getStatusColor(openRole.status).bg} ${getStatusColor(openRole.status).text} ${getStatusColor(openRole.status).border}`}>
                      {openRole.status}
                    </div>
                  )}
                </div>

                {/* Ready for Submission Badge - Also prominent */}
                <div className="mb-6">
                  <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
                    openRole.readyForSubmission
                      ? "bg-green-100 text-green-700 border-2 border-green-300"
                      : "bg-orange-100 text-orange-700 border-2 border-orange-300"
                  }`}>
                    {openRole.readyForSubmission ? "✓ Ready for Submission" : "⟳ Not Ready for Submission"}
                  </span>
                </div>

                <div className={`space-y-2 ${isArabic ? "text-right" : "text-left"}`}>
                  {openRole.candidateName && (
                    <p className="text-gray-700">
                      <span className="font-medium">Assigned Candidate:</span> {openRole.candidateName}
                    </p>
                  )}
                  <p className="text-gray-700">
                    <span className="font-medium">Expected Start Date:</span> {formatDateOnly(openRole.expectedStartDate)}
                  </p>
                </div>
              </div>

              {/* Role Assignment Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-navy mb-4">Role Assignment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openRole.designation && (
                    <div>
                      <p className="text-sm text-gray-600">Current Designation</p>
                      <p className="text-gray-900 font-medium">{openRole.designation}</p>
                    </div>
                  )}
                  {openRole.designationArabic && (
                    <div>
                      <p className="text-sm text-gray-600">Proposed Designation</p>
                      <p className="text-gray-900 font-medium">{openRole.designationArabic}</p>
                    </div>
                  )}
                  {openRole.currentSalary && (
                    <div>
                      <p className="text-sm text-gray-600">Current Salary (AED)</p>
                      <p className="text-gray-900 font-medium">{openRole.currentSalary.toLocaleString()}</p>
                    </div>
                  )}
                  {openRole.proposedSalary && (
                    <div>
                      <p className="text-sm text-gray-600">Proposed Salary (AED)</p>
                      <p className="text-gray-900 font-medium">{openRole.proposedSalary.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Candidate Section */}
              {candidateDetails && (
                <div className="mb-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-navy mb-6">Candidate Details</h3>

                  {/* Photo and Details */}
                  <div className="flex gap-6 mb-6 items-start">
                    {/* Personal Photo */}
                    <div className="w-32 h-32 rounded-lg bg-gray-200 border-2 border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {candidateDetails.personalPhoto ? (
                        <img
                          src={candidateDetails.personalPhoto}
                          alt={candidateDetails.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="text-4xl font-bold text-gray-400">
                          {candidateDetails.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className={`flex-1 space-y-2 ${isArabic ? "text-right" : "text-left"}`}>
                      {candidateDetails.name && (
                        <p className="text-gray-700">
                          <span className="font-medium">Candidate Name:</span> {candidateDetails.name}
                        </p>
                      )}
                      {candidateDetails.email && (
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span> {candidateDetails.email}
                        </p>
                      )}
                      {candidateDetails.phoneNumber && (
                        <p className="text-gray-700">
                          <span className="font-medium">Phone Number:</span> {candidateDetails.phoneNumber}
                        </p>
                      )}
                      {candidateDetails.status && (
                        <p className="text-gray-700">
                          <span className="font-medium">Status:</span> {candidateDetails.status}
                        </p>
                      )}
                      {candidateDetails.uaeResident !== null && candidateDetails.uaeResident !== undefined && (
                        <p className="text-gray-700">
                          <span className="font-medium">UAE Resident:</span> {candidateDetails.uaeResident ? "Yes" : "No"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Documents Section */}
                  {(candidateDetails.cvFile || candidateDetails.introductionDocument || candidateDetails.educationalCertificate || candidateDetails.eid || candidateDetails.salaryCertificate || candidateDetails.passport || candidateDetails.experienceLetter || candidateDetails.policeClearance) && (
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-navy mb-3">Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {candidateDetails.cvFile && (
                          <p className="text-sm text-gray-700"><span className="font-medium">CV:</span> {candidateDetails.cvFile}</p>
                        )}
                        {candidateDetails.introductionDocument && (
                          <p className="text-sm text-gray-700"><span className="font-medium">Introduction Document:</span> {candidateDetails.introductionDocument}</p>
                        )}
                        {candidateDetails.educationalCertificate && (
                          <p className="text-sm text-gray-700"><span className="font-medium">Educational Certificate:</span> {candidateDetails.educationalCertificate}</p>
                        )}
                        {candidateDetails.eid && (
                          <p className="text-sm text-gray-700"><span className="font-medium">EID:</span> {candidateDetails.eid}</p>
                        )}
                        {candidateDetails.salaryCertificate && (
                          <p className="text-sm text-gray-700"><span className="font-medium">Salary Certificate:</span> {candidateDetails.salaryCertificate}</p>
                        )}
                        {candidateDetails.passport && (
                          <p className="text-sm text-gray-700"><span className="font-medium">Passport:</span> {candidateDetails.passport}</p>
                        )}
                        {candidateDetails.experienceLetter && (
                          <p className="text-sm text-gray-700"><span className="font-medium">Experience Letter:</span> {candidateDetails.experienceLetter}</p>
                        )}
                        {candidateDetails.policeClearance && (
                          <p className="text-sm text-gray-700"><span className="font-medium">Police Clearance:</span> {candidateDetails.policeClearance}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-navy mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="text-gray-900 font-medium">{formatReadableDate(openRole.createdOn)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Modified</p>
                    <p className="text-gray-900 font-medium">{formatReadableDate(openRole.modifiedOn)}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons - only show if candidate is assigned */}
              {openRole?.candidateName && openRole?.candidateId && (
                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                  >
                    Edit Open Role
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* EDIT MODE */
            openRole && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">Edit Open Role</h2>
                </div>

                <form className="space-y-6">
                  {/* Role Details Section - READ ONLY */}
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-4">Role Details</h3>
                    <p className="text-xs text-gray-500 mb-4">Read-only section</p>

                    {/* Role Name - READ ONLY */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Name
                      </label>
                      <input
                        type="text"
                        value={editData.name || ""}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Expected Start Date - READ ONLY */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Start Date
                      </label>
                      <input
                        type="date"
                        value={parseDate(editData.expectedStartDate || "")}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Status - READ ONLY */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <input
                        type="text"
                        value={editData.status || ""}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>

                    {/* Ready for Submission - EDITABLE */}
                    <div>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={editData.readyForSubmission || false}
                          onChange={(e) => handleEditChange("readyForSubmission", e.target.checked)}
                          className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-sm font-medium text-gray-700">Ready for Submission</span>
                      </label>
                    </div>
                  </div>

                  {/* Role Assignment Details Section */}
                  <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-navy mb-4">Role Assignment Details</h3>

                    {/* Current Designation */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Designation
                      </label>
                      <input
                        type="text"
                        value={editData.designation || ""}
                        onChange={(e) => handleEditChange("designation", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Proposed Designation */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proposed Designation
                      </label>
                      <input
                        type="text"
                        value={editData.designationArabic || ""}
                        onChange={(e) => handleEditChange("designationArabic", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Current Salary AED */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Salary (AED)
                      </label>
                      <input
                        type="number"
                        value={editData.currentSalary || ""}
                        onChange={(e) => handleEditChange("currentSalary", parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Proposed Salary AED */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proposed Salary (AED)
                      </label>
                      <input
                        type="number"
                        value={editData.proposedSalary || ""}
                        onChange={(e) => handleEditChange("proposedSalary", parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Assign the Resource Section */}
                  <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-navy mb-6">Assign the Resource</h3>

                    {/* Assignment Mode Selection */}
                    {!assignResourceMode ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option 1: Search Existing Resource */}
                        <button
                          type="button"
                          onClick={() => setAssignResourceMode("existing")}
                          className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-left"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Search className="w-6 h-6 text-primary" />
                            <h4 className="font-semibold text-navy">Search Existing Resource</h4>
                          </div>
                          <p className="text-sm text-gray-600">Find and assign a resource from the existing pool using email or name</p>
                        </button>

                        {/* Option 2: Add New Resource */}
                        <button
                          type="button"
                          onClick={() => navigate("/add-resource")}
                          className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-left"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Plus className="w-6 h-6 text-primary" />
                            <h4 className="font-semibold text-navy">Add New Resource</h4>
                          </div>
                          <p className="text-sm text-gray-600">Create and add a new resource to the system</p>
                        </button>
                      </div>
                    ) : assignResourceMode === "existing" ? (
                      /* Search Existing Resource Mode */
                      <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                          <button
                            type="button"
                            onClick={() => {
                              setAssignResourceMode(null);
                              setSearchQuery("");
                              setSearchResults([]);
                              setSelectedResource(null);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800 underline"
                          >
                            ← Back
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by name, email, or phone..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          {/* Status Information */}
                          <div className="text-xs text-gray-500 p-2">
                            {isSearching ? (
                              "Loading resources..."
                            ) : allResources.length === 0 ? (
                              "No resources available in the system"
                            ) : (
                              `${allResources.length} resource${allResources.length !== 1 ? 's' : ''} available`
                            )}
                          </div>
                        </div>

                        {/* Search Results */}
                        {searchQuery && (
                          <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                            {isSearching ? (
                              <p className="text-center text-gray-500 py-8">Searching...</p>
                            ) : searchResults.length > 0 ? (
                              <div className="space-y-2">
                                {searchResults.map((resource) => (
                                  <button
                                    key={resource.id}
                                    type="button"
                                    onClick={() => setSelectedResource(resource)}
                                    className={`w-full p-3 rounded-lg text-left transition ${
                                      selectedResource?.id === resource.id
                                        ? "bg-primary/10 border-primary border-2"
                                        : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                                    }`}
                                  >
                                    <p className="font-medium text-gray-900">{resource.name}</p>
                                    <p className="text-sm text-gray-600">{resource.email}</p>
                                  </button>
                                ))}
                              </div>
                            ) : allResources.length === 0 ? (
                              <p className="text-center text-gray-500 py-8">No resources available in the system</p>
                            ) : (
                              <p className="text-center text-gray-500 py-8">No resources match "{searchQuery}"</p>
                            )}
                          </div>
                        )}

                        {/* Selected Resource Edit Form */}
                        {selectedResource && (
                          <div className="mt-6 p-6 rounded-lg border-2 border-blue-200 bg-blue-50">
                            <h4 className="text-lg font-semibold text-navy mb-4">Edit Resource Details</h4>
                            <p className="text-sm text-gray-600 mb-6">Modify the resource details before assignment</p>

                            {/* Resource Edit Form */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                              <AddResourceForm
                                ref={selectedResourceRef}
                                mode="edit"
                                resourceData={selectedResource as CandidateDetail}
                                contactId={selectedResource.id}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResource(null);
                                  setSearchQuery("");
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                              >
                                Back to Search
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  // Get updated form data and assign the resource
                                  if (selectedResourceRef.current) {
                                    const formData = selectedResourceRef.current.getFormData();
                                    console.log("Assigning resource with updated data:", {
                                      ...selectedResource,
                                      ...formData
                                    });

                                    // Close the search and return to form
                                    setSelectedResource(null);
                                    setSearchQuery("");
                                    setAssignResourceMode(null);

                                    toast({
                                      title: "Success",
                                      description: "Resource assigned successfully.",
                                    });
                                  }
                                }}
                                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                              >
                                Confirm & Assign
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Candidate Details & Documents Section - Only show if candidate assigned */}
                  {candidateDetails && openRole?.candidateId && (
                    <div className="pt-8 border-t border-gray-200">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12">
                        {/* Collapsible Header for Candidate Details and Documents */}
                        <button
                          type="button"
                          onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
                          className="flex items-center gap-3 w-full text-left mb-6 hover:opacity-75 transition"
                          aria-expanded={!isDetailsCollapsed}
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-navy transition-transform duration-200 flex-shrink-0 ${
                              isDetailsCollapsed ? "-rotate-90" : ""
                            }`}
                          />
                          <h3 className="text-lg font-semibold text-navy">Candidate Details & Documents</h3>
                        </button>

                        {/* Collapsed Preview */}
                        {isDetailsCollapsed && candidateDetails && (
                          <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-4">
                            {/* Photo */}
                            <div className="w-16 h-16 rounded-lg bg-gray-200 border border-gray-300 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {candidateDetails.personalPhoto ? (
                                <img
                                  src={candidateDetails.personalPhoto}
                                  alt="Candidate"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center">
                                  <span className="text-2xl font-bold text-gray-400">
                                    {(candidateDetails.name || "?").charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Candidate Info */}
                            <div className="flex-1 min-w-0">
                              {candidateDetails.name ? (
                                <>
                                  <p className="text-sm font-medium text-gray-600">Assigned Candidate</p>
                                  <p className="text-base font-semibold text-navy truncate">{candidateDetails.name}</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-gray-600">Status</p>
                                  <p className="text-base font-semibold text-orange-600">Not Assigned yet</p>
                                </>
                              )}
                            </div>

                            {/* Status Flag */}
                            <div className="flex flex-col items-center gap-1">
                              {candidateDetails.name ? (
                                <>
                                  <Flag className="w-6 h-6 text-green-500 fill-current" />
                                  <span className="text-xs font-semibold text-green-600">Ready</span>
                                </>
                              ) : (
                                <>
                                  <Flag className="w-6 h-6 text-orange-500 fill-current" />
                                  <span className="text-xs font-semibold text-orange-600">Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Collapsible Content */}
                        {!isDetailsCollapsed && (
                          <>
                            <AddResourceForm mode="edit" resourceData={candidateDetails} contactId={openRole.candidateContactId} isCollapsed={isDetailsCollapsed} />

                            {/* Documents Section */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                              <DocumentUploadSection
                                contactId={openRole.candidateContactId}
                                documentData={candidateDetails}
                                uaeResident={candidateDetails?.uaeResident}
                                hideHeader={true}
                                isCollapsed={isDetailsCollapsed}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

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
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
