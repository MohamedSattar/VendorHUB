import { useLanguage } from "@/contexts/LanguageContext";
import ContactEmailSection from "@/components/ContactEmailSection";
import ContactHoursSection from "@/components/ContactHoursSection";
import { WebsiteContentItem } from "@/services/odata";

interface ContactSectionProps {
  email: WebsiteContentItem | null;
  hours: WebsiteContentItem | null;
}

export default function ContactSection({ email, hours }: ContactSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-navy mb-4">{t("about.contact")}</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        {t("about.contactText")}
      </p>
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <ContactEmailSection email={email} />
        <ContactHoursSection hours={hours} />
      </div>
    </section>
  );
}
