import { MoreVertical } from "lucide-react";

interface EmployeeCardProps {
  id: string;
  name: string;
  resourceNumber: string;
  status: "Approved" | "On Hold" | "Rejected";
  profileImage: string;
  linkedEngagements: number;
  contractEndDate: string;
  contractExpiresDate: string;
}

const statusColors = {
  Approved: "bg-green-100 text-green-700",
  "On Hold": "bg-gray-200 text-gray-700",
  Rejected: "bg-red-100 text-red-700",
};

const expiryBorderColors = {
  Approved: "border-orange-300 bg-orange-50",
  "On Hold": "border-gray-300 bg-gray-50",
  Rejected: "border-red-300 bg-red-50",
};

export default function EmployeeCard({
  id,
  name,
  resourceNumber,
  status,
  profileImage,
  linkedEngagements,
  contractEndDate,
  contractExpiresDate,
}: EmployeeCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
      {/* Header with menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1"></div>
        <button className="p-1 text-gray-400 hover:text-navy rounded hover:bg-gray-100 transition">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Profile section */}
      <div className="text-center mb-4">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-300 overflow-hidden flex items-center justify-center">
          <img
            src={profileImage}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <h3 className="font-semibold text-navy text-lg">{name}</h3>
        <p className="text-sm text-gray-600">{resourceNumber}</p>
      </div>

      {/* Action button */}
      <div className="flex justify-center mb-4">
        <button className="text-sm font-medium text-navy border border-navy px-4 py-1 rounded hover:bg-navy hover:text-white transition">
          Replace
        </button>
      </div>

      {/* Status badge */}
      <div className="flex justify-center mb-4">
        <span
          className={`text-xs font-bold px-4 py-1 rounded-full ${
            statusColors[status]
          }`}
        >
          {status}
        </span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-4"></div>

      {/* Details section */}
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-gray-600">Linked Engagements: {linkedEngagements}</p>
        </div>
        <div>
          <p className="text-gray-600">Contract ends: {contractEndDate}</p>
        </div>
        <div
          className={`border-2 rounded-lg p-3 text-center ${
            expiryBorderColors[status]
          }`}
        >
          <p className="text-xs text-gray-600">Contract expires</p>
          <p className="font-semibold text-navy">{contractExpiresDate}</p>
        </div>
      </div>
    </div>
  );
}
