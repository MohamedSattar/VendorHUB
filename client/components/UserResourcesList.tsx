import { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { Trash2 } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  category: string;
  uploadedAt: string;
  size: string;
}

export default function UserResourcesList() {
  const authenticatedFetch = useAuthenticatedFetch();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch("/api/user/resources");

      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();
      setResources(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load resources. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      setDeleting(resourceId);
      const response = await authenticatedFetch(
        `/api/user/resources/${resourceId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }

      // Remove from local state
      setResources(resources.filter((r) => r.id !== resourceId));
    } catch (err) {
      console.error("Error deleting resource:", err);
      alert("Failed to delete resource. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded"></div>
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

  if (resources.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-navy">My Resources</h2>
        <p className="text-gray-500">No resources yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-navy">My Resources</h2>
      <div className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="flex items-center justify-between border border-gray-200 rounded p-4 hover:bg-gray-50 transition"
          >
            <div className="flex-1">
              <h3 className="font-medium text-navy mb-1">{resource.title}</h3>
              <div className="flex gap-4 text-sm text-gray-600">
                <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {resource.category}
                </span>
                <span>{resource.size}</span>
                <span>
                  {new Date(resource.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteResource(resource.id)}
              disabled={deleting === resource.id}
              className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
              title="Delete resource"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
