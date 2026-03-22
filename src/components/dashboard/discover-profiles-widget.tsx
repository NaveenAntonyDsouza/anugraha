import Link from "next/link";
import {
  Globe,
  Church,
  MapPin,
  Cross,
  Briefcase,
  Building2,
  Languages,
  Heart,
  Users,
  BookOpen,
  Star,
  Landmark,
  Gem,
} from "lucide-react";

const CATEGORIES = [
  { label: "NRI Matrimony", href: "/my-home/search/discover-profiles/nri-matrimony", icon: Globe },
  { label: "Catholic Matrimony", href: "/my-home/search/discover-profiles/catholic-matrimony", icon: Church },
  { label: "Karnataka Matrimony", href: "/my-home/search/discover-profiles/karnataka-matrimony", icon: MapPin },
  { label: "Christian Matrimony", href: "/my-home/search/discover-profiles/christian-matrimony", icon: Cross },
  { label: "Occupation Matrimony", href: "/my-home/search/discover-profiles/occupation-matrimony", icon: Briefcase },
  { label: "Diocese Matrimony", href: "/my-home/search/discover-profiles/diocese-matrimony", icon: Building2 },
  { label: "Kannadiga Matrimony", href: "/my-home/search/discover-profiles/kannadiga-matrimony", icon: Languages },
  { label: "Second Marriage", href: "/my-home/search/discover-profiles/second-marriage-matrimony", icon: Heart },
  { label: "Mother Tongue", href: "/my-home/search/discover-profiles/mother-tongue-matrimony", icon: BookOpen },
  { label: "Community Matrimony", href: "/my-home/search/discover-profiles/community-matrimony", icon: Users },
  { label: "Hindu Matrimony", href: "/my-home/search/discover-profiles/hindu-matrimony", icon: Star },
  { label: "Muslim Matrimony", href: "/my-home/search/discover-profiles/muslim-matrimony", icon: Landmark },
  { label: "Jain Matrimony", href: "/my-home/search/discover-profiles/jain-matrimony", icon: Gem },
];

export function DiscoverProfilesWidget() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">Discover Profiles</h2>
        <Link
          href="/my-home/search/discover-profiles"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          See All →
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {CATEGORIES.slice(0, 8).map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border border-input hover:border-primary/30 hover:shadow-sm transition-all text-center"
          >
            <cat.icon className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium text-foreground">{cat.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
