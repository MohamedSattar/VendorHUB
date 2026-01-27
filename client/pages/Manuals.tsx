import { useState } from "react";
import { Download, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

interface Manual {
  id: number;
  title: string;
  description: string;
  category: string;
  fileSize: string;
  lastUpdated: string;
}

const manuals: Manual[] = [
  {
    id: 1,
    title: "ECA Vendor Hub - Getting Started Guide",
    description:
      "A comprehensive guide for new vendors to get started with the ECA Vendor Hub platform, including account setup and navigation.",
    category: "Getting Started",
    fileSize: "2.4 MB",
    lastUpdated: "Jan 15, 2025",
  },
  {
    id: 2,
    title: "Managing Engagements",
    description:
      "Detailed instructions on how to view, filter, and manage your engagements including status tracking and team assignments.",
    category: "Engagements",
    fileSize: "1.8 MB",
    lastUpdated: "Jan 10, 2025",
  },
  {
    id: 3,
    title: "Contract Management Guide",
    description:
      "Information about contract tracking, contract details, and how to interpret contract status and timelines.",
    category: "Contracts",
    fileSize: "1.5 MB",
    lastUpdated: "Jan 08, 2025",
  },
  {
    id: 4,
    title: "Resource Pool Management",
    description:
      "Step-by-step guide for managing your resource pool, adding new resources, and editing resource information.",
    category: "Resources",
    fileSize: "2.1 MB",
    lastUpdated: "Jan 12, 2025",
  },
  {
    id: 5,
    title: "Team Member Assignment",
    description:
      "Instructions for assigning and managing team members for your engagements, including adding and removing team members.",
    category: "Engagements",
    fileSize: "1.3 MB",
    lastUpdated: "Jan 09, 2025",
  },
  {
    id: 6,
    title: "Profile Management",
    description:
      "Guide for updating your profile information, managing contact preferences, and account settings.",
    category: "Account",
    fileSize: "0.9 MB",
    lastUpdated: "Jan 05, 2025",
  },
  {
    id: 7,
    title: "Importing Resources from CV",
    description:
      "Learn how to use the CV import feature to quickly populate resource information from your CV document.",
    category: "Resources",
    fileSize: "1.7 MB",
    lastUpdated: "Jan 11, 2025",
  },
  {
    id: 8,
    title: "Troubleshooting & Technical Support",
    description:
      "Common issues and solutions, along with technical support information for resolving platform problems.",
    category: "Support",
    fileSize: "1.2 MB",
    lastUpdated: "Jan 14, 2025",
  },
];

const categories = ["All", ...new Set(manuals.map((m) => m.category))];

export default function Manuals() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { t, isArabic } = useLanguage();

  const filteredManuals =
    selectedCategory === "All"
      ? manuals
      : manuals.filter((manual) => manual.category === selectedCategory);

  const handleDownload = (title: string) => {
    // Simulating download functionality
    const link = document.createElement("a");
    link.href = "#";
    link.download = `${title}.pdf`;
    console.log(`Downloading: ${title}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow">
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isArabic ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl font-bold text-navy mb-4">{t("manuals.title")}</h1>
          <p className="text-lg text-gray-600 mb-12">
            {t("manuals.subtitle")}
          </p>

          {/* Category Filter */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">{t("manuals.filterCategory")}</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Manuals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredManuals.map((manual) => (
              <div
                key={manual.id}
                className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-navy/10 rounded-lg flex-shrink-0">
                    <FileText className="w-6 h-6 text-navy" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-navy mb-1">{manual.title}</h3>
                    <p className="text-sm text-gray-500">
                      {manual.category} • Updated {manual.lastUpdated}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 flex-grow">{manual.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">{manual.fileSize}</span>
                  <button
                    onClick={() => handleDownload(manual.title)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredManuals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No manuals found for this category.</p>
            </div>
          )}

          {/* Support Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-lg border border-primary/20">
            <h2 className="text-2xl font-bold text-navy mb-4">Need Additional Help?</h2>
            <p className="text-gray-700 mb-6">
              If you can't find what you're looking for in our documentation, our support team is here to help.
            </p>
            <a
              href="mailto:support@eca.gov.ae"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
