import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchOpenRoleById, OpenRole } from "@/services/odata";

/**
 * React Query hook for fetching open role details by ID
 * Handles loading, error, and caching states
 */
export function useOpenRoleDetails(
  openRoleId: string | undefined
): UseQueryResult<OpenRole | null, Error> {
  return useQuery({
    queryKey: ["openRole", openRoleId],
    queryFn: () => (openRoleId ? fetchOpenRoleById(openRoleId) : Promise.resolve(null)),
    enabled: !!openRoleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
