import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchContentByHeaderName, WebsiteContentItem } from "@/services/odata";

/**
 * Hook to fetch contact email content from OData API
 * Filters for header name "Email" with 5-minute cache
 */
export function useContactEmailContent(): UseQueryResult<WebsiteContentItem | null, Error> {
  return useQuery({
    queryKey: ["contactEmailContent"],
    queryFn: () => fetchContentByHeaderName("Email"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
