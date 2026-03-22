import { format } from "date-fns";
import Link from "next/link";

export interface NotificationItem {
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

interface ActivityFeedItemProps {
  notification: NotificationItem;
  onMarkRead?: (id: string) => void;
}

export function ActivityFeedItem({ notification, onMarkRead }: ActivityFeedItemProps) {
  const href = getNotificationHref(notification);

  return (
    <Link
      href={href}
      onClick={() => onMarkRead?.(notification.id)}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
        notification.is_read ? "opacity-60" : ""
      }`}
    >
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {notification.related_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={notification.related_photo_url}
            alt=""
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-primary">
            {notification.title.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm line-clamp-1 ${notification.is_read ? "text-muted-foreground" : "text-foreground font-medium"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {notification.body}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {format(new Date(notification.created_at), "dd/MM/yyyy h:mm a")}
        </p>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      )}
    </Link>
  );
}

function getNotificationHref(n: NotificationItem): string {
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
