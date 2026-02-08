import { useQuery } from "@tanstack/react-query";
import { fetchEngagementContacts, EngagementContact } from "@/services/odata";

export function useEngagementContacts() {
  return useQuery<EngagementContact[], Error>({
    queryKey: ["engagementContacts"],
    queryFn: () => fetchEngagementContacts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
