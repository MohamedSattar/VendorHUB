import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/faq" className="text-sm text-navy hover:text-primary transition">
              FAQ
            </Link>
            <Link to="/manuals" className="text-sm text-navy hover:text-primary transition">
              Manuals
            </Link>
            {!isAuthenticated && (
              <Link to="/supplier-application" className="text-sm text-navy hover:text-primary transition">
                Become a Supplier
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-navy">
              Copyright © {currentYear} ECA. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <a href="https://www.eca.gov.ae/terms-conditions" target="_blank" rel="noopener noreferrer" className="text-sm text-navy hover:text-primary transition">
                Terms of Use
              </a>
              <a href="https://www.eca.gov.ae/en/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-sm text-navy hover:text-primary transition">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
