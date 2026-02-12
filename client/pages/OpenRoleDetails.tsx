import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  RefreshCw,
  ChevronDown,
  Flag,
  Search,
  Plus,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import AddResourceForm, {
  AddResourceFormHandle,
} from "@/components/AddResourceForm";
import DocumentUploadSection from "@/components/DocumentUploadSection";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOpenRoleDetails } from "@/hooks/useOpenRoleDetails";
import { useCandidateDetails } from "@/hooks/useCandidateDetails";
import {
  OpenRole,
  CandidateDetail,
  fetchEngagementContacts,
  assignCandidateToOpenRole,
} from "@/services/odata";

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

const getStatusColor = (
  status: string,
): { bg: string; text: string; border: string } => {
  if (!status)
    return {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
    };

  const statusLower = status.toLowerCase();

  if (statusLower.includes("active") || statusLower.includes("in progress")) {
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
    };
  }
  if (statusLower.includes("pending") || statusLower.includes("draft")) {
    return {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      border: "border-yellow-300",
    };
  }
  if (statusLower.includes("completed") || statusLower.includes("closed")) {
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
    };
  }
  if (
    statusLower.includes("canceled") ||
    statusLower.includes("cancelled") ||
    statusLower.includes("reject")
  ) {
    return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
  }

  return {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
  };
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

    // Format: "Jan 15, 2026 at 2:30 PM"
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    return `${dateFormatter.format(date)} at ${timeFormatter.format(date)}`;
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
  const { data: openRole, isLoading, error, refetch } = useOpenRoleDetails(id);

  // Fetch candidate details from API using candidateId
  const { data: candidateDetails, isLoading: isCandidateLoading, refetch: refetchCandidateDetails } =
    useCandidateDetails(openRole?.candidateId);

  // Debug logging
  useEffect(() => {
    console.log("[OpenRoleDetails] Open Role Data:", {
      id: openRole?.id,
      name: openRole?.name,
      candidateId: openRole?.candidateId,
      hasCandidateDetails: !!candidateDetails,
      candidateDetailsKeys: candidateDetails
        ? Object.keys(candidateDetails)
        : [],
    });
  }, [openRole, candidateDetails]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [assignResourceMode, setAssignResourceMode] = useState<
    "existing" | "new" | null
  >("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [allResources, setAllResources] = useState<any[]>([]);
  const selectedResourceRef = useRef<AddResourceFormHandle>(null);
  const [isChangeCandidateModalOpen, setIsChangeCandidateModalOpen] = useState(false);
  const [changeCandidatePreview, setChangeCandidatePreview] = useState<any>(null);
  const [isConfirmingChange, setIsConfirmingChange] = useState(false);
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
      const isPendingAssignment =
        !openRole.candidateName || !openRole.candidateId;
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

  const handleSave = async () => {
    if (!editData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Role name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Build payload with only provided fields
      // Start with just the essential fields to avoid payload validation errors
      const rolePayload: Record<string, any> = {};

      // Always update the role name if it's changed
      if (editData.name?.trim()) {
        rolePayload.prmtk_rolename = editData.name.trim();
      }

      // Try to update ready for submission status
      if (editData.readyForSubmission !== undefined && editData.readyForSubmission !== null) {
        rolePayload.prmtk_readyforsubmission = Boolean(editData.readyForSubmission);
      }

      // Optionally update designations (text fields)
      if (editData.designation?.trim()) {
        rolePayload.prmtk_currenttitle = editData.designation.trim();
      }
      if (editData.designationArabic?.trim()) {
        rolePayload.prmtk_proposedtitle = editData.designationArabic.trim();
      }

      // Include salary fields if they have values
      if (editData.currentSalary !== undefined && editData.currentSalary !== null && editData.currentSalary > 0) {
        rolePayload.prmtk_currentsalaryaed = editData.currentSalary;
      }
      if (editData.proposedSalary !== undefined && editData.proposedSalary !== null && editData.proposedSalary > 0) {
        rolePayload.prmtk_proposedsalaryaed = editData.proposedSalary;
      }

      // Note: Status field (prmtk_status) expects numeric option set code, not string
      // Commenting out for now - we can add proper code mapping later if needed
      // if (editData.status !== undefined && editData.status !== null) {
      //   rolePayload.prmtk_status = editData.status;
      // }

      console.log("[OpenRoleDetails] Role update payload:", rolePayload);

      // Update open role with role details
      const roleUpdatePromise = fetch(
        `/api/odata/open-role/${openRole?.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rolePayload),
        }
      );

      // If candidate is being assigned (from search/select), also update the candidate contact
      // Note: Only update candidate when it's from the search flow (selectedResourceRef exists)
      let candidateUpdatePromise: Promise<Response> | null = null;
      if (openRole?.candidateId && selectedResourceRef.current) {
        try {
          const formData = selectedResourceRef.current.getFormData();
          if (formData && formData.fullName) {
            candidateUpdatePromise = fetch(
              `/api/odata/candidate-contact/${openRole.candidateId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  prmtk_id: formData.fullName,
                  prmtk_email: formData.email || undefined,
                  prmtk_phonenumber: formData.phoneNumber || undefined,
                  prmtk_uaeresident: formData.uaeResident !== null && formData.uaeResident !== undefined ? formData.uaeResident : undefined,
                }),
              }
            );
          }
        } catch (e) {
          console.error("[OpenRoleDetails] Error getting form data:", e);
        }
      }

      // Wait for all updates to complete
      const [roleResponse, candidateResponse] = await Promise.all([
        roleUpdatePromise,
        candidateUpdatePromise || Promise.resolve({ ok: true }),
      ]);

      // Check role update response
      if (!roleResponse || !roleResponse.ok) {
        const errorText = roleResponse ? await roleResponse.text() : 'Unknown error';
        throw new Error(`Failed to save role: ${roleResponse?.statusText || 'No response'} - ${errorText}`);
      }

      // Check candidate update response if it was made
      if (candidateResponse && !candidateResponse.ok) {
        const errorText = await candidateResponse.text();
        console.error("[OpenRoleDetails] Candidate update failed:", errorText);
        throw new Error(`Failed to save candidate: ${candidateResponse.statusText}`);
      }

      toast({
        title: "Success",
        description: "Open role and resource have been saved successfully.",
      });

      // Refetch the data to show updated values
      await refetch();
      if (openRole?.candidateId) {
        await refetchCandidateDetails();
      }

      setIsEditMode(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    }
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

  const handleOpenChangeCandidate = async () => {
    try {
      setIsSearching(true);
      const resources = await fetchEngagementContacts();
      setAllResources(resources);
      setIsChangeCandidateModalOpen(true);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast({
        title: "Error",
        description: "Failed to load candidate list",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmChangeCandidate = async () => {
    if (!changeCandidatePreview || !openRole) {
      toast({
        title: "Error",
        description: "Please select a candidate",
        variant: "destructive",
      });
      return;
    }

    // Check if the selected candidate is the same as currently assigned
    if (openRole?.candidateId === changeCandidatePreview.id) {
      toast({
        title: "Info",
        description: "This candidate is already assigned to this role. Please select a different candidate.",
        variant: "default",
      });
      return;
    }

    setIsConfirmingChange(true);
    try {
      await assignCandidateToOpenRole(
        openRole.id,
        changeCandidatePreview.id,
        changeCandidatePreview.name,
        {
          fullName: changeCandidatePreview.name,
          email: changeCandidatePreview.email,
          phoneNumber: changeCandidatePreview.phoneNumber,
          uaeResident: changeCandidatePreview.uaeResident,
        }
      );

      console.log("[OpenRoleDetails] Candidate assignment successful, refetching data...");

      // Refetch the open role data first to get the updated candidateId
      await refetch();
      console.log("[OpenRoleDetails] Refetched open role");

      // Then immediately refetch candidate details with the new candidateId
      await refetchCandidateDetails();
      console.log("[OpenRoleDetails] Refetched candidate details successfully");

      // Reset modal state and close assignment mode to display the newly assigned candidate
      setIsChangeCandidateModalOpen(false);
      setChangeCandidatePreview(null);
      setAssignResourceMode(null);

      // Exit edit mode to display the newly assigned candidate details in view mode
      setIsEditMode(false);

      toast({
        title: "Success",
        description: "Candidate assigned successfully!",
      });

      // Refresh the page immediately to fetch all updated details from the server
      // The short delay ensures the toast message is visible before reload
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error changing candidate:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update candidate",
        variant: "destructive",
      });
    } finally {
      setIsConfirmingChange(false);
    }
  };

  if (!openRole && !isLoading) {
    return (
      <div
        className={`flex flex-col min-h-screen bg-gray-50 ${isArabic ? "rtl" : "ltr"}`}
      >
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
              <h1 className="text-3xl font-bold text-navy mb-4">
                Open Role Not Found
              </h1>
              <p className="text-gray-600">
                The open role you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col min-h-screen bg-gray-50 ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <DashboardHeader />

      <main className="flex-grow">
        <div
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isArabic ? "text-right" : "text-left"}`}
        >
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
            <p className="text-sm text-gray-600 mb-2">
              Pages / Engagements / Open Roles / Details
            </p>
            <h1 className="text-3xl font-bold text-navy">
              {openRole?.name || "Open Role Details"}
            </h1>
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
                    <h2 className="text-2xl font-bold text-navy">
                      {openRole.name}
                    </h2>
                  </div>
                  {/* Status Badge - Prominent Position */}
                  {openRole.status && (
                    <div
                      className={`px-4 py-2 rounded-lg border-2 font-semibold text-sm whitespace-nowrap ${getStatusColor(openRole.status).bg} ${getStatusColor(openRole.status).text} ${getStatusColor(openRole.status).border}`}
                    >
                      {openRole.status}
                    </div>
                  )}
                </div>

                {/* Ready for Submission Badge - Also prominent */}
                <div className="mb-6">
                  <span
                    className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm ${
                      openRole.readyForSubmission
                        ? "bg-green-100 text-green-700 border-2 border-green-300"
                        : "bg-orange-100 text-orange-700 border-2 border-orange-300"
                    }`}
                  >
                    {openRole.readyForSubmission
                      ? "✓ Ready for Submission"
                      : "⟳ Not Ready for Submission"}
                  </span>
                </div>

                <div
                  className={`space-y-2 ${isArabic ? "text-right" : "text-left"}`}
                >
                  {openRole.candidateName && (
                    <p className="text-gray-700">
                      <span className="font-medium">Assigned Candidate:</span>{" "}
                      {openRole.candidateName}
                    </p>
                  )}
                  <p className="text-gray-700">
                    <span className="font-medium">Expected Start Date:</span>{" "}
                    {formatDateOnly(openRole.expectedStartDate)}
                  </p>
                </div>
              </div>

              {/* Role Assignment Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-navy mb-4">
                  Role Assignment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openRole.designation && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Current Designation
                      </p>
                      <p className="text-gray-900 font-medium">
                        {openRole.designation}
                      </p>
                    </div>
                  )}
                  {openRole.designationArabic && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Proposed Designation
                      </p>
                      <p className="text-gray-900 font-medium">
                        {openRole.designationArabic}
                      </p>
                    </div>
                  )}
                  {openRole.currentSalary && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Current Salary (AED)
                      </p>
                      <p className="text-gray-900 font-medium">
                        {openRole.currentSalary.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {openRole.proposedSalary && (
                    <div>
                      <p className="text-sm text-gray-600">
                        Proposed Salary (AED)
                      </p>
                      <p className="text-gray-900 font-medium">
                        {openRole.proposedSalary.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Candidate Section */}
              {candidateDetails && (
                <div className="mb-8 pt-8 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-navy">
                      Candidate Details
                    </h3>
                    <button
                      type="button"
                      onClick={handleOpenChangeCandidate}
                      className="px-4 py-2 border border-navy text-navy rounded-lg hover:bg-navy/5 transition font-medium text-sm"
                    >
                      Change Candidate
                    </button>
                  </div>

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
                    <div
                      className={`flex-1 space-y-2 ${isArabic ? "text-right" : "text-left"}`}
                    >
                      {candidateDetails.name && (
                        <p className="text-gray-700">
                          <span className="font-medium">Candidate Name:</span>{" "}
                          {candidateDetails.name}
                        </p>
                      )}
                      {candidateDetails.email && (
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span>{" "}
                          {candidateDetails.email}
                        </p>
                      )}
                      {candidateDetails.phoneNumber && (
                        <p className="text-gray-700">
                          <span className="font-medium">Phone Number:</span>{" "}
                          {candidateDetails.phoneNumber}
                        </p>
                      )}
                      {candidateDetails.status && (
                        <p className="text-gray-700">
                          <span className="font-medium">Status:</span>{" "}
                          {candidateDetails.status}
                        </p>
                      )}
                      {candidateDetails.uaeResident !== null &&
                        candidateDetails.uaeResident !== undefined && (
                          <p className="text-gray-700">
                            <span className="font-medium">UAE Resident:</span>{" "}
                            {candidateDetails.uaeResident ? "Yes" : "No"}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Documents Section */}
                  {(candidateDetails.cvFile ||
                    candidateDetails.introductionDocument ||
                    candidateDetails.educationalCertificate ||
                    candidateDetails.eid ||
                    candidateDetails.salaryCertificate ||
                    candidateDetails.passport ||
                    candidateDetails.experienceLetter ||
                    candidateDetails.policeClearance) && (
                    <div className="pt-6 border-t border-gray-200">
                      <h4 className="text-md font-semibold text-navy mb-3">
                        Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {candidateDetails.cvFile && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">CV:</span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_cvfile/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.cvFile}
                            </a>
                          </p>
                        )}
                        {candidateDetails.introductionDocument && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Introduction Document:
                            </span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_introductiondocument/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.introductionDocument}
                            </a>
                          </p>
                        )}
                        {candidateDetails.educationalCertificate && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Educational Certificate:
                            </span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_educationalcertificate/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.educationalCertificate}
                            </a>
                          </p>
                        )}
                        {candidateDetails.eid && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">EID:</span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_eid/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.eid}
                            </a>
                          </p>
                        )}
                        {candidateDetails.salaryCertificate && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Salary Certificate:
                            </span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_salarycertificate/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.salaryCertificate}
                            </a>
                          </p>
                        )}
                        {candidateDetails.passport && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Passport:</span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_passport/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.passport}
                            </a>
                          </p>
                        )}
                        {candidateDetails.experienceLetter && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Experience Letter:
                            </span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_experienceletter/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.experienceLetter}
                            </a>
                          </p>
                        )}
                        {candidateDetails.policeClearance && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Police Clearance:
                            </span>{" "}
                            <a
                              href={`/api/odata/engagement-contact/${candidateDetails.id}/prmtk_policeclearance/$value`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              download
                            >
                              {candidateDetails.policeClearance}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Additional information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-navy mb-4">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="text-gray-900 font-medium">
                      {formatReadableDate(openRole.createdOn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Modified</p>
                    <p className="text-gray-900 font-medium">
                      {formatReadableDate(openRole.modifiedOn)}
                    </p>
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
                  <h2 className="text-2xl font-bold text-navy mb-6">
                    Edit Open Role
                  </h2>
                </div>

                <form className="space-y-6">
                  {/* Role Details Section - READ ONLY */}
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-4">
                      Role Details
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Read-only section
                    </p>

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
                  </div>

                  {/* Role Assignment Details Section */}
                  <div className="pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-navy mb-4">
                      Role Assignment Details
                    </h3>

                    {/* Current Designation */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Designation
                      </label>
                      <input
                        type="text"
                        value={editData.designation || ""}
                        onChange={(e) =>
                          handleEditChange("designation", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleEditChange("designationArabic", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleEditChange(
                            "currentSalary",
                            parseFloat(e.target.value) || 0,
                          )
                        }
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
                        onChange={(e) =>
                          handleEditChange(
                            "proposedSalary",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Assign the Resource Section */}
                  <div className="pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-navy">
                        Assign the Resource
                      </h3>
                      {candidateDetails && (
                        <button
                          type="button"
                          onClick={handleOpenChangeCandidate}
                          className="px-4 py-2 border border-navy text-navy rounded-lg hover:bg-navy/5 transition font-medium text-sm"
                        >
                          Change Candidate
                        </button>
                      )}
                    </div>

                    {/* Show search box by default when no candidate assigned, show buttons if candidate exists */}
                    {assignResourceMode === "existing" && !candidateDetails ? (
                      /* Search Mode */
                      <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                          <button
                            type="button"
                            onClick={() => {
                              setAssignResourceMode(null);
                              setSelectedResource(null);
                              setSearchQuery("");
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800 underline"
                          >
                            ← Back
                          </button>
                        </div>

                        {/* Search Box */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Search for Candidate
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search by name or email..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        </div>

                        {/* Search Results - Only show when user types something */}
                        {searchQuery.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">
                              {isSearching
                                ? "Loading candidates..."
                                : `Found ${searchResults.length} result${searchResults.length !== 1 ? "s" : ""}`}
                            </p>

                            {/* Results List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                              {isSearching ? (
                                <div className="text-center py-8">
                                  <p className="text-gray-500">Loading candidates...</p>
                                </div>
                              ) : searchResults.length === 0 ? (
                                <div className="space-y-4">
                                  <div className="text-center py-8">
                                    <p className="text-gray-500">No candidates match your search</p>
                                  </div>

                                  {/* Create New Candidate Option */}
                                  <button
                                    type="button"
                                    onClick={() => navigate("/add-resource")}
                                    className="w-full px-4 py-3 border-2 border-dashed border-primary text-primary rounded-lg hover:bg-primary/5 transition font-medium text-center"
                                  >
                                    + Create New Candidate
                                  </button>
                                </div>
                              ) : (
                                searchResults.map((resource) => (
                                  <button
                                    key={resource.id}
                                    type="button"
                                    onClick={() => setSelectedResource(resource)}
                                    className={`w-full p-4 text-left rounded-lg border-2 transition ${
                                      selectedResource?.id === resource.id
                                        ? "border-primary bg-blue-50"
                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                    }`}
                                  >
                                    <p className="font-semibold text-navy">{resource.name}</p>
                                    <p className="text-sm text-gray-600">{resource.email}</p>
                                    {resource.phoneNumber && (
                                      <p className="text-xs text-gray-500">{resource.phoneNumber}</p>
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {/* Hint text when no search query */}
                        {searchQuery.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            Start typing to search for candidates or create a new one
                          </p>
                        )}

                        {/* Selected Resource Edit Form */}
                        {selectedResource && (
                          <div className="mt-6 p-6 rounded-lg border-2 border-blue-200 bg-blue-50">
                            <h4 className="text-lg font-semibold text-navy mb-4">
                              Edit Resource Details
                            </h4>
                            <p className="text-sm text-gray-600 mb-6">
                              Modify the resource details before assignment
                            </p>

                            {/* Resource Edit Form */}
                            <div className="bg-white rounded-lg p-6 border border-gray-200">
                              <AddResourceForm
                                ref={selectedResourceRef}
                                mode="edit"
                                resourceData={
                                  selectedResource as CandidateDetail
                                }
                                contactId={selectedResource.id}
                              />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedResource(null);
                                }}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                              >
                                Back to Search
                              </button>
                              <button
                                type="button"
                                disabled={openRole?.candidateId === selectedResource?.id}
                                onClick={async () => {
                                  // Get updated form data and assign the resource
                                  if (
                                    !selectedResourceRef.current ||
                                    !selectedResource
                                  ) {
                                    toast({
                                      title: "Error",
                                      description: "No candidate selected",
                                      variant: "destructive",
                                    });
                                    return;
                                  }

                                  // Check if the selected candidate is already assigned
                                  if (openRole?.candidateId === selectedResource.id) {
                                    toast({
                                      title: "Info",
                                      description: "This candidate is already assigned to this role.",
                                      variant: "default",
                                    });
                                    return;
                                  }

                                  try {
                                    const formData =
                                      selectedResourceRef.current.getFormData();

                                    // Call API to assign candidate
                                    await assignCandidateToOpenRole(
                                      openRole.id,
                                      selectedResource.id,
                                      selectedResource.name,
                                      formData,
                                    );

                                    console.log("[OpenRoleDetails] Candidate assignment successful, refetching data...");

                                    // Refetch the open role data first to get the updated candidateId
                                    const updatedOpenRole = await refetch();
                                    console.log("[OpenRoleDetails] Refetched open role:", updatedOpenRole);

                                    // Add a small delay to ensure state updates properly
                                    await new Promise(resolve => setTimeout(resolve, 500));

                                    // Then refetch candidate details with the new candidateId
                                    await refetchCandidateDetails();
                                    console.log("[OpenRoleDetails] Refetched candidate details");

                                    // Close the search and reset assignment mode to show the newly assigned candidate
                                    setSelectedResource(null);
                                    setSearchQuery("");
                                    setAssignResourceMode(null); // Reset to show the assigned candidate profile

                                    toast({
                                      title: "Success",
                                      description:
                                        "Candidate assigned successfully! Displaying assigned candidate details.",
                                    });
                                  } catch (error) {
                                    const errorMessage =
                                      error instanceof Error
                                        ? error.message
                                        : "Failed to assign candidate";
                                    toast({
                                      title: "Error",
                                      description: errorMessage,
                                      variant: "destructive",
                                    });
                                    console.error("Assignment error:", error);
                                  }
                                }}
                                className={`flex-1 px-4 py-3 rounded-lg transition font-medium ${
                                  openRole?.candidateId === selectedResource?.id
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                                    : "bg-green-600 text-white hover:bg-green-700"
                                }`}
                              >
                                {openRole?.candidateId === selectedResource?.id ? "Already Assigned" : "Confirm & Assign"}
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
                          onClick={() =>
                            setIsDetailsCollapsed(!isDetailsCollapsed)
                          }
                          className="flex items-center gap-3 w-full text-left mb-6 hover:opacity-75 transition"
                          aria-expanded={!isDetailsCollapsed}
                        >
                          <ChevronDown
                            className={`w-5 h-5 text-navy transition-transform duration-200 flex-shrink-0 ${
                              isDetailsCollapsed ? "-rotate-90" : ""
                            }`}
                          />
                          <h3 className="text-lg font-semibold text-navy">
                            Candidate Details & Documents
                          </h3>
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
                                    {(candidateDetails.name || "?")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Candidate Info */}
                            <div className="flex-1 min-w-0">
                              {candidateDetails.name ? (
                                <>
                                  <p className="text-sm font-medium text-gray-600">
                                    Assigned Candidate
                                  </p>
                                  <p className="text-base font-semibold text-navy truncate">
                                    {candidateDetails.name}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm font-medium text-gray-600">
                                    Status
                                  </p>
                                  <p className="text-base font-semibold text-orange-600">
                                    Not Assigned yet
                                  </p>
                                </>
                              )}
                            </div>

                            {/* Status Flag */}
                            <div className="flex flex-col items-center gap-1">
                              {candidateDetails.name ? (
                                <>
                                  <Flag className="w-6 h-6 text-green-500 fill-current" />
                                  <span className="text-xs font-semibold text-green-600">
                                    Ready
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Flag className="w-6 h-6 text-orange-500 fill-current" />
                                  <span className="text-xs font-semibold text-orange-600">
                                    Pending
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Collapsible Content */}
                        {!isDetailsCollapsed && (
                          <>
                            <AddResourceForm
                              mode="edit"
                              resourceData={candidateDetails}
                              contactId={openRole.candidateContactId}
                              isCollapsed={isDetailsCollapsed}
                            />

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

                  {/* Ready for Submission - EDITABLE */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className={`border rounded-lg p-4 ${
                      !openRole?.candidateId
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}>
                      <label className="flex items-start gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={editData.readyForSubmission || false}
                          onChange={(e) =>
                            handleEditChange(
                              "readyForSubmission",
                              e.target.checked,
                            )
                          }
                          disabled={!openRole?.candidateId}
                          className={`w-4 h-4 border rounded cursor-pointer mt-1 ${
                            !openRole?.candidateId
                              ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                              : "border-gray-300 cursor-pointer"
                          }`}
                        />
                        <span className={`text-sm font-medium ${
                          !openRole?.candidateId
                            ? "text-gray-500"
                            : "text-gray-700"
                        }`}>
                          Ready for Submission
                        </span>
                      </label>
                      <div className="flex gap-2 ml-7">
                        <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          !openRole?.candidateId
                            ? "text-gray-400"
                            : "text-blue-600"
                        }`} />
                        <p className={`text-sm ${
                          !openRole?.candidateId
                            ? "text-gray-600"
                            : "text-blue-700"
                        }`}>
                          {!openRole?.candidateId
                            ? "Please select a candidate first before marking as ready for submission."
                            : "Important: You must mark this as ready for submission to proceed with submitting this engagement."
                          }
                        </p>
                      </div>
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
            )
          )}
        </div>
      </main>

      {/* Change Candidate Modal */}
      {isChangeCandidateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-navy">Change Candidate</h2>
              <button
                onClick={() => {
                  setIsChangeCandidateModalOpen(false);
                  setChangeCandidatePreview(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Candidate List */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a Candidate
                </label>
                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {isSearching ? (
                    <p className="text-gray-500 text-center py-4">Loading candidates...</p>
                  ) : allResources.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No candidates available</p>
                  ) : (
                    allResources.map((resource) => (
                      <button
                        key={resource.id}
                        onClick={() => setChangeCandidatePreview(resource)}
                        className={`w-full p-3 text-left rounded-lg border-2 transition ${
                          changeCandidatePreview?.id === resource.id
                            ? "border-primary bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <p className="font-medium text-navy">{resource.name}</p>
                        <p className="text-sm text-gray-600">{resource.email}</p>
                        {resource.phoneNumber && (
                          <p className="text-xs text-gray-500">{resource.phoneNumber}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Preview Section */}
              {changeCandidatePreview && (
                <div className="mt-6 p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <h3 className="font-semibold text-navy mb-3">Candidate Preview</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Name:</span> {changeCandidatePreview.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {changeCandidatePreview.email}
                    </p>
                    {changeCandidatePreview.phoneNumber && (
                      <p>
                        <span className="font-medium">Phone:</span> {changeCandidatePreview.phoneNumber}
                      </p>
                    )}
                    {changeCandidatePreview.status && (
                      <p>
                        <span className="font-medium">Status:</span> {changeCandidatePreview.status}
                      </p>
                    )}
                    {changeCandidatePreview.uaeResident !== null &&
                      changeCandidatePreview.uaeResident !== undefined && (
                        <p>
                          <span className="font-medium">UAE Resident:</span>{" "}
                          {changeCandidatePreview.uaeResident ? "Yes" : "No"}
                        </p>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsChangeCandidateModalOpen(false);
                  setChangeCandidatePreview(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmChangeCandidate}
                disabled={!changeCandidatePreview || isConfirmingChange || openRole?.candidateId === changeCandidatePreview?.id}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
                  changeCandidatePreview && !isConfirmingChange && openRole?.candidateId !== changeCandidatePreview?.id
                    ? "bg-primary text-white hover:opacity-90 cursor-pointer"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
                }`}
              >
                {isConfirmingChange ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : openRole?.candidateId === changeCandidatePreview?.id ? (
                  "Already Assigned"
                ) : (
                  "Confirm & Assign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
