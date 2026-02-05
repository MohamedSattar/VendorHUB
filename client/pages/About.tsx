import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAboutPageContent } from "@/hooks/useAboutPageContent";
import MissionSection from "@/components/MissionSection";
import WhatWeDoSection from "@/components/WhatWeDoSection";
import ContactSection from "@/components/ContactSection";
import { RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const { t, isArabic } = useLanguage();
  const { data: content, isLoading, error, refetch } = useAboutPageContent();

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
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <RefreshCw size={18} />
                Retry
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

              {/* Become a Supplier Section */}
              <section className="mt-16 bg-gradient-to-r from-navy to-navy/80 rounded-lg p-8 text-white">
                <div className={isArabic ? "text-right" : "text-left"}>
                  <h2 className="text-3xl font-bold mb-4">Ready to Partner with ECA?</h2>
                  <p className="text-lg text-gray-100 mb-6 leading-relaxed">
                    We're actively looking for qualified suppliers and service providers to support our mission.
                    If your company meets our procurement standards and is interested in becoming a partner with
                    the Abu Dhabi Early Childhood Authority, we'd love to hear from you.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Expert Review</h3>
                      <p className="text-sm text-gray-100">Our team carefully evaluates each application</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Fair Process</h3>
                      <p className="text-sm text-gray-100">Transparent evaluation criteria and timelines</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Growth Opportunity</h3>
                      <p className="text-sm text-gray-100">Long-term partnership potential with ECA</p>
                    </div>
                  </div>

                  <Link
                    to="/supplier-application"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105"
                  >
                    Start Your Application
                    <ArrowRight size={20} />
                  </Link>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
