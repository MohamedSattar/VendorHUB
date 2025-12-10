import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Eye, Edit2, Ban } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleView = () => {
    navigate(`/add-resource?view=${id}`);
    setIsMenuOpen(false);
  };

  const handleEdit = () => {
    navigate(`/add-resource?edit=${id}`);
    setIsMenuOpen(false);
  };

  const handleDeactivate = () => {
    toast({
      title: "Success",
      description: `${name} has been deactivated successfully.`,
    });
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
      {/* Header with menu */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1"></div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-gray-400 hover:text-navy rounded hover:bg-gray-100 transition"
            title="Actions"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {/* Action Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
              <button
                onClick={handleView}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
              >
                <Eye className="w-4 h-4 text-navy" />
                View Details
              </button>
              <button
                onClick={handleEdit}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
              >
                <Edit2 className="w-4 h-4 text-navy" />
                Edit Resource
              </button>
              <div className="border-t border-gray-200 my-1"></div>
              <button
                onClick={handleDeactivate}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition text-left"
              >
                <Ban className="w-4 h-4" />
                Deactivate
              </button>
            </div>
          )}
        </div>
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
