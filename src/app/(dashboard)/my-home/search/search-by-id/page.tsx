"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { SearchTabBar } from "@/components/search/search-tab-bar";

export default function SearchByIdPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchByIdContent />
    </Suspense>
  );
}

interface FoundProfile {
  id: string;
  anugraha_id: string;
  full_name: string;
  age: number;
  gender: string;
  photo_url: string | null;
  denomination: string | null;
  education_level: string | null;
  occupation_category: string | null;
  working_state: string | null;
  marital_status: string | null;
}

function SearchByIdContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const [inputId, setInputId] = useState(searchParams.get("id") ?? "");
  const [result, setResult] = useState<FoundProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [sendingInterest, setSendingInterest] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

  async function handleSearch() {
    const id = inputId.trim().toUpperCase();
    if (!id) return;

    // Validate format: AM followed by digits
    if (!id.match(/^AM\d+$/)) {
      toast.error("Invalid Anugraha ID format. Must start with AM followed by digits.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setNotFound(false);
    setResult(null);

    const { data } = await supabase
      .from("profiles")
      .select("id, anugraha_id, full_name, age, gender")
      .eq("anugraha_id", id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .single();

    if (!data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // Fetch additional info
    const [primaryRes, religiousRes, educRes, photoRes] = await Promise.all([
      supabase.from("profile_primary_info").select("marital_status").eq("profile_id", data.id).single(),
      supabase.from("profile_religious_info").select("denomination").eq("profile_id", data.id).single(),
      supabase.from("profile_education_profession").select("education_level, occupation_category, working_state").eq("profile_id", data.id).single(),
      supabase.from("profile_photos").select("photo_url").eq("profile_id", data.id).eq("photo_type", "profile").eq("is_visible", true).single(),
    ]);

    setResult({
      ...data,
      photo_url: photoRes.data?.photo_url ?? null,
      denomination: religiousRes.data?.denomination ?? null,
      education_level: educRes.data?.education_level ?? null,
      occupation_category: educRes.data?.occupation_category ?? null,
      working_state: educRes.data?.working_state ?? null,
      marital_status: primaryRes.data?.marital_status ?? null,
    });
    setLoading(false);
  }

  async function handleSendInterest() {
    if (!profile || !result) return;
    setSendingInterest(true);
    const { error } = await supabase.from("interest_messages").insert({
      sender_id: profile.id,
      receiver_id: result.id,
      message: "I am interested in your profile.",
      message_type: "template",
      message_template_id: "msg_interested",
      status: "sent",
    });
    if (error) {
      toast.error(error.code === "23505" ? "Interest already sent." : "Failed to send interest.");
    } else {
      toast.success("Interest sent successfully!");
    }
    setSendingInterest(false);
  }

  async function handleShortlist() {
    if (!profile || !result) return;
    if (shortlisted) {
      await supabase.from("shortlists").delete().eq("profile_id", profile.id).eq("shortlisted_profile_id", result.id);
      setShortlisted(false);
      toast.success("Removed from shortlist.");
    } else {
      await supabase.from("shortlists").insert({ profile_id: profile.id, shortlisted_profile_id: result.id });
      setShortlisted(true);
      toast.success("Added to shortlist.");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">Search by ID</span>
      </nav>

      <SearchTabBar />

      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white rounded-lg border border-input p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Search by Anugraha ID</h2>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value.toUpperCase())}
              placeholder="e.g. AM100123"
              className="flex-1 h-10 border border-input rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !inputId.trim()}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "SEARCH"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-2">
            Enter the Anugraha ID (starts with AM) to find a specific profile
          </p>
        </div>

        {/* Result */}
        {searched && !loading && (
          <div className="mt-6">
            {notFound ? (
              <div className="bg-white rounded-lg border border-input p-8 text-center">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  No profile found with ID &ldquo;{inputId.trim().toUpperCase()}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground">Check the ID and try again</p>
              </div>
            ) : result ? (
              <div className="bg-white rounded-lg border border-input overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {/* Photo */}
                  <div className="sm:w-[200px] bg-muted flex-shrink-0">
                    {result.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.photo_url}
                        alt={result.full_name}
                        className="h-full w-full object-cover min-h-[200px]"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center min-h-[200px]">
                        <span className="text-5xl font-bold text-muted-foreground/40">
                          {result.full_name?.charAt(0) ?? "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4 flex-1">
                    <h3 className="text-base font-semibold text-foreground">{result.full_name}</h3>
                    <p className="text-sm text-primary font-medium">{result.anugraha_id}</p>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                      <p>{result.age} years old · {result.gender}</p>
                      {result.marital_status && <p>{result.marital_status}</p>}
                      {result.denomination && <p>{result.denomination}</p>}
                      {result.education_level && <p>{result.education_level}</p>}
                      {result.occupation_category && <p>{result.occupation_category}</p>}
                      {result.working_state && <p>{result.working_state}</p>}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Link
                        href={`/view-full-profile/${result.anugraha_id}`}
                        className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors inline-flex items-center"
                      >
                        View Full Profile
                      </Link>
                      <button
                        onClick={handleSendInterest}
                        disabled={sendingInterest}
                        className="h-9 px-3 border border-input rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {sendingInterest ? "..." : "Send Interest"}
                      </button>
                      <button
                        onClick={handleShortlist}
                        className="h-9 w-9 flex items-center justify-center border border-input rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <Heart className={`h-4 w-4 ${shortlisted ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
