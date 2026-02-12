import { Link, useNavigate } from "react-router-dom";
import { Bell, Settings, LogOut } from "lucide-react";
import ECALogo from "@/components/ECALogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserContact } from "@/contexts/UserContactContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { useCrmTokenInit } from "@/hooks/useCrmTokenInit";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const { loggedInContact } = useUserContact();
  const { logout } = useAuth();
  const { toast } = useToast();

  // Initialize CRM token on mount (ensures token is cached before API calls)
  useCrmTokenInit();

  const { data: notifications = [] } = useNotifications(loggedInContact?.contactId);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Success",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex justify-between items-center h-16 ${isArabic ? "flex-row-reverse" : ""}`}
        >
          {/* Logo and brand */}
          <Link to="/dashboard" className="flex items-center flex-shrink-0">
            <ECALogo />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/engagements"
              className="text-navy font-medium hover:text-primary transition"
            >
              Engagements
            </Link>
            <Link
              to="/resources"
              className="text-navy font-medium hover:text-primary transition"
            >
              Resources
            </Link>
          </nav>

          {/* Right section - Icons and profile */}
          <div
            className={`flex items-center gap-3 ${isArabic ? "flex-row-reverse" : ""}`}
          >
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2 text-navy hover:bg-gray-100 rounded-lg transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="p-2 text-navy hover:bg-gray-100 rounded-lg transition"
              title="Profile Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
