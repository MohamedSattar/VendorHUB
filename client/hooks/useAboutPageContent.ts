import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchAboutPageContent, AboutPageContent } from "@/services/odata";

/**
 * Hook to fetch all About page content from OData API with a single call
 * Retrieves Mission, What We Do, Email, and Hours sections
 * with 5-minute cache
 */
export function useAboutPageContent(): UseQueryResult<AboutPageContent, Error> {
  return useQuery({
    queryKey: ["aboutPageContent"],
    queryFn: fetchAboutPageContent,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
