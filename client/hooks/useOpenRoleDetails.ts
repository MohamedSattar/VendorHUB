import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchOpenRoleById, OpenRole } from "@/services/odata";
import { useEffect } from "react";

/**
 * React Query hook for fetching open role details by ID
 * Handles loading, error, and caching states
 */
export function useOpenRoleDetails(
  openRoleId: string | undefined
): UseQueryResult<OpenRole | null, Error> {
  const query = useQuery({
    queryKey: ["openRole", openRoleId],
    queryFn: () => {
      if (!openRoleId) {
        console.log("[useOpenRoleDetails] No openRoleId provided, returning null");
        return Promise.resolve(null);
      }
      console.log("[useOpenRoleDetails] Fetching open role details for ID:", openRoleId);
      return fetchOpenRoleById(openRoleId);
    },
    enabled: !!openRoleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Debug logging
  useEffect(() => {
    console.log("[useOpenRoleDetails] Query state:", {
      openRoleId,
      isLoading: query.isLoading,
      isError: query.isError,
      hasData: !!query.data,
      candidateId: query.data?.candidateId,
      error: query.error?.message,
    });
  }, [openRoleId, query.isLoading, query.isError, query.data, query.error]);

  return query;
}
