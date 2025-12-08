import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
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
