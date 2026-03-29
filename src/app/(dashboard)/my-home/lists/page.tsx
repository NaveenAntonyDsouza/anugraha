"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  UserX,
  EyeOff,
  Trash2,
  MoreVertical,
  MessageSquare,
  Send,
  Shield,
  Clock,
  Undo2,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

type ListSection = "shortlisted" | "blocked" | "ignored";

interface ListProfile {
  id: string;
  profile_id: string;
  target_profile_id: string;
  created_at: string;
  target: {
    id: string;
    anugraha_id: string;
    full_name: string;
    age: number;
    photo_url?: string | null;
  } | null;
}

interface ShortlistComment {
  id: string;
  comment_text: string;
  commented_at: string;
}

export default function ListsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <ListsContent />
    </Suspense>
  );
}

function ListsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const authLoading = useAuthStore((s) => s.isLoading);

  const activeSection = (searchParams.get("section") as ListSection) || "shortlisted";
  const [items, setItems] = useState<ListProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ shortlisted: 0, blocked: 0, ignored: 0 });

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [commentTarget, setCommentTarget] = useState<{ id: string; anugrahaId: string } | null>(null);
  const [comments, setComments] = useState<ShortlistComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [unignoreTarget, setUnignoreTarget] = useState<string | null>(null);

  const loadCounts = useCallback(async () => {
    if (!profile) { if (!authLoading) setLoading(false); return; }
    const [s, b, i] = await Promise.all([
      supabase.from("shortlists").select("*", { count: "exact", head: true }).eq("profile_id", profile.id),
      supabase.from("blocked_profiles").select("*", { count: "exact", head: true }).eq("profile_id", profile.id),
      supabase.from("ignored_profiles").select("*", { count: "exact", head: true }).eq("profile_id", profile.id),
    ]);
    setCounts({
      shortlisted: s.count ?? 0,
      blocked: b.count ?? 0,
      ignored: i.count ?? 0,
    });
  }, [profile, authLoading, supabase]);

  const loadItems = useCallback(async () => {
    if (!profile) { if (!authLoading) setLoading(false); return; }
    setLoading(true);

    const table = activeSection === "shortlisted" ? "shortlists" : activeSection === "blocked" ? "blocked_profiles" : "ignored_profiles";
    const targetCol = activeSection === "shortlisted" ? "shortlisted_profile_id" : activeSection === "blocked" ? "blocked_profile_id" : "ignored_profile_id";

    const { data } = await supabase
      .from(table)
      .select("*")
      .eq("profile_id", profile.id)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      const targetIds = data.map((d: Record<string, unknown>) => d[targetCol] as string);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, anugraha_id, full_name, age")
        .in("id", targetIds);

      const { data: photos } = await supabase
        .from("profile_photos")
        .select("profile_id, photo_url")
        .in("profile_id", targetIds)
        .eq("photo_type", "profile")
        .eq("is_visible", true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const photoMap = new Map((photos ?? []).map((p: any) => [p.profile_id, p.photo_url]));

      const mapped: ListProfile[] = data.map((d: Record<string, unknown>) => {
        const tid = d[targetCol] as string;
        const prof = profileMap.get(tid);
        return {
          id: d.id as string,
          profile_id: d.profile_id as string,
          target_profile_id: tid,
          created_at: d.created_at as string,
          target: prof ? { ...prof, photo_url: photoMap.get(tid) ?? null } : null,
        };
      });
      setItems(mapped);
    } else {
      setItems([]);
    }
    setLoading(false);
  }, [profile, authLoading, activeSection, supabase]);

  useEffect(() => { loadCounts(); }, [loadCounts]);
  useEffect(() => { loadItems(); }, [loadItems]);

  function switchSection(section: ListSection) {
    router.push(`/my-home/lists?section=${section}`);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const table = activeSection === "shortlisted" ? "shortlists" : activeSection === "blocked" ? "blocked_profiles" : "ignored_profiles";
    await supabase.from(table).delete().eq("id", deleteTarget);
    setItems((prev) => prev.filter((i) => i.id !== deleteTarget));
    setCounts((prev) => ({ ...prev, [activeSection]: prev[activeSection] - 1 }));
    setDeleteTarget(null);
    setDeleting(false);
    toast.success("Profile removed successfully.");
  }

  async function handleUnignore() {
    if (!unignoreTarget) return;
    setDeleting(true);
    await supabase.from("ignored_profiles").delete().eq("id", unignoreTarget);
    setItems((prev) => prev.filter((i) => i.id !== unignoreTarget));
    setCounts((prev) => ({ ...prev, ignored: prev.ignored - 1 }));
    setUnignoreTarget(null);
    setDeleting(false);
    toast.success("You have successfully removed from ignored list.");
  }

  async function loadComments(shortlistId: string) {
    const { data } = await supabase
      .from("shortlist_comments")
      .select("*")
      .eq("shortlist_id", shortlistId)
      .order("commented_at", { ascending: false });
    setComments((data as ShortlistComment[]) ?? []);
  }

  async function submitComment() {
    if (!commentTarget || !profile) return;
    setSubmittingComment(true);
    await supabase.from("shortlist_comments").insert({
      shortlist_id: commentTarget.id,
      commenter_id: profile.id,
      comment_text: newComment,
    });
    setNewComment("");
    await loadComments(commentTarget.id);
    setSubmittingComment(false);
  }

  const SIDEBAR_ITEMS: { key: ListSection; label: string; icon: typeof Heart }[] = [
    { key: "shortlisted", label: "Shortlisted Profiles", icon: Heart },
    { key: "blocked", label: "Blocked Profiles", icon: UserX },
    { key: "ignored", label: "Ignored Profiles", icon: EyeOff },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href="/my-home" className="hover:text-primary">My Home</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">
          {SIDEBAR_ITEMS.find((s) => s.key === activeSection)?.label}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-[220px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-input sticky top-20">
            <nav className="py-2">
              {SIDEBAR_ITEMS.map((item) => (
                <button
                  key={item.key}
                  onClick={() => switchSection(item.key)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors",
                    activeSection === item.key
                      ? "text-primary bg-primary/5 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-xs font-medium">
                    {String(counts[item.key]).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-lg border border-input p-8 text-center">
              <EyeOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Sorry! No Profile List Found.
              </p>
              <p className="text-xs text-muted-foreground">
                Currently, there are no profiles in this section.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const t = item.target;
                if (!t) return null;
                return (
                  <div key={item.id} className="bg-white rounded-lg border border-input p-4 flex items-start gap-4">
                    <Link href={`/view-full-profile/${t.anugraha_id}`}>
                      <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {t.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.photo_url} alt={t.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">{t.full_name?.charAt(0) ?? "?"}</span>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/view-full-profile/${t.anugraha_id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                        {t.full_name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.anugraha_id} · {t.age} yrs</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {activeSection === "shortlisted" ? "Shortlisted Date" : activeSection === "ignored" ? "Ignored Date" : "Blocked Date"}: {format(new Date(item.created_at), "dd MMM yyyy")}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {activeSection === "shortlisted" && (
                        <>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Send interest">
                            <Send className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            aria-label="Comments"
                            onClick={() => { setCommentTarget({ id: item.id, anugrahaId: t.anugraha_id }); loadComments(item.id); }}
                          >
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <div className="relative">
                            <button
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                              onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                              aria-label="More options"
                            >
                              <MoreVertical className="h-4 w-4 text-muted-foreground" />
                            </button>
                            {openMenu === item.id && (
                              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-input rounded-lg shadow-lg py-1 z-20">
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setOpenMenu(null)}>
                                  <Clock className="h-3.5 w-3.5" /> Contact History
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setOpenMenu(null)}>
                                  <Send className="h-3.5 w-3.5" /> Forward Profile
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setOpenMenu(null)}>
                                  <UserX className="h-3.5 w-3.5" /> Block Profile
                                </button>
                                <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setOpenMenu(null)}>
                                  <Shield className="h-3.5 w-3.5" /> Report Misuse
                                </button>
                                <hr className="border-input my-1" />
                                <button
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                                  onClick={() => { setDeleteTarget(item.id); setOpenMenu(null); }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </>
                      )}

                      {activeSection === "blocked" && (
                        <div className="relative">
                          <button
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                            onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                            aria-label="More options"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </button>
                          {openMenu === item.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-input rounded-lg shadow-lg py-1 z-20">
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                                onClick={() => { setDeleteTarget(item.id); setOpenMenu(null); }}
                              >
                                <Undo2 className="h-3.5 w-3.5" /> Unblock
                              </button>
                              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted transition-colors" onClick={() => setOpenMenu(null)}>
                                <Shield className="h-3.5 w-3.5" /> Report Misuse
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {activeSection === "ignored" && (
                        <>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Unignore" onClick={() => setUnignoreTarget(item.id)}>
                            <Undo2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Block">
                            <UserX className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Contact History">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Report">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-sm text-center font-medium">
              Are you sure, you wish to delete this profile?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="h-10 px-6 border border-input rounded-lg text-sm font-semibold hover:bg-muted/50 transition-colors">
                NO
              </button>
              <button onClick={handleDelete} disabled={deleting} className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                YES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unignore Confirmation Modal */}
      {unignoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 space-y-4">
            <p className="text-sm text-center font-medium">
              Are you sure, you wish to remove this profile from ignored list?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setUnignoreTarget(null)} disabled={deleting} className="h-10 px-6 border border-input rounded-lg text-sm font-semibold hover:bg-muted/50 transition-colors">
                NO
              </button>
              <button onClick={handleUnignore} disabled={deleting} className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                YES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortlist Comments Modal */}
      {commentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Shortlist comments on {commentTarget.anugrahaId}
              </h3>
              <button onClick={() => setCommentTarget(null)} className="p-1 hover:bg-muted rounded transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm min-h-[80px]"
                placeholder="Write comments"
              />
              <button
                onClick={submitComment}
                disabled={submittingComment}
                className="mt-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submittingComment && <Loader2 className="h-4 w-4 animate-spin" />}
                SUBMIT
              </button>
            </div>

            {comments.length > 0 && (
              <div className="border-t border-input pt-3 space-y-3 max-h-60 overflow-y-auto">
                <p className="text-xs font-semibold text-foreground">Comments</p>
                {comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-muted-foreground">C</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Commented By Candidate</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(c.commented_at), "dd MMM yyyy, hh:mm a")}
                      </p>
                      <p className="text-sm text-foreground mt-1">{c.comment_text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
