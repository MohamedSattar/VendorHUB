import { RequestHandler } from "express";
import { AuthenticatedRequest } from "@/middleware/auth";

/**
 * Get user profile (example authenticated endpoint)
 */
export const handleGetProfile: RequestHandler = (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    // In a real application, you would:
    // 1. Verify the token with Azure B2C
    // 2. Extract user info from the token (oid, email, name)
    // 3. Fetch user data from database using the user ID

    // For this example, we'll return mock data
    const profile = {
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      givenName: "John",
      familyName: "Doe",
      role: "vendor",
      organization: "Example Company",
      joinDate: "2024-01-15",
    };

    res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

/**
 * Update user profile (example authenticated endpoint)
 */
export const handleUpdateProfile: RequestHandler = (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { name, organization } = req.body;

    if (!name || !organization) {
      res
        .status(400)
        .json({ error: "Name and organization are required" });
      return;
    }

    // In a real application, you would validate and update the user in database

    const updatedProfile = {
      id: "user-123",
      email: "user@example.com",
      name,
      organization,
      updatedAt: new Date().toISOString(),
    };

    res.json(updatedProfile);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

/**
 * Get user's resources/contracts (example authenticated endpoint)
 */
export const handleGetUserResources: RequestHandler = (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;

    // In a real application, you would fetch from database
    // filtered by the authenticated user's ID

    const resources = [
      {
        id: "resource-1",
        title: "Annual Report 2024",
        category: "report",
        uploadedAt: "2024-01-15",
        size: "2.5 MB",
      },
      {
        id: "resource-2",
        title: "Vendor Guidelines",
        category: "guide",
        uploadedAt: "2024-01-10",
        size: "1.2 MB",
      },
    ];

    res.json(resources);
  } catch (error) {
    console.error("Get user resources error:", error);
    res.status(500).json({ error: "Failed to fetch resources" });
  }
};

/**
 * Delete user resource (example authenticated endpoint)
 */
export const handleDeleteResource: RequestHandler = (req, res) => {
  try {
    const authenticatedReq = req as AuthenticatedRequest;
    const { resourceId } = req.params;

    if (!resourceId) {
      res.status(400).json({ error: "Resource ID is required" });
      return;
    }

    // In a real application, you would:
    // 1. Verify the user owns this resource
    // 2. Delete from database
    // 3. Delete files from storage

    res.json({ success: true, message: "Resource deleted successfully" });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({ error: "Failed to delete resource" });
  }
};
