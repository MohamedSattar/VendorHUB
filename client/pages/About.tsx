import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import MissionSection from "@/components/MissionSection";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import ContactSection from "@/components/ContactSection";

export default function About() {
  const { t, isArabic } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow">
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isArabic ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl font-bold text-navy mb-8">{t("about.title")}</h1>

          <div className="prose prose-lg max-w-none">
            <MissionSection />

            <WhatWeDoSection />

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

            <ContactSection />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
