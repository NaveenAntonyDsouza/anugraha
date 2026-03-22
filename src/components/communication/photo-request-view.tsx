"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Eye, Clock, CheckCircle, XCircle } from "lucide-react";

interface PhotoRequest {
  id: string;
  requester_id: string;
  profile_id: string;
  request_type: "view_request" | "upload_request";
  status: "pending" | "fulfilled" | "ignored";
  requested_at: string;
  fulfilled_at: string | null;
  requester?: {
    id: string;
    anugraha_id: string;
    age: number | null;
    profile_photos?: { photo_url: string; is_primary: boolean }[];
  };
  target?: {
    id: string;
    anugraha_id: string;
    age: number | null;
    profile_photos?: { photo_url: string; is_primary: boolean }[];
  };
}

export function PhotoRequestView() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const [tab, setTab] = useState<"received" | "sent">("received");
  const [requests, setRequests] = useState<PhotoRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const myProfileId = profile?.id;

  const fetchRequests = useCallback(async () => {
    if (!myProfileId) return;
    setLoading(true);

    try {
      if (tab === "received") {
        const { data, error } = await supabase
          .from("photo_requests")
          .select("*, requester:profiles!requester_id(id, anugraha_id, age, profile_photos(photo_url, is_primary))")
          .eq("profile_id", myProfileId)
          .order("requested_at", { ascending: false });

        if (error) throw error;
        setRequests((data ?? []) as unknown as PhotoRequest[]);
      } else {
        const { data, error } = await supabase
          .from("photo_requests")
          .select("*, target:profiles!profile_id(id, anugraha_id, age, profile_photos(photo_url, is_primary))")
          .eq("requester_id", myProfileId)
          .order("requested_at", { ascending: false });

        if (error) throw error;
        setRequests((data ?? []) as unknown as PhotoRequest[]);
      }
    } catch {
      toast.error("Failed to load photo requests");
    } finally {
      setLoading(false);
    }
  }, [myProfileId, tab, supabase]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function handleAllowAccess(requestId: string) {
    const { error } = await supabase
      .from("photo_requests")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to grant access");
      return;
    }
    toast.success("Photo access granted");
    fetchRequests();
  }

  async function handleIgnore(requestId: string) {
    const { error } = await supabase
      .from("photo_requests")
      .update({ status: "ignored" })
      .eq("id", requestId);

    if (error) {
      toast.error("Failed to ignore request");
      return;
    }
    toast.success("Request ignored");
    fetchRequests();
  }

  function getTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending": return <Badge variant="outline" className="text-amber-600 border-amber-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "fulfilled": return <Badge variant="outline" className="text-green-600 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Fulfilled</Badge>;
      case "ignored": return <Badge variant="outline" className="text-muted-foreground"><XCircle className="h-3 w-3 mr-1" />Ignored</Badge>;
      default: return null;
    }
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <a href="/my-home" className="hover:text-foreground">My Home</a>
        <span className="mx-1">/</span>
        <span className="text-foreground">Photo Requests</span>
      </nav>

      <h1 className="text-xl font-semibold mb-4">Photo Requests</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-6">
        <button
          onClick={() => setTab("received")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "received"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Received
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === "sent"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Sent
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Camera className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {tab === "received"
              ? "No photo requests received yet"
              : "You haven't sent any photo requests yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const otherProfile = tab === "received" ? req.requester : req.target;
            const photo = otherProfile?.profile_photos?.find((p) => p.is_primary)?.photo_url
              ?? otherProfile?.profile_photos?.[0]?.photo_url;

            return (
              <div key={req.id} className="border rounded-lg p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12 shrink-0">
                  {photo && <AvatarImage src={photo} alt={otherProfile?.anugraha_id ?? ""} />}
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {otherProfile?.anugraha_id?.charAt(2) ?? "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{otherProfile?.anugraha_id}</span>
                    <Badge variant="secondary" className="text-xs">
                      {req.request_type === "view_request" ? (
                        <><Eye className="h-3 w-3 mr-1" />View Request</>
                      ) : (
                        <><Upload className="h-3 w-3 mr-1" />Upload Request</>
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {otherProfile?.age && (
                      <span className="text-xs text-muted-foreground">{otherProfile.age} yrs</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(req.requested_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {tab === "received" && req.status === "pending" ? (
                    <>
                      {req.request_type === "view_request" ? (
                        <Button size="sm" onClick={() => handleAllowAccess(req.id)}>
                          Allow Access
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => router.push("/my-home/view-and-edit/manage-photos")}
                        >
                          Upload Photo Now
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleIgnore(req.id)}
                      >
                        Ignore
                      </Button>
                    </>
                  ) : (
                    getStatusBadge(req.status)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
