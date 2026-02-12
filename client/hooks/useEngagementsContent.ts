import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchEngagements, EngagementItem } from "@/services/odata";

/**
 * Hook to fetch engagements content from OData API
 * Filters by vendor ID if provided
 * with 5-minute cache
 */
export function useEngagementsContent(vendorId?: string): UseQueryResult<EngagementItem[], Error> {
  return useQuery({
    queryKey: ["engagementsContent", vendorId],
    queryFn: () => fetchEngagements(vendorId),
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // Remove from cache immediately
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
