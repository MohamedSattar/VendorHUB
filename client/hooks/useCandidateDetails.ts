import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchCandidateContactById, CandidateDetail } from "@/services/odata";
import { useEffect } from "react";

/**
 * React Query hook for fetching candidate contact details by ID
 * Handles loading, error, and caching states
 */
export function useCandidateDetails(
  contactId: string | undefined
): UseQueryResult<CandidateDetail | null, Error> {
  const query = useQuery({
    queryKey: ["candidateDetail", contactId],
    queryFn: () => {
      if (!contactId) {
        console.log("[useCandidateDetails] No contactId provided, returning null");
        return Promise.resolve(null);
      }
      console.log("[useCandidateDetails] Fetching candidate details for ID:", contactId);
      return fetchCandidateContactById(contactId);
    },
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Debug logging
  useEffect(() => {
    console.log("[useCandidateDetails] Query state:", {
      contactId,
      isLoading: query.isLoading,
      isError: query.isError,
      hasData: !!query.data,
      error: query.error?.message,
    });
  }, [contactId, query.isLoading, query.isError, query.data, query.error]);

  return query;
}
