import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { useManualsContent } from "@/hooks/useManualsContent";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ManualsGrid() {
  const { data: manuals, isLoading, error } = useManualsContent();
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract unique categories from manuals
  // Use formatted category value if available, otherwise use the raw category value
  const categories =
    manuals && manuals.length > 0
      ? ["All", ...new Set(manuals.map((m) => m.categoryFormatted || m.category))]
      : ["All"];

  // Filter manuals by selected category (compare formatted value if available)
  const filteredManuals =
    selectedCategory === "All"
      ? manuals
      : manuals?.filter((manual) => {
          const displayCategory = manual.categoryFormatted || manual.category;
          return displayCategory === selectedCategory;
        }) || [];

  const handleDownload = (manualId: string, title: string) => {
    // Construct the direct download link using the Power Apps OData format
    const downloadUrl = `https://ecavendorhubspa.powerappsportals.com/_api/prmtk_websitecontents(${manualId})/prmtk_files/$value`;

    console.log(`[Download] Starting download for: ${title}`);

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${title}.pdf`; // Suggest a filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div>
        {/* Skeleton for category filter */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            {t("manuals.filterCategory")}
          </h2>
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
              ></div>
            ))}
          </div>
        </div>

        {/* Skeleton for manuals grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg flex-shrink-0"></div>
                <div className="flex-grow w-full">
                  <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">
          Failed to Load Manuals
        </h3>
        <p className="text-red-600 text-sm">
          {error instanceof Error
            ? error.message
            : "An error occurred while fetching manuals"}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!manuals || manuals.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <p className="text-blue-800">
          {language === "ar"
            ? "لا توجد أدلة مستخدم متاحة حالياً"
            : "No manuals available at the moment"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          {t("manuals.filterCategory")}
        </h2>
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
                <h3 className="text-lg font-semibold text-navy mb-1">
                  {manual.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {manual.categoryFormatted || manual.category} • Updated{" "}
                  {new Date(manual.modifiedOn).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4 flex-grow">
              {manual.description}
            </p>

            <div
              className={`flex items-center justify-between pt-4 border-t border-gray-200 ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              <span className="text-xs text-gray-500">PDF Document</span>
              <button
                onClick={() => handleDownload(manual.title)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium text-sm"
              >
                <Download className="w-4 h-4" />
                {t("manuals.download")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredManuals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{t("manuals.noManuals")}</p>
        </div>
      )}
    </div>
  );
}
