import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X, ChevronDown, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import TeamMemberCard from "@/components/TeamMemberCard";

interface TeamMember {
  id: string;
  name: string;
  resourceNumber: string;
  profileImage?: string;
}

interface Engagement {
  id: string;
  title: string;
  requestedBy: string;
  startDate: string;
  endDate?: string;
  status: "In Progress" | "On-hold" | "Completed" | "Planned" | "Draft" | "More Information Needed";
  statusColor: string;
  description?: string;
  budget?: number;
  team?: TeamMember[];
}

const engagements: Record<string, Engagement> = {
  "1": {
    id: "1",
    title: "Cloud Migration Project Phase 1",
    requestedBy: "Ahmed Abdullah",
    startDate: "Oct 10, 2025",
    endDate: "Dec 15, 2025",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
    description: "This engagement involves migrating our infrastructure to a cloud-based environment, ensuring minimal downtime and optimal performance.",
    budget: 500000,
    team: [
      { id: "1", name: "Ahmed Abdullah", resourceNumber: "Resource #1", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
      { id: "2", name: "Mohammed Rashid", resourceNumber: "Resource #2", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" },
      { id: "3", name: "Noor Ibrahim", resourceNumber: "Resource #3", profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop" },
    ],
  },
  "2": {
    id: "2",
    title: "ERP System Upgrade",
    requestedBy: "Ali Khouri",
    startDate: "Oct 01, 2025",
    endDate: "Nov 30, 2025",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
    description: "Upgrading the current ERP system to the latest version with enhanced features and improved performance.",
    budget: 350000,
    team: [
      { id: "4", name: "Ali Khouri", resourceNumber: "Resource #4", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
      { id: "5", name: "Fatima Al Mansouri", resourceNumber: "Resource #5", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" },
    ],
  },
  "3": {
    id: "3",
    title: "Marketing Campaign Software",
    requestedBy: "Eman Salama",
    startDate: "Sep 14, 2025",
    endDate: "Oct 31, 2025",
    status: "On-hold",
    statusColor: "bg-yellow-100 text-yellow-700",
    description: "Implementation of a comprehensive marketing campaign software solution to streamline marketing operations.",
    budget: 200000,
    team: [
      { id: "6", name: "Eman Salama", resourceNumber: "Resource #6", profileImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop" },
    ],
  },
  "4": {
    id: "4",
    title: "Digital Transformation Initiative",
    requestedBy: "Khalid Saeed",
    startDate: "Apr 01, 2025",
    endDate: "Sep 30, 2025",
    status: "Draft",
    statusColor: "bg-gray-100 text-gray-700",
    description: "A comprehensive digital transformation program to modernize our business processes and enhance customer experience.",
    budget: 750000,
    team: [
      { id: "7", name: "Khalid Saeed", resourceNumber: "Resource #7", profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
    ],
  },
  "5": {
    id: "5",
    title: "Data Analytics Platform",
    requestedBy: "Layla Hassan",
    startDate: "May 01, 2025",
    endDate: "Oct 31, 2025",
    status: "More Information Needed",
    statusColor: "bg-red-100 text-red-700",
    description: "Implementation of an advanced data analytics platform to support business intelligence and decision-making.",
    budget: 600000,
    team: [
      { id: "8", name: "Layla Hassan", resourceNumber: "Resource #8", profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" },
    ],
  },
};

export default function EngagementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const engagement = id ? engagements[id] : null;
  const isEditMode = engagement?.status === "Draft" || engagement?.status === "More Information Needed";

  const [editData, setEditData] = useState<Partial<Engagement>>({
    title: engagement?.title,
    description: engagement?.description,
    budget: engagement?.budget,
    startDate: engagement?.startDate,
    endDate: engagement?.endDate,
  });

  const [isTeamMembersOpen, setIsTeamMembersOpen] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(engagement?.team || []);
  const [showTeamMemberForm, setShowTeamMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberFormData, setMemberFormData] = useState({
    name: "",
    resourceNumber: "",
    profileImage: "",
  });

  const handleEditChange = (field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    if (!editData.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Engagement title is required.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Engagement has been saved successfully.",
    });
  };

  const handleCancel = () => {
    setEditData({
      title: engagement?.title,
      description: engagement?.description,
      budget: engagement?.budget,
      startDate: engagement?.startDate,
      endDate: engagement?.endDate,
    });
  };

  const handleOpenTeamMemberForm = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setMemberFormData({
        name: member.name,
        resourceNumber: member.resourceNumber,
        profileImage: member.profileImage || "",
      });
    } else {
      setEditingMember(null);
      setMemberFormData({
        name: "",
        resourceNumber: "",
        profileImage: "",
      });
    }
    setShowTeamMemberForm(true);
  };

  const handleCloseMemberForm = () => {
    setShowTeamMemberForm(false);
    setEditingMember(null);
    setMemberFormData({
      name: "",
      resourceNumber: "",
      profileImage: "",
    });
  };

  const handleSaveTeamMember = () => {
    if (!memberFormData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Team member name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!memberFormData.resourceNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Resource number is required.",
        variant: "destructive",
      });
      return;
    }

    if (editingMember) {
      // Edit existing member
      setTeamMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id
            ? {
                ...member,
                name: memberFormData.name,
                resourceNumber: memberFormData.resourceNumber,
                profileImage: memberFormData.profileImage,
              }
            : member
        )
      );
      toast({
        title: "Success",
        description: "Team member updated successfully.",
      });
    } else {
      // Add new member
      const newMember: TeamMember = {
        id: `${Date.now()}`,
        name: memberFormData.name,
        resourceNumber: memberFormData.resourceNumber,
        profileImage: memberFormData.profileImage,
      };
      setTeamMembers((prev) => [...prev, newMember]);
      toast({
        title: "Success",
        description: "Team member added successfully.",
      });
    }

    handleCloseMemberForm();
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
    toast({
      title: "Success",
      description: "Team member removed successfully.",
    });
  };

  if (!engagement) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <h1 className="text-3xl font-bold text-navy">{engagement.title}</h1>
          </div>

          {/* Main content card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            {isEditMode ? (
              /* EDIT MODE */
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-navy mb-6">Edit Engagement</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    <span className="font-medium">Status:</span> {engagement.status}
                  </p>
                </div>

                <form className="space-y-6">
                  {/* Engagement Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Engagement Title
                    </label>
                    <input
                      type="text"
                      value={editData.title || ""}
                      onChange={(e) => handleEditChange("title", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="text"
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
                      type="text"
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

                  {/* Collapsible Team Members Section */}
                  {engagement.team && engagement.team.length > 0 && (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* Collapsible Header */}
                      <button
                        type="button"
                        onClick={() => setIsTeamMembersOpen(!isTeamMembersOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition border-b border-gray-300"
                      >
                        <h3 className="font-semibold text-navy">
                          Team Members ({engagement.team.length})
                        </h3>
                        <ChevronDown
                          className={`w-5 h-5 text-navy transition-transform ${
                            isTeamMembersOpen ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Collapsible Content */}
                      {isTeamMembersOpen && (
                        <div className="p-4 bg-white">
                          <div className="mb-4">
                            <button
                              type="button"
                              onClick={() => handleOpenTeamMemberForm()}
                              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              Add Team Member
                            </button>
                          </div>

                          {teamMembers.length > 0 ? (
                            <div className="space-y-3">
                              {teamMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-navy/20 flex items-center justify-center text-sm font-bold text-navy">
                                      {member.name
                                        .split(" ")
                                        .map((word) => word.charAt(0))
                                        .join("")
                                        .toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{member.name}</p>
                                      <p className="text-sm text-gray-600">
                                        {member.resourceNumber}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenTeamMemberForm(member)}
                                      className="p-2 text-navy hover:bg-white rounded transition"
                                      title="Edit member"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTeamMember(member.id)}
                                      className="p-2 text-red-600 hover:bg-white rounded transition"
                                      title="Remove member"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <p className="text-gray-500 mb-4">No team members added yet</p>
                              <button
                                type="button"
                                onClick={() => handleOpenTeamMemberForm()}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium mx-auto"
                              >
                                <Plus className="w-4 h-4" />
                                Add First Member
                              </button>
                            </div>
                          )}
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
            ) : (
              /* READ MODE */
              <div>
                {/* Header section */}
                <div className="flex justify-between items-start mb-8 pb-8 border-b border-gray-200">
                  <div>
                    <h2 className="text-2xl font-bold text-navy mb-4">{engagement.title}</h2>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-medium">Requested By:</span> {engagement.requestedBy}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-medium">Start Date:</span> {engagement.startDate}
                      </p>
                      {engagement.endDate && (
                        <p className="text-gray-700">
                          <span className="font-medium">End Date:</span> {engagement.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block text-sm font-semibold px-4 py-2 rounded-full ${engagement.statusColor}`}
                    >
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

                {/* Team section */}
                {engagement.team && engagement.team.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-navy mb-4">Team Members</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {engagement.team.map((member) => (
                        <TeamMemberCard
                          key={member.id}
                          id={member.id}
                          name={member.name}
                          resourceNumber={member.resourceNumber}
                          profileImage={member.profileImage}
                          status="Active"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium">
                    Edit Engagement
                  </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                    Close Engagement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Team Member Modal */}
      {showTeamMemberForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-navy">
                {editingMember ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <button
                onClick={handleCloseMemberForm}
                className="p-1 text-gray-400 hover:text-navy rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-4">
              {/* Member Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={memberFormData.name}
                  onChange={(e) =>
                    setMemberFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter team member name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Resource Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resource Number *
                </label>
                <input
                  type="text"
                  value={memberFormData.resourceNumber}
                  onChange={(e) =>
                    setMemberFormData((prev) => ({
                      ...prev,
                      resourceNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g., Resource #1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Profile Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  value={memberFormData.profileImage}
                  onChange={(e) =>
                    setMemberFormData((prev) => ({
                      ...prev,
                      profileImage: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSaveTeamMember}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
                >
                  {editingMember ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseMemberForm}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
