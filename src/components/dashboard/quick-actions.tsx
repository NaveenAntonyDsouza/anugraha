import Link from "next/link";
import { Search, Send, Inbox, Heart, Eye } from "lucide-react";

const ACTIONS = [
  { label: "Search Partner", href: "/my-home/search/partner-search", icon: Search },
  { label: "Sent Interests", href: "/user-info/interest-message?tab=sent", icon: Send },
  { label: "Received Interests", href: "/user-info/interest-message?tab=received", icon: Inbox },
  { label: "Shortlisted", href: "/my-home/lists", icon: Heart },
  { label: "Who Viewed Me", href: "/my-home/views?tab=profiles-viewed-by-others", icon: Eye },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex items-center gap-2 h-9 px-4 bg-white border border-input rounded-lg text-sm font-medium text-foreground hover:border-primary/30 hover:text-primary transition-all"
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
