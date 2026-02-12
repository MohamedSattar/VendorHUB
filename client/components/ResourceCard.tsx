import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit2 } from "lucide-react";
import { EngagementContact } from "@/services/odata";

interface ResourceCardProps {
  contact: EngagementContact;
}

const statusColors = {
  Free: "bg-blue-100 text-blue-700",
  Assigned: "bg-green-100 text-green-700",
  Archived: "bg-gray-100 text-gray-700",
};

export default function ResourceCard({ contact }: ResourceCardProps) {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleEditClick = () => {
    navigate(`/edit-resource/${contact.id}`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Profile Section */}
      <div className="p-6 text-center">
        {/* Profile Photo */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          {contact.personalPhoto && !imageError ? (
            <>
              <img
                src={contact.personalPhoto}
                alt={contact.name}
                className={`w-full h-full object-cover ${imageLoaded ? "block" : "hidden"}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              {!imageLoaded && (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
              {contact.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-navy mb-2">{contact.name}</h3>

        {/* Email */}
        {contact.email && (
          <p className="text-sm text-gray-600 mb-4">{contact.email}</p>
        )}

        {/* Status Badge */}
        <div className="mb-4">
          <span
            className={`inline-block text-xs font-bold px-4 py-1 rounded-full ${
              statusColors[contact.status]
            }`}
          >
            {contact.status}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Edit Button */}
        <button
          onClick={handleEditClick}
          className="w-full flex items-center justify-center gap-2 bg-navy text-white py-2 rounded-lg hover:bg-navy/90 transition font-medium text-sm"
        >
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>
    </div>
  );
}
