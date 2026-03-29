"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  is_deletable: boolean;
  created_at: string;
  related_anugraha_id?: string | null;
  related_photo_url?: string | null;
}

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function getNotificationHref(n: Notification): string {
  switch (n.type) {
    case "interest_received":
    case "interest_accepted":
    case "interest_declined":
      return `/user-info/interest-message${n.related_anugraha_id ? `/${n.related_anugraha_id}` : ""}`;
    case "profile_viewed":
      return "/my-home/views?tab=profiles-viewed-by-others";
    case "contact_viewed":
      return "/my-home/views?tab=contacts-viewed-by-others";
    case "photo_request_received":
      return "/user-info/photo-request";
    case "membership_expiring":
    case "membership_expired":
      return "/membership-plans";
    case "id_proof_verified":
    case "id_proof_rejected":
      return "/my-home/view-and-edit/id-proof";
    default:
      return "/my-home";
  }
}

function groupByDate(items: Notification[]): { label: string; items: Notification[] }[] {
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const previous: Notification[] = [];

  for (const item of items) {
    const date = new Date(item.created_at);
    if (isToday(date)) today.push(item);
    else if (isYesterday(date)) yesterday.push(item);
    else previous.push(item);
  }

  const groups: { label: string; items: Notification[] }[] = [];
  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (yesterday.length > 0) groups.push({ label: "Yesterday", items: yesterday });
  if (previous.length > 0) groups.push({ label: "Previous", items: previous });
  return groups;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const supabase = createClient();
  const user = useAuthStore((s) => s.user);
  const { setCount } = useNotificationStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) {
      setNotifications(data as Notification[]);
      setCount(data.filter((n: any) => !n.is_read).length);
    }
    setLoading(false);
  }, [user, supabase, setCount]);

  useEffect(() => {
    if (isOpen) load();
  }, [isOpen, load]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  async function markRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setCount(notifications.filter((n) => !n.is_read && n.id !== id).length);
  }

  async function handleDelete(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const groups = groupByDate(notifications);

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40" />}

      {/* Slide-in panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white border-l border-input shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-input">
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Notifications ({unreadCount})
            </h2>
            <div className="h-0.5 bg-primary mt-1 rounded-full" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors text-primary"
            aria-label="Close notifications"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-56px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No notifications yet.
            </p>
          ) : (
            <>
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                    {group.label}
                  </p>
                  <div className="divide-y divide-input">
                    {group.items.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${
                          n.is_read ? "opacity-60" : ""
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 relative">
                          {n.related_photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={n.related_photo_url}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-primary">
                              {n.title.charAt(0)}
                            </span>
                          )}
                        </div>
                        <Link
                          href={getNotificationHref(n)}
                          onClick={() => {
                            markRead(n.id);
                            onClose();
                          }}
                          className="flex-1 min-w-0"
                        >
                          <p
                            className={`text-sm line-clamp-1 ${
                              n.is_read
                                ? "text-muted-foreground"
                                : "text-foreground font-medium"
                            }`}
                          >
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {n.body}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(n.created_at), "dd/MM/yyyy h:mm a")}
                          </p>
                        </Link>
                        {n.is_deletable && (
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* View All */}
              <div className="px-4 py-3 border-t border-input">
                <Link
                  href="/my-home"
                  onClick={onClose}
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  View All Notifications
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
