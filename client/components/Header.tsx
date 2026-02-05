import { Link } from "react-router-dom";
import ECALogo from "@/components/ECALogo";
import AuthButtons from "@/components/AuthButtons";
import { useLanguage } from "@/contexts/LanguageContext";

function HeaderContent() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center h-16 ${language === "ar" ? "flex-row-reverse" : ""}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <ECALogo />
          </Link>

          {/* Navigation */}
          <nav className={`hidden md:flex items-center gap-6 ${language === "ar" ? "flex-row-reverse" : ""}`}>
            <Link
              to="/faq"
              className="text-navy font-medium hover:text-primary transition"
            >
              {t("nav.faq")}
            </Link>
            <Link
              to="/manuals"
              className="text-navy font-medium hover:text-primary transition"
            >
              {t("nav.manuals")}
            </Link>
            <Link
              to="/supplier-application"
              className="text-navy font-medium hover:text-primary transition"
            >
              Become a Supplier
            </Link>
            <div className="flex items-center gap-4 border-l border-gray-200 pl-4">
              <AuthButtons />
            </div>
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

export default HeaderContent;
