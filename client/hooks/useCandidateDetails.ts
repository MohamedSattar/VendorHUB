import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchCandidateContactById, CandidateDetail } from "@/services/odata";

/**
 * React Query hook for fetching candidate contact details by ID
 * Handles loading, error, and caching states
 */
export function useCandidateDetails(
  contactId: string | undefined
): UseQueryResult<CandidateDetail | null, Error> {
  return useQuery({
    queryKey: ["candidateDetail", contactId],
    queryFn: () => (contactId ? fetchCandidateContactById(contactId) : Promise.resolve(null)),
    enabled: !!contactId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}
