"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe, Cross, MapPin, Church, Briefcase, Heart,
  Users, Languages, UserCheck, Moon, Hand, Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchTabBar } from "@/components/search/search-tab-bar";
import { AdBanner } from "@/components/discover/ad-banner";

const CATEGORIES = [
  { label: "NRI Matrimony Site", href: "/my-home/search/discover-profiles/nri-matrimony", icon: Globe },
  { label: "Catholic Matrimony", href: "/my-home/search/discover-profiles/catholic-matrimony", icon: Cross },
  { label: "Karnataka Matrimony", href: "/my-home/search/discover-profiles/karnataka-matrimony", icon: MapPin },
  { label: "Christian Matrimony", href: "/my-home/search/discover-profiles/christian-matrimony", icon: Church },
  { label: "Occupation Matrimony", href: "/my-home/search/discover-profiles/occupation-matrimony", icon: Briefcase },
  { label: "Diocese Matrimony", href: "/my-home/search/discover-profiles/diocese-matrimony", icon: Compass },
  { label: "Kannadiga Matrimony", href: "/my-home/search/discover-profiles/kannadiga-matrimony", icon: Users },
  { label: "Second Marriage Matrimony", href: "/my-home/search/discover-profiles/second-marriage-matrimony", icon: Heart },
  { label: "Mother Tongue Matrimony", href: "/my-home/search/discover-profiles/mother-tongue-matrimony", icon: Languages },
  { label: "Community Matrimony", href: "/my-home/search/discover-profiles/community-matrimony", icon: UserCheck },
  { label: "Hindu Matrimony", href: "/my-home/search/discover-profiles/hindu-matrimony", icon: Users },
  { label: "Muslim Matrimony", href: "/my-home/search/discover-profiles/muslim-matrimony", icon: Moon },
  { label: "Jain Matrimony", href: "/my-home/search/discover-profiles/jain-matrimony", icon: Hand },
];

type Tab = "categories" | "saved";

export default function DiscoverProfilesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("categories");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Discover Profiles</span>
      </nav>

      <SearchTabBar />

      <div className="flex gap-6 mt-6">
        <div className="flex-1 min-w-0">
          {/* Internal Tabs */}
          <div className="flex border-b border-input mb-6">
            <button
              onClick={() => setActiveTab("categories")}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "categories"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Matrimony Category
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={cn(
                "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === "saved"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              Saved Lists
            </button>
          </div>

          {activeTab === "categories" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.href}
                  href={cat.href}
                  className="flex items-center gap-3 px-4 py-4 bg-white rounded-lg border border-input hover:border-primary/30 hover:bg-primary/5 transition-colors"
                >
                  <cat.icon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground">{cat.label}</span>
                </Link>
              ))}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="bg-white rounded-lg border border-input p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">No saved searches yet</p>
              <Link
                href="/my-home/search/saved-search"
                className="text-sm text-primary hover:underline"
              >
                View all saved searches
              </Link>
            </div>
          )}
        </div>

        <AdBanner />
      </div>
    </div>
  );
}
