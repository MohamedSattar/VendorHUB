import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t, isArabic } = useLanguage();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow flex items-center justify-center px-4">
        <div className={`text-center max-w-md ${isArabic ? "text-right" : "text-left"}`}>
          <h1 className="text-6xl font-bold text-navy mb-4">404</h1>
          <p className="text-2xl font-bold text-navy mb-2">{t("notfound.title")}</p>
          <p className="text-lg text-gray-600 mb-8">
            {t("notfound.subtitle")}
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-navy text-white font-semibold rounded hover:bg-navy/90 transition"
          >
            {t("notfound.returnHome")}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
