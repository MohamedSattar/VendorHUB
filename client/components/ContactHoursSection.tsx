import { useLanguage } from "@/contexts/LanguageContext";
import { WebsiteContentItem } from "@/services/odata";

interface ContactHoursSectionProps {
  hours: WebsiteContentItem | null;
}

export default function ContactHoursSection({ hours }: ContactHoursSectionProps) {
  const { t } = useLanguage();

  if (!hours) {
    return (
      <p className="text-gray-700">
        <span className="font-semibold">{t("about.hours")}</span> Sunday - Thursday, 8:00 AM - 5:00 PM (GST)
      </p>
    );
  }

  return (
    <p className="text-gray-700">
      <span className="font-semibold">{hours.header}</span> {hours.description}
    </p>
  );
}
