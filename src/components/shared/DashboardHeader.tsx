"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  Bell,
  Headphones,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { NotificationsPanel } from "@/components/dashboard/notifications-panel";

const NAV_ITEMS = [
  {
    label: "My Home",
    items: [
      { label: "My Home", href: "/my-home" },
      { label: "View & Edit My Profile", href: "/my-home/view-and-edit/primary-info" },
      { label: "Submit ID Proof", href: "/submit-id-proof" },
      { label: "Manage Photo", href: "/my-home/view-and-edit/manage-photos" },
      { label: "Profile Settings", href: "/my-home/profile-settings" },
    ],
  },
  {
    label: "Search",
    items: [
      { label: "Partner Search", href: "/my-home/search/partner-search" },
      { label: "Keyword Search", href: "/my-home/search/keyword-search" },
      { label: "Saved Search", href: "/my-home/search/saved-search" },
      { label: "Discover Profiles", href: "/my-home/search/discover-profiles" },
      { label: "Highlighted Profiles", href: "/my-home/search/highlighted-profiles" },
    ],
  },
  {
    label: "Matches",
    items: [
      { label: "My Matches", href: "/user-info/my-matches" },
      { label: "Mutual Matches", href: "/user-info/mutual-matches" },
    ],
  },
  {
    label: "Messages",
    items: [
      { label: "Interests", href: "/user-info/interest-message" },
      { label: "Requests", href: "/user-info/photo-request" },
    ],
  },
  {
    label: "Activity",
    items: [
      { label: "Profile Views", href: "/my-home/views?tab=profiles-viewed-by-others" },
      { label: "Contact Views", href: "/my-home/views?tab=contacts-viewed-by-others" },
      { label: "Profiles Viewed By Me", href: "/my-home/views?tab=profiles-viewed-by-me" },
      { label: "Contacts Viewed By Me", href: "/my-home/views?tab=contacts-viewed-by-me" },
      { label: "Shortlisted Profiles", href: "/my-home/lists?section=shortlisted" },
      { label: "Blocked Profiles", href: "/my-home/lists?section=blocked" },
      { label: "Ignored Profiles", href: "/my-home/lists?section=ignored" },
    ],
  },
  {
    label: "Payment Plans",
    items: [
      { label: "Upgrade", href: "/membership-plans" },
      { label: "Other Payments", href: "/addons-packages" },
    ],
  },
];

export function DashboardHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const profile = useAuthStore((s) => s.profile);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <header className="bg-white border-b border-input sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/my-home" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-sm text-foreground leading-tight">
                Anugraha Matrimony
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((nav) => (
              <div
                key={nav.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(nav.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors",
                    openDropdown === nav.label
                      ? "text-primary bg-accent"
                      : "text-foreground hover:text-primary hover:bg-accent"
                  )}
                >
                  {nav.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {openDropdown === nav.label && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-input rounded-lg shadow-lg py-1 z-50">
                    {nav.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                        onClick={() => setOpenDropdown(null)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors hidden sm:block"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors relative"
              aria-label="Notifications"
              onClick={() => setNotifOpen(true)}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <button
              className="p-2 hover:bg-muted rounded-lg transition-colors hidden sm:block"
              aria-label="Support"
            >
              <Headphones className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                aria-label="Profile menu"
              >
                <User className="h-5 w-5 text-primary" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-input rounded-lg shadow-lg py-1 z-50">
                  {profile && (
                    <div className="px-4 py-2 border-b border-input">
                      <p className="text-sm font-medium truncate">
                        {profile.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.anugraha_id}
                      </p>
                    </div>
                  )}
                  <Link
                    href="/my-home/view-and-edit/primary-info"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <User className="h-4 w-4" /> View Profile
                  </Link>
                  <Link
                    href="/my-home/profile-settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors w-full text-left"
                    onClick={() => setProfileOpen(false)}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-input bg-white max-h-[70vh] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((nav) => (
              <details key={nav.label} className="group">
                <summary className="flex items-center justify-between py-2.5 text-sm font-medium cursor-pointer list-none">
                  {nav.label}
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pl-4 pb-2 space-y-1">
                  {nav.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
      <NotificationsPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
}
