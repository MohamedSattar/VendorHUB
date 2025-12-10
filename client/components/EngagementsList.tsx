import { Eye, Edit2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Engagement {
  id: string;
  title: string;
  requestedBy: string;
  startDate: string;
  status: "In Progress" | "On-hold" | "Completed" | "Planned";
  statusColor: string;
}

const engagements: Engagement[] = [
  {
    id: "1",
    title: "Cloud Migration Project Phase 1",
    requestedBy: "Ahmed Abdullah",
    startDate: "Oct 10, 2025",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "2",
    title: "ERP System Upgrade",
    requestedBy: "Ali Khouri",
    startDate: "Oct 01, 2025",
    status: "In Progress",
    statusColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "3",
    title: "Marketing Campaign Software",
    requestedBy: "Eman Salama",
    startDate: "Sep 14, 2025",
    status: "On-hold",
    statusColor: "bg-yellow-100 text-yellow-700",
  },
  {
    id: "4",
    title: "Network Infrastructure Build-out",
    requestedBy: "Eman Salama",
    startDate: "Oct 01, 2025",
    status: "Completed",
    statusColor: "bg-green-100 text-green-700",
  },
];

export default function EngagementsList() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-navy">Engagements List</h3>
        <Link to="/engagements" className="text-sm text-navy font-medium hover:text-primary flex items-center gap-1">
          Check all the list <span>›</span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                Engagement Title
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                Request by
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                Start Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-navy">
                Start Date
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
            {engagements.map((engagement) => (
              <tr key={engagement.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
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
                  {engagement.startDate}
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
    </div>
  );
}
