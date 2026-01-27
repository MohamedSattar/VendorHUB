import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import EmployeeCard from "@/components/EmployeeCard";
import { Plus, Search, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Employee {
  id: string;
  name: string;
  resourceNumber: string;
  status: "Approved" | "On Hold" | "Rejected";
  profileImage: string;
  linkedEngagements: number;
  contractEndDate: string;
  contractExpiresDate: string;
}

const employeesData: Employee[] = [
  {
    id: "1",
    name: "Mohamed Sattar",
    resourceNumber: "Resource #3",
    status: "Approved",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "2",
    name: "Yahya Atef",
    resourceNumber: "Resource #1",
    status: "Approved",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "3",
    name: "Omar Ali",
    resourceNumber: "Resource #4",
    status: "On Hold",
    profileImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "4",
    name: "Omnia Ali",
    resourceNumber: "Resource #4",
    status: "Rejected",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "5",
    name: "Mohamed Sattar",
    resourceNumber: "Resource #3",
    status: "Approved",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "6",
    name: "Yahya Atef",
    resourceNumber: "Resource #1",
    status: "Approved",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "7",
    name: "Omar Ali",
    resourceNumber: "Resource #4",
    status: "On Hold",
    profileImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "8",
    name: "Omnia Ali",
    resourceNumber: "Resource #4",
    status: "Rejected",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "9",
    name: "Mohamed Sattar",
    resourceNumber: "Resource #3",
    status: "Approved",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "10",
    name: "Yahya Atef",
    resourceNumber: "Resource #1",
    status: "Approved",
    profileImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "11",
    name: "Omar Ali",
    resourceNumber: "Resource #4",
    status: "On Hold",
    profileImage:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
  {
    id: "12",
    name: "Omnia Ali",
    resourceNumber: "Resource #4",
    status: "Rejected",
    profileImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    linkedEngagements: 2,
    contractEndDate: "Dec 31, 2025",
    contractExpiresDate: "at Dec 31, 2025",
  },
];

const ITEMS_PER_PAGE = 4;

export default function Resources() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [filterStatus, setFilterStatus] = useState<
    "All" | "Approved" | "On Hold" | "Rejected"
  >("All");
  const { t, isArabic } = useLanguage();

  // Filter and search
  const filteredEmployees = useMemo(() => {
    return employeesData.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.resourceNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === "All" || employee.status === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />

      {/* Main content */}
      <main className="flex-grow relative">
        {/* Decorative background elements */}
        <div className="absolute left-0 top-20 opacity-10 pointer-events-none">
          <svg
            className="w-96 h-96"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 0 100 Q 50 50, 100 100 T 200 100"
              stroke="#E8C4A0"
              strokeWidth="4"
              fill="none"
            />
          </svg>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <svg
            className="w-96 h-96"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 200 100 Q 150 50, 100 100 T 0 100"
              stroke="#E8C4A0"
              strokeWidth="4"
              fill="none"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Breadcrumb and Header */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">Pages / Resources Pool</p>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-navy">
                Resources Pool
              </h1>
              <button
                onClick={() => navigate("/add-resource")}
                className="flex items-center gap-2 text-teal-500 border border-teal-500 px-4 py-2 rounded-full hover:bg-teal-50 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Add New Resource
              </button>
            </div>
          </div>

          {/* List header with search and filters */}
          <div className="bg-white rounded-lg p-4 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-sm text-gray-700 font-medium">
                Resources {filteredEmployees.length}/{employeesData.length}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search using by Name"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 pr-10 text-sm"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="status">Sort by Status</option>
                    <option value="date">Sort by Date</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Filter dropdown */}
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(
                        e.target.value as
                          | "All"
                          | "Approved"
                          | "On Hold"
                          | "Rejected"
                      );
                      setCurrentPage(1);
                    }}
                    className="appearance-none px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 pr-10 text-sm"
                  >
                    <option value="All">Filter</option>
                    <option value="Approved">Approved</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Employee cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {paginatedEmployees.map((employee) => (
              <EmployeeCard key={employee.id} {...employee} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              ← Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-navy text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
