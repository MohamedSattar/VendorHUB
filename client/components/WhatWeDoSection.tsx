import { useLanguage } from "@/contexts/LanguageContext";
import { WebsiteContentItem } from "@/services/odata";

interface WhatWeDoSectionProps {
  content: WebsiteContentItem | null;
}

export default function WhatWeDoSection({ content }: WhatWeDoSectionProps) {
  const { isArabic } = useLanguage();

  if (!content) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-navy mb-4">{content.header}</h2>
      <p className={`text-gray-700 leading-relaxed mb-4 ${isArabic ? "text-right" : "text-left"}`}>
        {content.description}
      </p>
      <ul className={`space-y-2 text-gray-700 ${isArabic ? "pr-6" : "pl-6"}`}>
        <li>View and manage active engagements</li>
        <li>Track contracts and their status</li>
        <li>Access resources and documentation</li>
        <li>Manage team members and resources</li>
        <li>Monitor engagement progress and timelines</li>
        <li>Collaborate with ECA project managers</li>
      </ul>
    </section>
  );
}
