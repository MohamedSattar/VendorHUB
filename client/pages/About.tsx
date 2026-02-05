import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAboutPageContent } from "@/hooks/useAboutPageContent";
import MissionSection from "@/components/MissionSection";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import ContactSection from "@/components/ContactSection";
import { RefreshCw } from "lucide-react";

export default function About() {
  const { t, isArabic } = useLanguage();
  const { data: content, isLoading, error, refetch, isFetching } = useAboutPageContent();

  return (
    <div className="flex flex-col min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow">
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isArabic ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl font-bold text-navy mb-8">{t("about.title")}</h1>

          {isLoading && (
            <div className="space-y-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <p className="text-red-800 mb-4">
                Failed to load page content. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
                {isFetching ? "Retrying..." : "Retry"}
              </button>
            </div>
          )}

          {content && !isLoading && !error && (
            <div className="prose prose-lg max-w-none">
              <MissionSection mission={content.mission} />

              <WhatWeDoSection content={content.whatWeDo} />

              <section className="mb-12">
                <h2 className="text-2xl font-bold text-navy mb-4">{t("about.features")}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-6 bg-gray-50 rounded-lg border border-gray-200 ${isArabic ? "text-right" : "text-left"}`}>
                    <h3 className="font-semibold text-navy mb-2">{t("about.engagement")}</h3>
                    <p className="text-gray-700">{t("about.engagementDesc")}</p>
                  </div>
                  <div className={`p-6 bg-gray-50 rounded-lg border border-gray-200 ${isArabic ? "text-right" : "text-left"}`}>
                    <h3 className="font-semibold text-navy mb-2">{t("about.contract")}</h3>
                    <p className="text-gray-700">{t("about.contractDesc")}</p>
                  </div>
                  <div className={`p-6 bg-gray-50 rounded-lg border border-gray-200 ${isArabic ? "text-right" : "text-left"}`}>
                    <h3 className="font-semibold text-navy mb-2">{t("about.resource")}</h3>
                    <p className="text-gray-700">{t("about.resourceDesc")}</p>
                  </div>
                  <div className={`p-6 bg-gray-50 rounded-lg border border-gray-200 ${isArabic ? "text-right" : "text-left"}`}>
                    <h3 className="font-semibold text-navy mb-2">{t("about.collaboration")}</h3>
                    <p className="text-gray-700">{t("about.collaborationDesc")}</p>
                  </div>
                </div>
              </section>

              <ContactSection email={content.email} hours={content.hours} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
