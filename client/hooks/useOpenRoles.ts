import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchOpenRoles, OpenRole } from "@/services/odata";

/**
 * React Query hook for fetching open roles for an engagement
 * Handles loading, error, and caching states
 */
export function useOpenRoles(
  engagementId: string | undefined
): UseQueryResult<OpenRole[], Error> {
  return useQuery({
    queryKey: ["openRoles", engagementId],
    queryFn: () => (engagementId ? fetchOpenRoles(engagementId) : Promise.resolve([])),
    enabled: !!engagementId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
