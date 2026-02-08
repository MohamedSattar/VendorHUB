import { Link, useNavigate } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import ECALogo from "@/components/ECALogo";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { language, setLanguage, isArabic } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 ${isArabic ? "flex-row-reverse" : ""}`}>
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
          <div className={`flex items-center gap-4 ${isArabic ? "flex-row-reverse" : ""}`}>
            <button className="relative p-2 text-navy hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="p-2 text-navy hover:bg-gray-100 rounded-lg transition">
              <Settings className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold cursor-pointer hover:opacity-90 transition">
              U
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
