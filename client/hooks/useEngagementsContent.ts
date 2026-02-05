import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchEngagements, EngagementItem } from "@/services/odata";

/**
 * Hook to fetch engagements content from OData API
 * with 5-minute cache
 */
export function useEngagementsContent(): UseQueryResult<EngagementItem[], Error> {
  return useQuery({
    queryKey: ["engagementsContent"],
    queryFn: fetchEngagements,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
