/**
 * Notifications Service
 * Handles fetching, updating, and managing notifications from the CRM backend
 */

// Helper to get contact ID from storage
function getContactIdFromStorage(): string | null {
  try {
    const contact = localStorage.getItem("loggedInContact");
    if (contact) {
      const parsed = JSON.parse(contact);
      return parsed.contactId || null;
    }
  } catch (error) {
    console.error("[Notifications] Error reading contact from storage:", error);
  }
  return null;
}

export interface Notification {
  id: string;
  subject: string;
  message: string;
  isRead: boolean;
  isDismissed?: boolean;
  createdAt: string;
  name?: string;
  type?: "info" | "warning" | "success" | "error";
}


/**
 * Fetch all notifications for the current user
 * Retrieves from prmkt_notifications table filtered by current contact
 * @param contactId - The contact ID to fetch notifications for (from UserContactContext)
 */
export async function fetchNotifications(contactId: string): Promise<Notification[]> {
  try {
    if (!contactId) {
      throw new Error("Contact ID is required to fetch notifications");
    }

    console.log("[Notifications] Fetching notifications for contact:", contactId);

    const url = `/api/odata/notifications?contactId=${encodeURIComponent(contactId)}`;
    console.log("[Notifications] Request URL:", url);

    // Create an abort controller with a 10-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log("[Notifications] Response status:", response.status, response.statusText);

      if (!response.ok) {
        let errorBody = "";
        try {
          errorBody = await response.text();
        } catch (e) {
          errorBody = "Could not read response body";
        }
        throw new Error(
          `Failed to fetch notifications: ${response.status} ${response.statusText}. ${errorBody}`
        );
      }

      const notifications: Notification[] = await response.json();

      console.log("[Notifications] Retrieved", notifications.length, "notifications");

      return notifications;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Notification request timed out (10 seconds)");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[Notifications] Error fetching notifications:", error);
    throw error;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
): Promise<Notification> {
  try {
    console.log("[Notifications] Marking as read:", notificationId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `/api/odata/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to mark as read: ${response.status} ${response.statusText}`
        );
      }

      console.log("[Notifications] Marked as read:", notificationId);

      return {
        id: notificationId,
        subject: "",
        message: "",
        isRead: true,
        createdAt: new Date().toISOString(),
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timed out (10 seconds)");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[Notifications] Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark a single notification as unread
 */
export async function markNotificationAsUnread(
  notificationId: string,
): Promise<Notification> {
  try {
    console.log("[Notifications] Marking as unread:", notificationId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `/api/odata/notifications/${notificationId}/unread`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to mark as unread: ${response.status} ${response.statusText}`
        );
      }

      console.log("[Notifications] Marked as unread:", notificationId);

      return {
        id: notificationId,
        subject: "",
        message: "",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timed out (10 seconds)");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[Notifications] Error marking notification as unread:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * Note: Current implementation marks individual notifications
 * Could be optimized with a batch API endpoint in the future
 */
export async function markAllNotificationsAsRead(): Promise<void> {
  try {
    console.log("[Notifications] Marking all notifications as read");

    const contactId = getContactIdFromStorage();

    if (!contactId) {
      throw new Error("Contact ID is required to mark all notifications as read");
    }

    // Fetch all unread notifications
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `/api/odata/notifications?contactId=${encodeURIComponent(contactId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const notifications: Notification[] = await response.json();
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      // Mark each as read
      const updatePromises = unreadNotifications.map((n) =>
        markNotificationAsRead(n.id)
      );

      await Promise.all(updatePromises);

      console.log("[Notifications] All notifications marked as read");
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timed out (10 seconds)");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[Notifications] Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Dismiss a notification (mark as dismissed)
 */
export async function dismissNotification(
  notificationId: string,
): Promise<void> {
  try {
    console.log("[Notifications] Dismissing notification:", notificationId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `/api/odata/notifications/${notificationId}/dismiss`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to dismiss notification: ${response.status} ${response.statusText}`
        );
      }

      console.log("[Notifications] Notification dismissed:", notificationId);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timed out (10 seconds)");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[Notifications] Error dismissing notification:", error);
    throw error;
  }
}

/**
 * Dismiss all notifications for the current user
 * @param contactId - The contact ID (from UserContactContext)
 */
export async function dismissAllNotifications(contactId: string): Promise<void> {
  try {
    if (!contactId) {
      throw new Error("Contact ID is required to dismiss notifications");
    }

    console.log("[Notifications] Dismissing all notifications for contact:", contactId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(
        `/api/odata/notifications/dismiss-all?contactId=${encodeURIComponent(contactId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Failed to dismiss all notifications: ${response.status} ${response.statusText}`
        );
      }

      console.log("[Notifications] All notifications dismissed");
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Request timed out (10 seconds)");
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("[Notifications] Error dismissing all notifications:", error);
    throw error;
  }
}
