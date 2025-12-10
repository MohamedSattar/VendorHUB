import { Link } from "react-router-dom";
import { Bell, Settings } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-navy rounded flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-navy">ECA</span>
              <span className="text-xs font-bold text-warm-tan">VENDOR HUB</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/contracts"
              className="text-navy font-medium hover:text-primary transition"
            >
              Contracts
            </Link>
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
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-navy hover:bg-gray-100 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-navy hover:bg-gray-100 rounded-lg transition">
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
