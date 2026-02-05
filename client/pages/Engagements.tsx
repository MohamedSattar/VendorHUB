import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Search, RefreshCw } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEngagementsContent } from "@/hooks/useEngagementsContent";

interface Engagement {
  id: string;
  title: string;
  requestedBy: string;
  startDate: string;
  endDate?: string;
  status: string;
  statusColor: string;
}

// Helper function to get status color
const getStatusColor = (status: string): string => {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower.includes("progress")) return "bg-blue-100 text-blue-700";
  if (statusLower.includes("completed")) return "bg-green-100 text-green-700";
  if (statusLower.includes("hold")) return "bg-yellow-100 text-yellow-700";
  if (statusLower.includes("planned")) return "bg-gray-100 text-gray-700";
  return "bg-gray-100 text-gray-700";
};

// Helper function to format date
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

type SortType = "name" | "date" | "status";

export default function Engagements() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { t, isArabic } = useLanguage();
  const { data: apiEngagements = [], isLoading, error, refetch, isFetching } = useEngagementsContent();

  // Debug logging
  console.log("Engagements state:", { isLoading, error, hasData: apiEngagements.length > 0, dataLength: apiEngagements.length });

  // Transform API data to Engagement format
  const engagements: Engagement[] = apiEngagements.map((eng) => ({
    id: eng.id,
    title: eng.name,
    requestedBy: eng.ecaEngagementManager,
    startDate: formatDate(eng.startDate),
    endDate: formatDate(eng.endDate),
    status: eng.status,
    statusColor: getStatusColor(eng.status),
  }));

  // Get unique statuses for filter dropdown
  const uniqueStatuses = ["all", ...new Set(engagements.map((e) => e.status))];

  const filteredAndSortedEngagements = useMemo(() => {
    let result = [...engagements];

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
  }, [searchTerm, sortBy, statusFilter, engagements]);

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

          {/* Controls section */}
          {(!isLoading || engagements.length > 0) && !error && (
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
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="w-5 h-5 text-primary animate-spin" />
                <p className="text-gray-600">Loading engagements...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-800 mb-4">
                Failed to load engagements. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
                {isFetching ? "Retrying..." : "Retry"}
              </button>
            </div>
          )}

          {/* Engagements Table */}
          {!isLoading && !error && (
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
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => navigate(`/engagement/${engagement.id}`)}
                                className="p-1 text-navy hover:bg-gray-100 rounded transition"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/engagement/${engagement.id}`)}
                                className="p-1 text-navy hover:bg-gray-100 rounded transition"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
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
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
