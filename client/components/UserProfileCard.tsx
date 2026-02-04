import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  role?: string;
  organization?: string;
  joinDate?: string;
}

export default function UserProfileCard() {
  const { user: contextUser } = useAuth();
  const authenticatedFetch = useAuthenticatedFetch();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authenticatedFetch("/api/user/profile");

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (contextUser) {
      fetchProfile();
    }
  }, [authenticatedFetch, contextUser]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-navy">User Profile</h2>
      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-600">Name</label>
          <p className="text-navy font-medium">{profile.name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <p className="text-navy">{profile.email}</p>
        </div>
        {profile.organization && (
          <div>
            <label className="text-sm text-gray-600">Organization</label>
            <p className="text-navy">{profile.organization}</p>
          </div>
        )}
        {profile.role && (
          <div>
            <label className="text-sm text-gray-600">Role</label>
            <p className="text-navy capitalize">{profile.role}</p>
          </div>
        )}
        {profile.joinDate && (
          <div>
            <label className="text-sm text-gray-600">Member Since</label>
            <p className="text-navy">{new Date(profile.joinDate).toLocaleDateString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
