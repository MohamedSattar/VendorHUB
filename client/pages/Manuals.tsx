import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManualsGrid from "@/components/ManualsGrid";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Manuals() {
  const { language, t } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-white" dir={language === "ar" ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${language === "ar" ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl font-bold text-navy mb-4">{t("manuals.title")}</h1>
          <p className="text-lg text-gray-600 mb-12">
            {t("manuals.subtitle")}
          </p>

          {/* Dynamic Manuals Grid from Power Apps API */}
          <ManualsGrid />

          {/* Support Section */}
          <div className={`mt-16 p-8 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-lg border border-primary/20 ${language === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-2xl font-bold text-navy mb-4">{t("manuals.needHelp")}</h2>
            <p className="text-gray-700 mb-6">
              {t("manuals.needHelpText")}
            </p>
            <a
              href="mailto:support@eca.gov.ae"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
            >
              {t("manuals.contactSupport")}
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
