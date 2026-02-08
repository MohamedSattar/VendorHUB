import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import ResourceCard from "@/components/ResourceCard";
import EditResourceModal from "@/components/EditResourceModal";
import { Search, Loader, Plus } from "lucide-react";
import { useEngagementContacts } from "@/hooks/useEngagementContacts";
import { EngagementContact } from "@/services/odata";

export default function ResourcePool() {
  const navigate = useNavigate();
  const { data: contacts = [], isLoading, isError, error } = useEngagementContacts();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Assigned" | "Not Assigned">("All");
  const [editingContact, setEditingContact] = useState<EngagementContact | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter and search contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Search filter
      const matchesSearch = contact.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        (contact.email &&
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "All" || contact.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contacts, searchQuery, statusFilter]);

  const handleEditContact = (contact: EngagementContact) => {
    setEditingContact(contact);
    setIsEditModalOpen(true);
  };

  const handleAddResource = () => {
    navigate("/add-resource");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy mb-2">Resources</h1>
          <p className="text-gray-600">
            Manage and view all your resources with their assignment status, edit profiles, and upload documents
          </p>
        </div>

        {/* Action Buttons Section */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={handleAddResource}
            className="flex items-center gap-2 bg-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-navy/90 transition"
          >
            <Plus className="w-5 h-5" />
            Add New Resource
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 flex items-center">
              Status:
            </span>
            {(["All", "Assigned", "Not Assigned"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  statusFilter === status
                    ? "bg-navy text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-navy animate-spin mb-4" />
            <p className="text-gray-600">Loading resources...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Error Loading Resources
            </h3>
            <p className="text-red-700">
              {error?.message || "Failed to load resources. Please try again."}
            </p>
          </div>
        )}

        {/* Resources Grid */}
        {!isLoading && !isError && (
          <>
            {filteredContacts.length > 0 ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredContacts.length} of {contacts.length} resources
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredContacts.map((contact) => (
                    <ResourceCard
                      key={contact.id}
                      contact={contact}
                      onEdit={handleEditContact}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  {contacts.length === 0
                    ? "No resources available"
                    : "No resources match your search criteria"}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Edit Resource Modal */}
      <EditResourceModal
        isOpen={isEditModalOpen}
        contact={editingContact}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingContact(null);
        }}
      />
    </div>
  );
}
