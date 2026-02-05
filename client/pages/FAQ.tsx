import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQAccordion from "@/components/FAQAccordion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(null);
  const { t, isArabic } = useLanguage();

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white" dir={isArabic ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-grow">
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ${isArabic ? "text-right" : "text-left"}`}>
          <h1 className="text-4xl font-bold text-navy mb-4">{t("faq.title")}</h1>
          <p className="text-lg text-gray-600 mb-12">
            {t("faq.subtitle")}
          </p>

          <div className="space-y-3">
            {faqItems.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-sm transition"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition text-left"
                >
                  <h3 className="text-lg font-semibold text-navy">{item.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-navy transition-transform flex-shrink-0 ml-4 ${
                      openId === item.id ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {openId === item.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-navy mb-2">{t("faq.stillHave")}</h3>
            <p className="text-gray-700">
              {t("faq.noAnswer")}{" "}
              <a href="mailto:support@eca.gov.ae" className="text-primary hover:underline">
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
