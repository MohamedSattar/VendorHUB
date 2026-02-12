import { useQuery } from "@tanstack/react-query";
import { fetchEngagementContacts, EngagementContact } from "@/services/odata";

export function useEngagementContacts(vendorId?: string) {
  return useQuery<EngagementContact[], Error>({
    queryKey: ["engagementContacts", vendorId],
    queryFn: async () => {
      console.log("[useEngagementContacts] Fetching contacts for vendor:", vendorId || "all");

      // Fetch contacts filtered by vendor ID (server-side filtering)
      const contacts = await fetchEngagementContacts(vendorId);

      console.log("[useEngagementContacts] Fetched contacts:", {
        vendorId,
        count: contacts.length,
        contacts: contacts.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
        })),
      });

      return contacts;
    },
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // Remove from cache immediately
    refetchInterval: 5000, // Automatically refetch every 5 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue refetching even when tab is not focused
  });
}
