import { useContactEmailContent } from "@/hooks/useContactEmailContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { RefreshCw } from "lucide-react";

interface ContactEmailSectionProps {
  onRetry?: () => void;
}

export default function ContactEmailSection({ onRetry }: ContactEmailSectionProps) {
  const { data: content, isLoading, error, refetch, isFetching } = useContactEmailContent();
  const { t, isArabic } = useLanguage();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
        <p className="text-red-800 text-sm mb-2">Failed to load email content</p>
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
      <p className="text-gray-700 mb-2">
        <span className="font-semibold">{t("about.email")}</span> support@eca.gov.ae
      </p>
    );
  }

  return (
    <p className="text-gray-700 mb-2">
      <span className="font-semibold">{content.header}</span> {content.description}
    </p>
  );
}
