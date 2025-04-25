import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCircle, Loader2, XCircle, Circle, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useSocket } from "@/context/SocketProvider";

interface Notification {
  _id: string;
  type: string;
  content: string;
  isRead: boolean;
}

const NotificationMenu = () => {
  const socket = useSocket();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:3000/api/notification", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setNotifications(data);
        } else {
          toast.error("Failed to load notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Error fetching notifications");
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: any) => {
      console.log("🔔 New Notification:", notification);
      toast.success(`New notification: ${notification.content}`);
      setNotifications((prev) => {
        return [...prev, notification];
      });
    };

    socket.on("newNotification", handleNewNotification);

    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [socket]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/notification/setRead/${notificationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification._id === notificationId ? { ...notification, isRead: true } : notification
          )
        );
      } else {
        toast.error("Failed to mark notification as read");
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Error marking notification as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:3000/api/notification/delete/${notificationId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.filter((notification) => notification._id !== notificationId)
        );
      } else {
        toast.error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Error deleting notification");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Bell />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              className={cn("flex justify-between items-center gap-2 mb-1", !notification.isRead && "bg-neutral-800")}
            >
              <span className="flex items-center gap-2">
                {notification.type === "finished" && <CheckCircle className="text-green-500 w-4 h-4" />}
                {notification.type === "pending" && <Loader2 className="text-blue-500 w-4 h-4 animate-spin" />}
                {notification.type === "failed" && <XCircle className="text-red-500 w-4 h-4" />}
                {notification.type === "info" && <Circle className="w-4 h-4 text-gray-400" />}

                {notification.content}
              </span>

              {!notification.isRead && (
                <Button variant="outline" className="size-7" onClick={(e) => {
                  e.stopPropagation()
                  handleMarkAsRead(notification._id)
                }}>
                  <CheckCircle className="text-green-500 size-3 cursor-pointer" />
                </Button>
              )}

              {notification.isRead && (
                <Button variant="outline" className="size-7" onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteNotification(notification._id)
                }}>
                  <Trash className="text-red-500 size-3 cursor-pointer" />
                </Button>
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="flex items-center gap-2">
            No new notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu >
  );
};

export default NotificationMenu;
