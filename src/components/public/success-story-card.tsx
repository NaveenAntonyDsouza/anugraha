"use client";

import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";
import { useState } from "react";

interface SuccessStory {
  id: string;
  couple_names: string;
  story: string;
  wedding_date: string | null;
  photo_url: string | null;
  location: string | null;
}

export function SuccessStoryCard({ story }: { story: SuccessStory }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = story.story.length > 150;
  const displayText =
    !expanded && isLong ? story.story.slice(0, 150) + "..." : story.story;

  return (
    <div className="border rounded-xl overflow-hidden bg-background">
      {/* Photo */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
        {story.photo_url ? (
          <Image
            src={story.photo_url}
            alt={story.couple_names}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="text-4xl">💑</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-base mb-1">{story.couple_names}</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
          {story.wedding_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(story.wedding_date).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {story.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {story.location}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {displayText}
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-primary font-medium mt-1 hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>
    </div>
  );
}
