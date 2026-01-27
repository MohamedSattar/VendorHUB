import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t, isArabic } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-200 py-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${isArabic ? "text-right" : "text-left"}`}>
          <p className="text-sm text-navy">
            {t("footer.copyright").replace("{year}", currentYear.toString())}
          </p>
          <div className={`flex gap-6 ${isArabic ? "flex-row-reverse" : ""}`}>
            <Link to="/terms" className="text-sm text-navy hover:text-primary transition">
              {t("footer.terms")}
            </Link>
            <Link to="/privacy" className="text-sm text-navy hover:text-primary transition">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
