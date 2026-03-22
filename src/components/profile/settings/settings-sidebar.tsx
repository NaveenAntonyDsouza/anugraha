"use client";

import { Filter, Bell, Eye, EyeOff, UserX, Lock, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    heading: "Profile Management",
    items: [
      { key: "profile-filters", label: "Profile Filters", icon: Filter },
      { key: "manage-alerts", label: "Manage Alert", icon: Bell },
      { key: "search-visibility", label: "Search Visibility", icon: Eye },
      { key: "hide-profile", label: "Hide Profile", icon: EyeOff },
      { key: "delete-profile", label: "Delete Profile", icon: UserX },
    ],
  },
  {
    heading: "Account Management",
    items: [
      { key: "change-password", label: "Change Password", icon: Lock },
      { key: "logout", label: "Logout", icon: LogOut },
    ],
  },
] as const;

export type SettingsSection = (typeof SECTIONS)[number]["items"][number]["key"];

interface SettingsSidebarProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

export function SettingsSidebar({ active, onChange }: SettingsSidebarProps) {
  return (
    <aside className="w-full lg:w-[220px] flex-shrink-0">
      <div className="bg-white rounded-lg border border-input sticky top-20">
        {SECTIONS.map((group) => (
          <div key={group.heading}>
            <p className="px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.heading}
            </p>
            <nav className="pb-2">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onChange(item.key)}
                  className={cn(
                    "flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors",
                    active === item.key
                      ? "text-primary bg-primary/5 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
