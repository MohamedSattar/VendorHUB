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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
