import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContact } from "@/contexts/UserContactContext";
import { LogOut } from "lucide-react";

interface ProfileFormData {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  contactPreference: "email" | "phone" | "sms";
  email: string;
}

interface CrmContact {
  prmtk_contactid: string;
  prmtk_firstname: string;
  prmtk_lastname: string;
  prmtk_email: string;
  prmtk_phone?: string;
  prmtk_mobilenumber?: string;
  prmtk_preferredcontactmethod?: number;
  preferredcontactmethodcode?: number;
  createdon: string;
  statuscode: number;
  prmtk_vendor_name?: string;
  prmtk_vendor_id?: string;
}

// Map between CRM numeric codes and form string values for preferred contact method
const CONTACT_METHOD_MAP: Record<number, "email" | "phone" | "sms"> = {
  1: "email",
  2: "phone",
  3: "sms",
};

const CONTACT_METHOD_REVERSE_MAP: Record<"email" | "phone" | "sms", number> = {
  email: 1,
  phone: 2,
  sms: 3,
};

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isArabic } = useLanguage();
  const { loggedInEmail, logout } = useAuth();
  const { setLoggedInContact } = useUserContact();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [contactData, setContactData] = useState<CrmContact | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    id: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    contactPreference: "email",
    email: "",
  });

  // Load contact data from CRM based on logged-in email
  useEffect(() => {
    const loadContactData = async () => {
      if (!loggedInEmail) {
        console.warn("[Profile] No logged-in email available");
        setIsLoadingData(false);
        return;
      }

      try {
        setIsLoadingData(true);
        console.log("[Profile] Loading contact data for email:", loggedInEmail);

        // Fetch contact from CRM via backend API
        const response = await fetch("/api/auth/contact-by-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: loggedInEmail }),
        });

        if (!response.ok) {
          console.warn("[Profile] Failed to load contact data:", response.status);
          toast({
            title: "Info",
            description: "Could not load existing profile data. Please fill in your information.",
          });
          setIsLoadingData(false);
          return;
        }

        const contact: CrmContact = await response.json();
        console.log("[Profile] Contact data loaded:", contact);

        setContactData(contact);

        // Map CRM data to form data
        // Map preferredcontactmethodcode (numeric) to form value (string)
        const preferredMethod = contact.preferredcontactmethodcode
          ? CONTACT_METHOD_MAP[contact.preferredcontactmethodcode] || "email"
          : "email";

        console.log("[Profile] Contact preference field:", {
          preferredcontactmethodcode: contact.preferredcontactmethodcode,
          mappedValue: preferredMethod,
        });

        setFormData({
          id: contact.prmtk_contactid,
          firstName: contact.prmtk_firstname || "",
          lastName: contact.prmtk_lastname || "",
          mobileNumber: contact.prmtk_mobilenumber || contact.prmtk_phone || "",
          contactPreference: preferredMethod,
          email: contact.prmtk_email || loggedInEmail,
        });

        // Store contact data in global context for filtering queries
        setLoggedInContact({
          contactId: contact.prmtk_contactid,
          email: contact.prmtk_email || loggedInEmail || "",
          firstName: contact.prmtk_firstname || "",
          lastName: contact.prmtk_lastname || "",
          vendorId: contact.prmtk_vendor_id,
          vendorName: contact.prmtk_vendor_name,
          accountStatus: contact.statuscode === 1 ? "Active" : "Inactive",
          memberSince: contact.createdon,
          userRole: "Vendor",
          mobileNumber: contact.prmtk_mobilenumber || contact.prmtk_phone,
          preferredContactMethod: preferredMethod,
        });
      } catch (error) {
        console.error("[Profile] Error loading contact data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadContactData();
  }, [loggedInEmail, toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Validation Error",
        description: "First Name and Last Name are required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.mobileNumber.trim()) {
      toast({
        title: "Validation Error",
        description: "Mobile Number is required.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("[Profile] Starting contact update for email:", loggedInEmail);
      console.log("[Profile] Contact ID:", formData.id);
      console.log("[Profile] Form data to save:", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
      });

      // Build update payload with trimmed values
      // Convert contactPreference string to numeric code for CRM
      const preferredMethodCode = CONTACT_METHOD_REVERSE_MAP[formData.contactPreference];

      const updatePayload = {
        firstname: formData.firstName.trim(),
        lastname: formData.lastName.trim(),
        mobilephone: formData.mobileNumber.trim(),
        preferredcontactmethodcode: preferredMethodCode,
      };

      // Call API to PATCH contact record in CRM using contact ID
      const response = await fetch(`/api/odata/contact/${formData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      console.log("[Profile] API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Profile] API error response:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to update profile");
        } catch {
          throw new Error("Failed to update profile in CRM");
        }
      }

      // Fetch updated contact data
      const updatedContact: CrmContact = await response.json();

      console.log("[Profile] Contact updated successfully:", {
        id: updatedContact.prmtk_contactid,
        firstName: updatedContact.prmtk_firstname,
        lastName: updatedContact.prmtk_lastname,
        mobileNumber: updatedContact.prmtk_mobilenumber,
      });

      // Update local state with new data
      const updatedPreferredMethod = updatedContact.preferredcontactmethodcode
        ? CONTACT_METHOD_MAP[updatedContact.preferredcontactmethodcode] || "email"
        : formData.contactPreference;

      setContactData(updatedContact);
      setFormData({
        id: updatedContact.prmtk_contactid,
        firstName: updatedContact.prmtk_firstname || "",
        lastName: updatedContact.prmtk_lastname || "",
        mobileNumber: updatedContact.prmtk_mobilenumber || "",
        contactPreference: updatedPreferredMethod,
        email: loggedInEmail,
      });

      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile. Please try again.";
      console.error("[Profile] Update error:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({
      title: "Success",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" dir={isArabic ? "rtl" : "ltr"}>
      <DashboardHeader />

      <main className="flex-grow">
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isArabic ? "text-right" : "text-left"}`}>
          {/* Breadcrumb */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-2">{t("profile.breadcrumb")}</p>
            <h1 className="text-3xl font-bold text-navy">{t("profile.title")}</h1>
          </div>

          {/* Profile Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-semibold text-navy mb-8">{t("profile.updateProfile")}</h2>

            {/* Loading State */}
            {isLoadingData && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800">Loading your profile information...</p>
              </div>
            )}

            {/* Email Display Info */}
            {loggedInEmail && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">Logged in as:</p>
                <p className="text-lg font-semibold text-navy">{loggedInEmail}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* First Name */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={isLoadingData}
                  placeholder="Enter your first name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={isLoadingData}
                  placeholder="Enter your last name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label
                  htmlFor="mobileNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  disabled={isLoadingData}
                  placeholder="Enter your mobile number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Contact Preference
                Bound to preferredcontactmethodcode field in CRM
              */}
              <div>
                <label
                  htmlFor="contactPreference"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Preferred Contact Method
                </label>
                <select
                  id="contactPreference"
                  name="contactPreference"
                  value={formData.contactPreference}
                  onChange={handleChange}
                  disabled={isLoadingData}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading || isLoadingData}
                  className="px-8 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  disabled={isLoading || isLoadingData}
                  className="px-8 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoading || isLoadingData}
                  className="ml-auto flex items-center gap-2 px-8 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </form>

            {/* Additional Info Section */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-navy mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <p className="text-lg font-semibold text-navy">
                    {contactData?.statuscode === 1 ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Member Since</p>
                  <p className="text-lg font-semibold text-navy">
                    {contactData?.createdon
                      ? new Date(contactData.createdon).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">Vendor Name</p>
                  <p className="text-lg font-semibold text-navy">
                    {contactData?.prmtk_vendor_name || "Not Assigned"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">User Role</p>
                  <p className="text-lg font-semibold text-navy">Vendor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
