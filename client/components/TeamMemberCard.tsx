import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";

interface TeamMemberCardProps {
  id?: string;
  name: string;
  profileImage?: string;
  status?: string;
  resourceNumber?: string;
}

export default function TeamMemberCard({
  id = "1",
  name,
  profileImage,
  status = "Active",
  resourceNumber,
}: TeamMemberCardProps) {
  const navigate = useNavigate();
  
  const initials = name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  const handleEditClick = () => {
    navigate(`/resources?edit=${id}`);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition">
      {/* Header with edit button */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1"></div>
        <button
          onClick={handleEditClick}
          className="p-1 text-gray-400 hover:text-navy rounded hover:bg-gray-100 transition"
          title="Edit Team Member"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      </div>

      {/* Profile section */}
      <div className="text-center mb-4">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-navy/20 flex items-center justify-center overflow-hidden">
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <span className="text-xl font-bold text-navy">{initials}</span>
          )}
        </div>
        <h3 className="font-semibold text-navy text-lg">{name}</h3>
        {resourceNumber && <p className="text-sm text-gray-600">{resourceNumber}</p>}
      </div>

      {/* Status badge */}
      {status && (
        <div className="flex justify-center mb-4">
          <span className="text-xs font-bold px-4 py-1 rounded-full bg-green-100 text-green-700">
            {status}
          </span>
        </div>
      )}
    </div>
  );
}
