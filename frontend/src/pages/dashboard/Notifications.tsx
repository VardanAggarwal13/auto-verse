import { useMemo, useState, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Filter, Info, Sparkles } from "lucide-react";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
}

const typeMeta = (type: NotificationType) => {
  switch (type) {
    case "success":
      return { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, badge: "bg-green-500/10 text-green-700 border-green-500/20" };
    case "warning":
      return { icon: <AlertTriangle className="w-5 h-5 text-yellow-700" />, badge: "bg-yellow-500/10 text-yellow-800 border-yellow-500/20" };
    case "error":
      return { icon: <AlertCircle className="w-5 h-5 text-destructive" />, badge: "bg-destructive/10 text-destructive border-destructive/20" };
    default:
      return { icon: <Info className="w-5 h-5 text-blue-600" />, badge: "bg-blue-500/10 text-blue-700 border-blue-500/20" };
  }
};

const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const filtered = useMemo(() => (filter === "unread" ? notifications.filter((n) => !n.read) : notifications), [notifications, filter]);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications");
      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
      toast.error("Failed to mark all as read");
    }
  };

  const openNotification = async (n: Notification) => {
    if (!n.read) await markAsRead(n._id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,hsl(var(--primary)/0.14),transparent_42%),radial-gradient(circle_at_90%_28%,hsl(var(--secondary)/0.18),transparent_45%),radial-gradient(circle_at_40%_92%,hsl(var(--primary)/0.08),transparent_38%)]" />
        <div className="relative p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Notifications
            </div>
            <h1 className="mt-3 text-3xl font-display font-bold">Your updates</h1>
            <p className="mt-1 text-muted-foreground">System alerts, status updates, and important activity.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              className="gap-2"
              onClick={() => setFilter((f) => (f === "unread" ? "all" : "unread"))}
            >
              <Filter className="h-4 w-4" />
              {filter === "unread" ? "Showing unread" : "Filter unread"}
              <Badge variant="outline" className="ml-2">
                {unreadCount}
              </Badge>
            </Button>

            <Button variant="secondary" onClick={markAllAsRead} disabled={unreadCount === 0}>
              Mark all as read
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3">
          <div className="h-20 rounded-xl border bg-card animate-pulse" />
          <div className="h-20 rounded-xl border bg-card animate-pulse" />
          <div className="h-20 rounded-xl border bg-card animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              No notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {filter === "unread" ? "You have no unread notifications." : "You don’t have any notifications yet."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((n) => {
            const meta = typeMeta(n.type);
            return (
              <button
                key={n._id}
                onClick={() => openNotification(n)}
                className={[
                  "text-left bg-card p-4 rounded-xl border shadow-sm flex gap-4 items-start transition-colors",
                  "hover:bg-muted/30",
                  n.read ? "opacity-80" : "border-primary/30 bg-primary/5",
                ].join(" ")}
              >
                <div className="p-2 rounded-full bg-muted mt-1">{meta.icon}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{n.title}</h3>
                        <Badge variant="outline" className={`capitalize ${meta.badge}`}>
                          {n.type}
                        </Badge>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">{n.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

