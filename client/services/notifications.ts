/**
 * Notifications Service
 * Handles fetching, updating, and managing notifications
 */

export interface Notification {
  id: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: "info" | "warning" | "success" | "error";
}

// Mock notifications data for demonstration
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    subject: "Engagement Submitted Successfully",
    message: "Your engagement 'UAE Resources - Q1 2024' has been submitted to ECA for processing.",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: "success",
  },
  {
    id: "2",
    subject: "New Open Role Available",
    message: "A new open role 'Senior Developer' has been added to engagement 'Cloud Migration Project'.",
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    type: "info",
  },
  {
    id: "3",
    subject: "Document Upload Required",
    message: "Please upload the required documents for candidate 'Ahmed Al-Mansouri' within 24 hours.",
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: "warning",
  },
  {
    id: "4",
    subject: "Candidate Assignment Confirmed",
    message: "Sarah Johnson has been successfully assigned to role 'Business Analyst' in engagement 'Process Optimization'.",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: "success",
  },
  {
    id: "5",
    subject: "Engagement Status Update",
    message: "Engagement 'IT Support Services' status has been updated to 'In Progress'.",
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: "info",
  },
  {
    id: "6",
    subject: "Action Required: Missing Information",
    message: "Please complete the missing designation information for open role 'Project Manager'.",
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    type: "warning",
  },
];

/**
 * Fetch all notifications for the current user
 * TODO: Replace with actual API call to /api/notifications
 */
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    // In production, this would call: GET /api/notifications
    // const response = await fetch("/api/notifications");
    // if (!response.ok) throw new Error("Failed to fetch notifications");
    // return await response.json();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_NOTIFICATIONS;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Mark a single notification as read
 * TODO: Replace with actual API call to /api/notifications/:id/read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<Notification> {
  try {
    // In production: PATCH /api/notifications/:id/read
    // const response = await fetch(`/api/notifications/${notificationId}/read`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    // });
    // if (!response.ok) throw new Error("Failed to mark as read");
    // return await response.json();

    const notification = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    return notification || { id: notificationId, subject: "", message: "", isRead: true, createdAt: "" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark a single notification as unread
 * TODO: Replace with actual API call to /api/notifications/:id/unread
 */
export async function markNotificationAsUnread(
  notificationId: string
): Promise<Notification> {
  try {
    // In production: PATCH /api/notifications/:id/unread
    // const response = await fetch(`/api/notifications/${notificationId}/unread`, {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    // });
    // if (!response.ok) throw new Error("Failed to mark as unread");
    // return await response.json();

    const notification = MOCK_NOTIFICATIONS.find((n) => n.id === notificationId);
    if (notification) {
      notification.isRead = false;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
    return notification || { id: notificationId, subject: "", message: "", isRead: false, createdAt: "" };
  } catch (error) {
    console.error("Error marking notification as unread:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * TODO: Replace with actual API call to /api/notifications/read-all
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    // In production: PATCH /api/notifications/read-all
    // const response = await fetch("/api/notifications/read-all", {
    //   method: "PATCH",
    //   headers: { "Content-Type": "application/json" },
    // });
    // if (!response.ok) throw new Error("Failed to mark all as read");

    MOCK_NOTIFICATIONS.forEach((n) => {
      n.isRead = true;
    });
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Dismiss (delete) a notification
 * TODO: Replace with actual API call to /api/notifications/:id
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  try {
    // In production: DELETE /api/notifications/:id
    // const response = await fetch(`/api/notifications/${notificationId}`, {
    //   method: "DELETE",
    //   headers: { "Content-Type": "application/json" },
    // });
    // if (!response.ok) throw new Error("Failed to dismiss notification");

    const index = MOCK_NOTIFICATIONS.findIndex((n) => n.id === notificationId);
    if (index > -1) {
      MOCK_NOTIFICATIONS.splice(index, 1);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (error) {
    console.error("Error dismissing notification:", error);
    throw error;
  }
}

/**
 * Dismiss all notifications
 * TODO: Replace with actual API call to /api/notifications/dismiss-all
 */
export async function dismissAllNotifications(): Promise<void> {
  try {
    // In production: DELETE /api/notifications/dismiss-all
    // const response = await fetch("/api/notifications/dismiss-all", {
    //   method: "DELETE",
    //   headers: { "Content-Type": "application/json" },
    // });
    // if (!response.ok) throw new Error("Failed to dismiss all notifications");

    MOCK_NOTIFICATIONS.length = 0;
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (error) {
    console.error("Error dismissing all notifications:", error);
    throw error;
  }
}
