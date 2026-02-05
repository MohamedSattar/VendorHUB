import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Search, SortAsc } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

interface Engagement {
  id: string;
  title: string;
  requestedBy: string;
  startDate: string;
  endDate?: string;
  status: "In Progress" | "On-hold" | "Completed" | "Planned";
  statusColor: string;
}

const engagements: Engagement[] = [
  {
    id: "1",
    title: "Cloud Migration Project Phase 1",
    requestedBy: "Ahmed Abdullah",
    startDate: "Oct 10, 2025",
    endDate: "Dec 15, 2025",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "2",
    title: "ERP System Upgrade",
    requestedBy: "Ali Khouri",
    startDate: "Oct 01, 2025",
    endDate: "Nov 30, 2025",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "3",
    title: "Marketing Campaign Software",
    requestedBy: "Eman Salama",
    startDate: "Sep 14, 2025",
    endDate: "Oct 31, 2025",
    status: "On-hold",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "4",
    title: "Network Infrastructure Build-out",
    requestedBy: "Eman Salama",
    startDate: "Oct 01, 2025",
    endDate: "Sep 30, 2024",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: "5",
    title: "Security Audit and Assessment",
    requestedBy: "Fatima Al Mansouri",
    startDate: "Nov 01, 2025",
    endDate: "Dec 31, 2025",
    status: "Planned",
    statusColor: "bg-gray-100 text-gray-700",
  },
  {
    id: "6",
    title: "Data Center Optimization",
    requestedBy: "Ahmed Abdullah",
    startDate: "Sep 20, 2025",
    endDate: "Oct 20, 2024",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
  {
    id: "7",
    title: "Mobile App Development Platform",
    requestedBy: "Khalid Saeed",
    startDate: "Oct 15, 2025",
    endDate: "Jan 15, 2026",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "8",
    title: "Customer Portal Enhancement",
    requestedBy: "Layla Hassan",
    startDate: "Sep 01, 2025",
    endDate: "Sep 30, 2025",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
];

type SortType = "name" | "date" | "status";
type StatusFilter = "all" | "In Progress" | "On-hold" | "Completed" | "Planned";

export default function Engagements() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("date");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { t, isArabic } = useLanguage();

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
      const statusOrder = {
        "In Progress": 1,
        "Planned": 2,
        "On-hold": 3,
        "Completed": 4,
      };
      result.sort(
        (a, b) =>
          (statusOrder[a.status as keyof typeof statusOrder] || 0) -
          (statusOrder[b.status as keyof typeof statusOrder] || 0)
      );
    }

    return result;
  }, [searchTerm, sortBy, statusFilter]);

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
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planned">Planned</option>
                  <option value="On-hold">On-hold</option>
                  <option value="Completed">Completed</option>
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
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/engagement/${engagement.id}`)}
                              className="p-1 text-navy hover:bg-gray-100 rounded transition">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/engagement/${engagement.id}`)}
                              className="p-1 text-navy hover:bg-gray-100 rounded transition">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
