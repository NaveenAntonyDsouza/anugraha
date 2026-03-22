"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProfileCard, type ProfileCardData } from "./profile-card";

interface ProfileCarouselRowProps {
  title: string;
  seeAllHref: string;
  profiles: ProfileCardData[];
  emptyText?: string;
}

export function ProfileCarouselRow({
  title,
  seeAllHref,
  profiles,
  emptyText = "No profiles found.",
}: ProfileCarouselRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.6;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Link
          href={seeAllHref}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          See All →
        </Link>
      </div>

      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center bg-white rounded-lg border border-input">
          {emptyText}
        </p>
      ) : (
        <div className="relative group">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-input shadow-sm hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {profiles.map((p) => (
              <div key={p.id} className="flex-shrink-0 w-[200px] sm:w-[220px]">
                <ProfileCard profile={p} />
              </div>
            ))}
          </div>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white border border-input shadow-sm hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
