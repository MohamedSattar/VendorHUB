import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export default function AuthButtons() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-gray-500">Loading...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="text-sm text-gray-600">
      <span className="font-medium">Sign-up by invitation only</span>
    </div>
  );
}
