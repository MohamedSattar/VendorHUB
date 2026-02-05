import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-navy">
            Copyright © {currentYear} ECA. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://www.eca.gov.ae/terms-conditions" target="_blank" rel="noopener noreferrer" className="text-sm text-navy hover:text-primary transition">
              Terms of Use
            </a>
            <Link to="/privacy" className="text-sm text-navy hover:text-primary transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
