import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManualsGrid from "@/components/ManualsGrid";
import { useLanguage } from "@/contexts/LanguageContext";

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

                <div className={`flex items-center justify-between pt-4 border-t border-gray-200 ${isArabic ? "flex-row-reverse" : ""}`}>
                  <span className="text-xs text-gray-500">{manual.fileSize}</span>
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

          {/* Support Section */}
          <div className={`mt-16 p-8 bg-gradient-to-r from-primary/10 to-orange-500/10 rounded-lg border border-primary/20 ${isArabic ? "text-right" : "text-left"}`}>
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
