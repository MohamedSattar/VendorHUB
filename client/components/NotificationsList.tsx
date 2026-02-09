import { useState, useMemo } from "react";
import {
  X,
  Search,
  Filter,
  SortAsc,
  CheckCircle,
  AlertCircle,
  Info,
  CheckAll,
  Trash2,
} from "lucide-react";
import { Notification } from "@/services/notifications";

interface NotificationsListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  isLoading?: boolean;
}

type FilterType = "all" | "unread" | "read";
type SortType = "created" | "subject";

export default function NotificationsList({
  notifications,
  onMarkAsRead,
  onMarkAsUnread,
  onDismiss,
  onDismissAll,
  isLoading,
}: NotificationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("created");

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply filter by read status
    if (filterType === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (filterType === "read") {
      filtered = filtered.filter((n) => n.isRead);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.subject.toLowerCase().includes(query) ||
          n.message.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [notifications, filterType, searchQuery]);

  // Sort notifications
  const sortedNotifications = useMemo(() => {
    const sorted = [...filteredNotifications];

    if (sortType === "created") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortType === "subject") {
      sorted.sort((a, b) => a.subject.localeCompare(b.subject));
    }

    return sorted;
  }, [filteredNotifications, sortType]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // For recent items, show relative time
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    // For older items, show full date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            />
          </div>
          {notifications.length > 0 && (
            <button
              onClick={onDismissAll}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              title="Dismiss all notifications"
            >
              <Trash2 className="w-4 h-4" />
              Dismiss All
            </button>
          )}
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-gray-600" />
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
            >
              <option value="created">Sort by Created (Newest)</option>
              <option value="subject">Sort by Subject (A-Z)</option>
            </select>
          </div>

          {/* Info badge */}
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
            {unreadCount > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {unreadCount} unread
              </span>
            )}
            <span className="text-gray-500">
              {sortedNotifications.length} of {notifications.length}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {sortedNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
            <Info className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-lg font-medium text-gray-700">
              {notifications.length === 0
                ? "No notifications yet"
                : "No notifications match your filters"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {notifications.length === 0
                ? "You'll see notifications here when new messages arrive"
                : "Try adjusting your search or filters"}
            </p>
          </div>
        ) : (
          sortedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-4 p-4 rounded-lg border transition ${
                notification.isRead
                  ? "bg-white border-gray-200 hover:bg-gray-50"
                  : "bg-blue-50 border-blue-200 hover:bg-blue-100"
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 pt-1">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className={`text-sm font-semibold ${
                      notification.isRead
                        ? "text-gray-700"
                        : "text-navy font-bold"
                    }`}
                  >
                    {notification.subject}
                  </h3>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      notification.isRead
                        ? "text-gray-500"
                        : "text-blue-600 font-bold"
                    }`}
                  >
                    {formatDate(notification.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {notification.isRead ? (
                    <button
                      onClick={() => onMarkAsUnread(notification.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition"
                    >
                      Mark as unread
                    </button>
                  ) : (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Mark as read
                    </button>
                  )}
                  <span className="text-gray-300">•</span>
                  <button
                    onClick={() => onDismiss(notification.id)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline transition"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Dismiss button (small X) */}
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition p-1 hover:bg-gray-200 rounded"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
