import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2, Search, RefreshCw } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEngagementsContent } from "@/hooks/useEngagementsContent";
import { useUserContact } from "@/contexts/UserContactContext";

interface Engagement {
  id: string;
  title: string;
  requestedBy: string;
  startDate: string;
  endDate?: string;
  status: string;
  statusColor: string;
}

// Mock data fallback
const mockEngagements: Engagement[] = [
  {
    id: "1",
    title: "Cloud Migration Project Phase 1",
    requestedBy: "Ahmed Abdullah",
    startDate: "Oct 10, 2025",
    endDate: "Dec 15, 2025",
    status: "In Progress",
    statusColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "2",
    title: "ERP System Upgrade",
    requestedBy: "Ali Khouri",
    startDate: "Oct 01, 2025",
    endDate: "Nov 30, 2025",
    status: "In Progress",
    statusColor: "bg-orange-100 text-orange-700",
  },
];

// Helper to format dates
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

// Helper to get status color
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

type SortType = "name" | "date" | "status";

export default function Engagements() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { t, isArabic } = useLanguage();
  const { loggedInContact } = useUserContact();

  // Fetch engagements from API filtered by current vendor ID
  const { data: apiEngagements = [], isLoading, error, refetch, isFetching } = useEngagementsContent(loggedInContact?.vendorId);

  // Transform API data to Engagement format
  const transformedEngagements: Engagement[] = apiEngagements.map((eng) => ({
    id: eng.id,
    title: eng.name,
    requestedBy: eng.ecaEngagementManager,
    startDate: formatDate(eng.startDate),
    endDate: formatDate(eng.endDate),
    status: eng.status,
    statusColor: getStatusColor(eng.status),
  }));

  // Use API data if available, otherwise fall back to mock data
  const engagementsList = transformedEngagements.length > 0 ? transformedEngagements : mockEngagements;

  // Get unique statuses for filter dropdown (excluding Draft)
  const uniqueStatuses = ["all", ...new Set(engagementsList
    .filter((e) => !e.status?.toLowerCase().includes("draft"))
    .map((e) => e.status)
  )];

  const filteredAndSortedEngagements = useMemo(() => {
    let result = [...engagementsList];

    // Filter out Draft engagements
    result = result.filter((eng) => !eng.status?.toLowerCase().includes("draft"));

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((eng) => eng.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (eng) =>
          eng.title.toLowerCase().includes(lowerSearch) ||
          eng.requestedBy.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    if (sortBy === "name") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "date") {
      result.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortBy === "status") {
      result.sort((a, b) => a.status.localeCompare(b.status));
    }

    return result;
  }, [searchTerm, sortBy, statusFilter, engagementsList]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      <DashboardHeader />

      <main className="flex-grow">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isArabic ? "text-right" : "text-left"}`}>
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">{t("engagements.breadcrumb")}</p>
            <h1 className="text-3xl font-bold text-navy">{t("engagements.title")}</h1>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                <p className="text-gray-600">Loading engagements from API...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-yellow-800 mb-4">
                Using sample data. Showing mock engagements.
              </p>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
                {isFetching ? "Retrying..." : "Retry API"}
              </button>
            </div>
          )}

          {/* Controls section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title or requested by..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="date">Start Date (Newest)</option>
                  <option value="name">Title (A-Z)</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Filter */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="all">All Statuses</option>
                  {uniqueStatuses.map((status) =>
                    status !== "all" ? (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ) : null
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Engagements Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-navy">
                Engagements List ({filteredAndSortedEngagements.length})
              </h2>
            </div>

            {filteredAndSortedEngagements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Engagement Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Requested By
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Start Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        End Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedEngagements.map((engagement) => (
                      <tr
                        key={engagement.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-navy font-medium">
                          {engagement.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {engagement.requestedBy}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {engagement.startDate}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {engagement.endDate}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${engagement.statusColor}`}
                          >
                            {engagement.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/engagement/${engagement.id}`)}
                            className="p-1 text-navy hover:bg-gray-100 rounded transition"
                            title="Edit engagement"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  No engagements found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
