import { useQuery } from "@tanstack/react-query";
import { CandidateDetail } from "@/services/odata";

export interface FullContactDetail extends CandidateDetail {
  personalPhotoFile?: File;
}

async function fetchContactDetails(contactId: string): Promise<CandidateDetail> {
  const response = await fetch(`/api/odata/candidate-contact/${contactId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch contact details: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Map status numeric value to display text
  let statusText = "Unknown";
  const statusValue = data.prmkt_status;

  if (statusValue === 1) {
    statusText = "Free";
  } else if (statusValue === 2) {
    statusText = "Assigned";
  } else if (statusValue === 3) {
    statusText = "Archived";
  }

  // Transform API response to our format
  return {
    id: data.prmtk_engagementcontactid,
    name: data.prmtk_id,
    email: data.prmtk_email,
    phoneNumber: data.prmtk_phonenumber,
    status: statusText,
    personalPhoto: `/api/odata/candidate-contact-photo/${data.prmtk_engagementcontactid}`,
    uaeResident: data.prmtk_uaeresident,
    cvFile: data.prmtk_cvfile_name,
    introductionDocument: data.prmtk_introductiondocument_name,
    educationalCertificate: data.prmtk_educationalcertificate_name,
    eid: data.prmtk_eid_name,
    salaryCertificate: data.prmtk_salarycertificate_name,
    passport: data.prmtk_passport_name,
    experienceLetter: data.prmtk_experienceletter_name,
    policeClearance: data.prmtk_policeclearance_name,
    createdOn: data.createdon,
    modifiedOn: data.modifiedon,
  };
}

export function useContactDetails(contactId?: string) {
  return useQuery<CandidateDetail | null, Error>({
    queryKey: ["contactDetails", contactId],
    queryFn: () => {
      if (!contactId) return null;
      return fetchContactDetails(contactId);
    },
    enabled: !!contactId,
    staleTime: 0, // No caching - always fetch fresh data
    gcTime: 0, // Remove from cache immediately
    refetchInterval: 5000, // Automatically refetch every 5 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue refetching even when tab is not focused
  });
}
