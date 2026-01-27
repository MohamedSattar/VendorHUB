import { useLocation } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Placeholder() {
  const location = useLocation();
  const { t, isArabic } = useLanguage();
  const pathSegment = location.pathname.split("/")[1] || "page";

  const nameMap: Record<string, string> = {
    contracts: "Contracts",
    engagements: "Engagements",
    resources: "Resources",
    profile: "Profile",
    about: "About",
    faq: "FAQ",
    manuals: "Manuals",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
  };

  const displayName =
    nameMap[pathSegment] ||
    pathSegment.charAt(0).toUpperCase() + pathSegment.slice(1);
  const isDashboardPage = [
    "contracts",
    "engagements",
    "resources",
    "profile",
  ].includes(pathSegment);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {isDashboardPage ? <DashboardHeader /> : <Header />}

      <main className="flex-grow">
        {isDashboardPage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-sm text-gray-600 mb-2">Pages / {displayName}</p>
            <h1 className="text-3xl font-bold text-navy mb-12">{displayName}</h1>
          </div>
        )}

        <div className="flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            {!isDashboardPage && (
              <h1 className="text-4xl font-bold text-navy mb-4">
                {displayName}
              </h1>
            )}
            <p className="text-lg text-gray-600 mb-6">
              This page is coming soon. Continue prompting to fill in this page
              content if you'd like!
            </p>
            <div className="inline-block p-8 bg-gradient-to-b from-warm-tan/20 to-warm-tan/10 rounded-lg">
              <svg
                className="w-24 h-24 mx-auto text-navy/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
