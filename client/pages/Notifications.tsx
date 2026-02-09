import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import Footer from "@/components/Footer";
import NotificationsList from "@/components/NotificationsList";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import {
  Notification,
  fetchNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
  dismissNotification,
  dismissAllNotifications,
} from "@/services/notifications";

export default function Notifications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isArabic } = useLanguage();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchNotifications();
        setNotifications(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load notifications";
        setError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [toast]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark as read";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    try {
      await markNotificationAsUnread(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      toast({
        title: "Success",
        description: "Notification marked as unread",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark as unread";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast({
        title: "Success",
        description: "Notification dismissed",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to dismiss notification";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDismissAll = async () => {
    if (notifications.length === 0) return;

    // Show confirmation
    const confirmed = window.confirm(
      "Are you sure you want to dismiss all notifications? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      await dismissAllNotifications();
      setNotifications([]);
      toast({
        title: "Success",
        description: "All notifications dismissed",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to dismiss all notifications";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      className={`flex flex-col min-h-screen bg-gray-50 ${
        isArabic ? "rtl" : "ltr"
      }`}
    >
      <DashboardHeader />

      {/* Main content */}
      <main className="flex-grow">
        <div
          className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
            isArabic ? "text-right" : "text-left"
          }`}
        >
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-navy hover:text-primary mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-8 h-8 text-navy" />
              <h1 className="text-3xl font-bold text-navy">Notifications</h1>
            </div>
            <p className="text-gray-600">
              {notifications.length === 0
                ? "You have no notifications"
                : `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""} out of ${notifications.length} total`}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
          )}

          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <NotificationsList
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsUnread={handleMarkAsUnread}
                onDismiss={handleDismiss}
                onDismissAll={handleDismissAll}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
