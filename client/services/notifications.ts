/**
 * Notifications Service
 * Handles fetching, updating, and managing notifications from the CRM backend
 */

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
 * Get contact ID from localStorage
 */
function getContactIdFromStorage(): string {
  const loggedInContact = localStorage.getItem("loggedInContact");
  if (loggedInContact) {
    try {
      const contact = JSON.parse(loggedInContact);
      return contact.contactId;
    } catch (error) {
      console.error("Error parsing logged in contact:", error);
    }
  }
  throw new Error("Contact ID not found. User may not be logged in.");
}

/**
 * Fetch all notifications for the current user
 * Retrieves from prmkt_notifications table filtered by current contact
 */
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const contactId = getContactIdFromStorage();

    console.log("[Notifications] Fetching notifications for contact:", contactId);

    const response = await fetch(
      `/api/odata/notifications?contactId=${encodeURIComponent(contactId)}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch notifications: ${response.status} ${response.statusText}`
      );
    }

    const notifications: Notification[] = await response.json();

    console.log("[Notifications] Retrieved", notifications.length, "notifications");

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
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

    const response = await fetch(
      `/api/odata/notifications/${notificationId}/read`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

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
  } catch (error) {
    console.error("Error marking notification as read:", error);
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

    const response = await fetch(
      `/api/odata/notifications/${notificationId}/unread`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

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
  } catch (error) {
    console.error("Error marking notification as unread:", error);
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

    // Fetch all unread notifications
    const response = await fetch(
      `/api/odata/notifications?contactId=${encodeURIComponent(contactId)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const notifications: Notification[] = await response.json();
    const unreadNotifications = notifications.filter((n) => !n.isRead);

    // Mark each as read
    const updatePromises = unreadNotifications.map((n) =>
      markNotificationAsRead(n.id)
    );

    await Promise.all(updatePromises);

    console.log("[Notifications] All notifications marked as read");
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
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

    const response = await fetch(
      `/api/odata/notifications/${notificationId}/dismiss`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to dismiss notification: ${response.status} ${response.statusText}`
      );
    }

    console.log("[Notifications] Notification dismissed:", notificationId);
  } catch (error) {
    console.error("Error dismissing notification:", error);
    throw error;
  }
}

/**
 * Dismiss all notifications for the current user
 */
export async function dismissAllNotifications(): Promise<void> {
  try {
    const contactId = getContactIdFromStorage();

    console.log("[Notifications] Dismissing all notifications for contact:", contactId);

    const response = await fetch(
      `/api/odata/notifications/dismiss-all?contactId=${encodeURIComponent(contactId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to dismiss all notifications: ${response.status} ${response.statusText}`
      );
    }

    console.log("[Notifications] All notifications dismissed");
  } catch (error) {
    console.error("Error dismissing all notifications:", error);
    throw error;
  }
}
