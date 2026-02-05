import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchContentByHeaderName, WebsiteContentItem } from "@/services/odata";

/**
 * Hook to fetch "What We Do" content from OData API
 * Filters for header name "What We Do" with 5-minute cache
 */
export function useWhatWeDoContent(): UseQueryResult<WebsiteContentItem | null, Error> {
  return useQuery({
    queryKey: ["whatWeDoContent"],
    queryFn: () => fetchContentByHeaderName("What We Do"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
