import { useContactHoursContent } from "@/hooks/useContactHoursContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { RefreshCw } from "lucide-react";

interface ContactHoursSectionProps {
  onRetry?: () => void;
}

export default function ContactHoursSection({ onRetry }: ContactHoursSectionProps) {
  const { data: content, isLoading, error, refetch, isFetching } = useContactHoursContent();
  const { t, isArabic } = useLanguage();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-80"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm mb-2">Failed to load hours content</p>
        <button
          onClick={() => {
            refetch();
            onRetry?.();
          }}
          disabled={isFetching}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          {isFetching ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  if (!content) {
    return (
      <p className="text-gray-700">
        <span className="font-semibold">{t("about.hours")}</span> Sunday - Thursday, 8:00 AM - 5:00 PM (GST)
      </p>
    );
  }

  return (
    <p className="text-gray-700">
      <span className="font-semibold">{content.header}</span> {content.description}
    </p>
  );
}
