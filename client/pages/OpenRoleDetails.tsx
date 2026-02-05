import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOpenRoleDetails } from "@/hooks/useOpenRoleDetails";
import { useCandidateDetails } from "@/hooks/useCandidateDetails";
import { OpenRole, CandidateDetail } from "@/services/odata";

interface OpenRoleDetailsData extends OpenRole {}

interface EditCandidateData extends CandidateDetail {}

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
  const [showCandidateForm, setShowCandidateForm] = useState(false);
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
  const [editCandidateData, setEditCandidateData] = useState<Partial<EditCandidateData>>({
    name: candidateDetails?.name,
    email: candidateDetails?.email,
    phoneNumber: candidateDetails?.phoneNumber,
    status: candidateDetails?.status,
    uaeResident: candidateDetails?.uaeResident,
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
    }
  }, [openRole]);

  // Update candidate edit data when candidate details change
  useEffect(() => {
    if (candidateDetails) {
      setEditCandidateData({
        name: candidateDetails.name,
        email: candidateDetails.email,
        phoneNumber: candidateDetails.phoneNumber,
        status: candidateDetails.status,
        uaeResident: candidateDetails.uaeResident,
      });
    }
  }, [candidateDetails]);

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCandidateEditChange = (field: string, value: any) => {
    setEditCandidateData((prev) => ({
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

  const handleCandidateSave = () => {
    toast({
      title: "Success",
      description: "Candidate details have been saved successfully.",
    });
    setShowCandidateForm(false);
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
    if (candidateDetails) {
      setEditCandidateData({
        name: candidateDetails.name,
        email: candidateDetails.email,
        phoneNumber: candidateDetails.phoneNumber,
        status: candidateDetails.status,
        uaeResident: candidateDetails.uaeResident,
      });
    }
    setIsEditMode(false);
    setShowCandidateForm(false);
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
                <h2 className="text-2xl font-bold text-navy mb-4">{openRole.name}</h2>
                <div className={`space-y-2 ${isArabic ? "text-right" : "text-left"}`}>
                  {openRole.candidateName && (
                    <p className="text-gray-700">
                      <span className="font-medium">Candidate:</span> {openRole.candidateName}
                    </p>
                  )}
                  <p className="text-gray-700">
                    <span className="font-medium">Expected Start Date:</span> {openRole.expectedStartDate}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Status:</span> {openRole.status}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Ready for Submission:</span>{" "}
                    <span className={openRole.readyForSubmission ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
                      {openRole.readyForSubmission ? "Yes" : "No"}
                    </span>
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
              <div className="mb-8">
                <button
                  onClick={() => setShowCandidateForm(!showCandidateForm)}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
                >
                  <h3 className="text-lg font-semibold text-navy">Assigned Candidate</h3>
                  {showCandidateForm ? (
                    <ChevronUp className="w-5 h-5 text-navy" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-navy" />
                  )}
                </button>

                {showCandidateForm && (
                  <div className="mt-4 p-4 bg-white border border-blue-100 rounded-lg">
                    {isCandidateLoading ? (
                      <p className="text-gray-600 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Loading candidate details...
                      </p>
                    ) : candidateDetails ? (
                      <div className={`space-y-2 ${isArabic ? "text-right" : "text-left"}`}>
                        {candidateDetails.name && (
                          <p className="text-gray-700">
                            <span className="font-medium">Name:</span> {candidateDetails.name}
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

                        {/* Documents Section */}
                        {(candidateDetails.cvFile || candidateDetails.introductionDocument || candidateDetails.educationalCertificate || candidateDetails.eid || candidateDetails.salaryCertificate || candidateDetails.passport || candidateDetails.experienceLetter || candidateDetails.policeClearance) && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
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
                    ) : (
                      <p className="text-gray-600">No candidate details available for this open role.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Additional information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-navy mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created On</p>
                    <p className="text-gray-900 font-medium">{openRole.createdOn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Modified</p>
                    <p className="text-gray-900 font-medium">{openRole.modifiedOn}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                >
                  Edit Open Role
                </button>
              </div>
            </div>
          ) : (
            /* EDIT MODE */
            openRole && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">Edit Open Role</h2>
                </div>

                <form className="space-y-6">
                  {/* Role Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-navy mb-4">Role Details</h3>

                    {/* Role Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role Name
                      </label>
                      <input
                        type="text"
                        value={editData.name || ""}
                        onChange={(e) => handleEditChange("name", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Candidate Name */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Candidate Name
                      </label>
                      <input
                        type="text"
                        value={editData.candidateName || ""}
                        onChange={(e) => handleEditChange("candidateName", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Expected Start Date */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Start Date
                      </label>
                      <input
                        type="date"
                        value={parseDate(editData.expectedStartDate || "")}
                        onChange={(e) => handleEditChange("expectedStartDate", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Status */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <input
                        type="text"
                        value={editData.status || ""}
                        onChange={(e) => handleEditChange("status", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    {/* Ready for Submission */}
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

                  {/* Assigned Candidate Section */}
                  {candidateDetails && (
                    <div className="pt-8 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-navy mb-4">Assigned Candidate</h3>

                      {/* Name */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          value={editCandidateData.name || ""}
                          onChange={(e) => handleCandidateEditChange("name", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Email */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editCandidateData.email || ""}
                          onChange={(e) => handleCandidateEditChange("email", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Phone Number */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editCandidateData.phoneNumber || ""}
                          onChange={(e) => handleCandidateEditChange("phoneNumber", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* Status */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <input
                          type="text"
                          value={editCandidateData.status || ""}
                          onChange={(e) => handleCandidateEditChange("status", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>

                      {/* UAE Resident */}
                      <div className="mb-4">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={editCandidateData.uaeResident || false}
                            onChange={(e) => handleCandidateEditChange("uaeResident", e.target.checked)}
                            className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
                          />
                          <span className="text-sm font-medium text-gray-700">UAE Resident</span>
                        </label>
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
