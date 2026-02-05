import { useLanguage } from "@/contexts/LanguageContext";
import { WebsiteContentItem } from "@/services/odata";

interface MissionSectionProps {
  mission: WebsiteContentItem | null;
}

export default function MissionSection({ mission }: MissionSectionProps) {
  const { isArabic } = useLanguage();

  if (!mission) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-navy mb-4">{mission.header}</h2>
      <p className={`text-gray-700 leading-relaxed mb-4 ${isArabic ? "text-right" : "text-left"}`}>
        {mission.description}
      </p>
    </section>
  );
}
