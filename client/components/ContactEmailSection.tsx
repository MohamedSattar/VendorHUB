import { useLanguage } from "@/contexts/LanguageContext";
import { WebsiteContentItem } from "@/services/odata";

interface ContactEmailSectionProps {
  email: WebsiteContentItem | null;
}

export default function ContactEmailSection({ email }: ContactEmailSectionProps) {
  const { t } = useLanguage();

  if (!email) {
    return (
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">{t("about.email")}</span> support@eca.gov.ae
      </p>
    );
  }

  return (
    <p className="text-gray-700 mb-2">
      <span className="font-semibold">{email.header}</span> {email.description}
    </p>
  );
}
