import { RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQAccordion from "@/components/FAQAccordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFAQContent } from "@/hooks/useFAQContent";

export default function FAQ() {
  const { t, language } = useLanguage();
  const { refetch, isFetching } = useFAQContent();

  return (
    <div
      className="flex flex-col min-h-screen bg-white"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <Header />

      <main className="flex-grow">
        <div
          className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${language === "ar" ? "text-right" : "text-left"}`}
        >
          <div className={`flex items-center justify-between mb-4 ${language === "ar" ? "flex-row-reverse" : ""}`}>
            <h1 className="text-4xl font-bold text-navy">
              {t("faq.title")}
            </h1>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
              title="Refresh FAQ content from server"
            >
              <RefreshCw
                size={18}
                className={isFetching ? "animate-spin" : ""}
              />
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <p className="text-lg text-gray-600 mb-12">{t("faq.subtitle")}</p>

          {/* Dynamic FAQ content from Power Apps API */}
          <FAQAccordion />

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-navy mb-2">
              {t("faq.stillHave")}
            </h3>
            <p className="text-gray-700">
              {t("faq.noAnswer")}{" "}
              <a
                href="mailto:support@eca.gov.ae"
                className="text-primary hover:underline"
              >
                support@eca.gov.ae
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
