import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchManualsContent, ManualItem } from "@/services/odata";

/**
 * Hook to fetch and cache Manuals content from Power Apps API
 * Uses TanStack Query for automatic caching and state management
 */
export function useManualsContent(): UseQueryResult<ManualItem[], Error> {
  return useQuery({
    queryKey: ["manualsContent"],
    queryFn: fetchManualsContent,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
