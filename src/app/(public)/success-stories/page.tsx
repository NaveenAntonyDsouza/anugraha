"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SuccessStoryCard } from "@/components/public/success-story-card";
import { SubmitStoryModal } from "@/components/public/submit-story-modal";
import { Button } from "@/components/ui/button";
import { PenLine } from "lucide-react";

interface Story {
  id: string;
  couple_names: string;
  story: string;
  wedding_date: string | null;
  photo_url: string | null;
  location: string | null;
}

const PLACEHOLDER_STORIES: Story[] = [
  {
    id: "p1",
    couple_names: "Rahul & Priya",
    story:
      "We found each other on Anugraha Matrimony and knew instantly that we were meant to be. Our families connected beautifully and we got married within six months of our first conversation.",
    wedding_date: "2025-03-15",
    photo_url: null,
    location: "Bengaluru",
  },
  {
    id: "p2",
    couple_names: "Arun & Meera",
    story:
      "After searching for the right partner for over a year, Anugraha Matrimony matched us perfectly. Our shared values and interests made everything click right from the start.",
    wedding_date: "2024-11-20",
    photo_url: null,
    location: "Mysuru",
  },
  {
    id: "p3",
    couple_names: "Naveen & Shruti",
    story:
      "The dedicated personal adviser at Anugraha Matrimony helped us navigate every step. We are grateful for this platform that brought our families together.",
    wedding_date: "2025-01-10",
    photo_url: null,
    location: "Hubli",
  },
];

export default function SuccessStoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchStories();
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  }

  async function fetchStories() {
    const { data, error } = await supabase
      .from("testimonials")
      .select("id, couple_names, story, wedding_date, photo_url, location")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      setStories(PLACEHOLDER_STORIES);
    } else {
      setStories(data);
    }
    setLoading(false);
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Our Success Stories
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Thousands of couples found their life partners through Anugraha
            Matrimony
          </p>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <SuccessStoryCard key={story.id} story={story} />
            ))}
          </div>
        )}

        {/* Submit Story CTA */}
        {isLoggedIn && (
          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => setShowSubmit(true)}
              className="gap-2"
            >
              <PenLine className="h-4 w-4" />
              Share Your Success Story
            </Button>
          </div>
        )}
      </section>

      <SubmitStoryModal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
      />
    </div>
  );
}
