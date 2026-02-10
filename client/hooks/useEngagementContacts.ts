import { useQuery } from "@tanstack/react-query";
import { fetchEngagementContacts, EngagementContact, fetchEngagements } from "@/services/odata";

export function useEngagementContacts(vendorId?: string) {
  return useQuery<EngagementContact[], Error>({
    queryKey: ["engagementContacts", vendorId],
    queryFn: async () => {
      // If vendor ID is provided, filter contacts by vendor's engagements
      if (vendorId) {
        console.log("[useEngagementContacts] Fetching contacts for vendor:", vendorId);

        // Fetch all engagements for the vendor
        const engagements = await fetchEngagements(vendorId);
        const vendorEngagementIds = new Set(engagements.map(e => e.id));

        // Fetch all contacts
        const allContacts = await fetchEngagementContacts();

        // Filter contacts to only those assigned to vendor's engagements
        const filteredContacts = allContacts.filter(contact =>
          contact.engagementId && vendorEngagementIds.has(contact.engagementId)
        );

        console.log("[useEngagementContacts] Filtered contacts:", {
          total: allContacts.length,
          vendorEngagements: engagements.length,
          filtered: filteredContacts.length,
        });

        return filteredContacts;
      } else {
        // If no vendor ID, return all contacts (fallback)
        console.log("[useEngagementContacts] No vendor ID provided, returning all contacts");
        return fetchEngagementContacts();
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
