import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

interface Contract {
  id: string;
  contractNumber: string;
  awardedAmount: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Delivered" | "Not Started";
  projectManager: string;
  contractType: "Service Agreement" | "Work Order" | "Sponsorship" | "Collaboration Agreement";
}

const contracts: Contract[] = [
  {
    id: "1",
    contractNumber: "ECA-2025-0001",
    awardedAmount: 150000,
    startDate: "Jan 15, 2025",
    endDate: "Dec 31, 2025",
    status: "Active",
    projectManager: "Ahmed Abdullah",
    contractType: "Service Agreement",
  },
  {
    id: "2",
    contractNumber: "ECA-2025-0002",
    awardedAmount: 275000,
    startDate: "Feb 01, 2025",
    endDate: "Jan 31, 2026",
    status: "Active",
    projectManager: "Fatima Al Mansouri",
    contractType: "Work Order",
  },
  {
    id: "3",
    contractNumber: "ECA-2024-0098",
    awardedAmount: 450000,
    startDate: "Mar 10, 2024",
    endDate: "Sep 30, 2024",
    status: "Delivered",
    projectManager: "Ali Khouri",
    contractType: "Service Agreement",
  },
  {
    id: "4",
    contractNumber: "ECA-2025-0003",
    awardedAmount: 320000,
    startDate: "Mar 01, 2025",
    endDate: "Feb 28, 2026",
    status: "Active",
    projectManager: "Khalid Saeed",
    contractType: "Collaboration Agreement",
  },
  {
    id: "5",
    contractNumber: "ECA-2025-0004",
    awardedAmount: 85000,
    startDate: "Apr 15, 2025",
    endDate: "Oct 15, 2025",
    status: "Not Started",
    projectManager: "Eman Salama",
    contractType: "Sponsorship",
  },
  {
    id: "6",
    contractNumber: "ECA-2024-0097",
    awardedAmount: 200000,
    startDate: "Jun 01, 2024",
    endDate: "May 31, 2024",
    status: "Delivered",
    projectManager: "Layla Hassan",
    contractType: "Work Order",
  },
  {
    id: "7",
    contractNumber: "ECA-2025-0005",
    awardedAmount: 125000,
    startDate: "Jan 20, 2025",
    endDate: "Jul 20, 2025",
    status: "Active",
    projectManager: "Mohammed Rashid",
    contractType: "Service Agreement",
  },
  {
    id: "8",
    contractNumber: "ECA-2025-0006",
    awardedAmount: 95000,
    startDate: "Feb 15, 2025",
    endDate: "Aug 15, 2025",
    status: "Active",
    projectManager: "Noor Ibrahim",
    contractType: "Collaboration Agreement",
  },
  {
    id: "9",
    contractNumber: "ECA-2024-0096",
    awardedAmount: 350000,
    startDate: "Jan 10, 2024",
    endDate: "Dec 31, 2024",
    status: "Delivered",
    projectManager: "Ahmed Abdullah",
    contractType: "Work Order",
  },
  {
    id: "10",
    contractNumber: "ECA-2025-0007",
    awardedAmount: 180000,
    startDate: "Mar 20, 2025",
    endDate: "Sep 20, 2025",
    status: "Not Started",
    projectManager: "Samir Ahmad",
    contractType: "Service Agreement",
  },
];

type SortType = "number" | "amount" | "date" | "status";
type StatusFilter = "all" | "Active" | "Delivered" | "Not Started";
type ContractTypeFilter = "all" | "Service Agreement" | "Work Order" | "Sponsorship" | "Collaboration Agreement";

const getStatusColor = (status: string): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700";
    case "Delivered":
      return "bg-blue-100 text-blue-700";
    case "Not Started":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function Contracts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortType>("number");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [contractTypeFilter, setContractTypeFilter] = useState<ContractTypeFilter>("all");

  const filteredAndSortedContracts = useMemo(() => {
    let result = [...contracts];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((contract) => contract.status === statusFilter);
    }

    // Filter by contract type
    if (contractTypeFilter !== "all") {
      result = result.filter((contract) => contract.contractType === contractTypeFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(
        (contract) =>
          contract.contractNumber.toLowerCase().includes(lowerSearch) ||
          contract.projectManager.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    if (sortBy === "number") {
      result.sort((a, b) => b.contractNumber.localeCompare(a.contractNumber));
    } else if (sortBy === "amount") {
      result.sort((a, b) => b.awardedAmount - a.awardedAmount);
    } else if (sortBy === "date") {
      result.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortBy === "status") {
      const statusOrder = { "Active": 1, "Not Started": 2, "Delivered": 3 };
      result.sort(
        (a, b) =>
          (statusOrder[a.status as keyof typeof statusOrder] || 0) -
          (statusOrder[b.status as keyof typeof statusOrder] || 0)
      );
    }

    return result;
  }, [searchTerm, sortBy, statusFilter, contractTypeFilter]);

  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString("en-AE", {
      style: "currency",
      currency: "AED",
      minimumFractionDigits: 0,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">Pages / Contracts</p>
            <h1 className="text-3xl font-bold text-navy">Contracts</h1>
          </div>

          {/* Controls section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by contract number or manager..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="number">Contract Number</option>
                  <option value="amount">Awarded Amount</option>
                  <option value="date">Start Date</option>
                  <option value="status">Status</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Contract Type Filter */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Type
                </label>
                <select
                  value={contractTypeFilter}
                  onChange={(e) => setContractTypeFilter(e.target.value as ContractTypeFilter)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="Service Agreement">Service Agreement</option>
                  <option value="Work Order">Work Order</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="Collaboration Agreement">Collaboration Agreement</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-navy">
                Contracts List ({filteredAndSortedContracts.length})
              </h2>
            </div>

            {filteredAndSortedContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Contract Number
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Awarded Amount
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
                        Project Manager
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                        Contract Type
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedContracts.map((contract) => (
                      <tr
                        key={contract.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-sm text-navy font-medium">
                          {contract.contractNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatCurrency(contract.awardedAmount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contract.startDate}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contract.endDate}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(contract.status)}`}
                          >
                            {contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contract.projectManager}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {contract.contractType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  No contracts found matching your search criteria.
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
