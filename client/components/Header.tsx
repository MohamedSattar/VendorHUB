import { Link } from "react-router-dom";
import ECALogo from "@/components/ECALogo";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <ECALogo />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/about"
              className="text-navy font-medium hover:text-primary transition"
            >
              About
            </Link>
            <Link
              to="/faq"
              className="text-navy font-medium hover:text-primary transition"
            >
              FAQ
            </Link>
            <Link
              to="/manuals"
              className="text-navy font-medium hover:text-primary transition"
            >
              Manuals
            </Link>
            <button className="bg-navy text-white px-4 py-2 rounded font-medium hover:bg-navy/90 transition">
              LOGIN
            </button>
            <button className="text-navy font-medium hover:text-primary transition">
              العربية
            </button>
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-navy">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
