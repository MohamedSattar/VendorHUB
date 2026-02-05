import { useWhatWeDoContent } from "@/hooks/useWhatWeDoContent";
import { useLanguage } from "@/contexts/LanguageContext";
import { RefreshCw } from "lucide-react";

export default function WhatWeDoSection() {
  const { data: content, isLoading, error, refetch, isFetching } = useWhatWeDoContent();
  const { isArabic } = useLanguage();

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 mb-4">
            Failed to load "What We Do" content. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            <RefreshCw size={18} className={isFetching ? "animate-spin" : ""} />
            {isFetching ? "Retrying..." : "Retry"}
          </button>
        </div>
      </section>
    );
  }

  if (!content) {
    return (
      <section className="mb-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            "What We Do" content not available at this time.
          </p>
        </div>
      </section>
    );
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
