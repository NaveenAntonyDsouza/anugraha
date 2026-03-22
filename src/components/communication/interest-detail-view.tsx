"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import {
  type InterestMessage,
  type InterestReply,
  getStatusDisplay,
  formatInterestDate,
  formatDateShort,
} from "@/lib/interest-messages";
import { MessageBubble } from "./message-bubble";
import { ContactDetailsPanel } from "./contact-details-panel";
import { ReplyModal } from "./reply-modal";
import { CancelConfirmModal, TrashConfirmModal } from "./cancel-confirm-modal";
import { PremiumUpgradePopup } from "./premium-upgrade-popup";

interface InterestDetailViewProps {
  anugrahaId: string;
}

const PROFILE_SELECT =
  "id, anugraha_id, full_name, age, gender, height_cm, education_level, is_active, last_login_at, profile_photos(photo_url, is_primary)";

export function InterestDetailView({ anugrahaId }: InterestDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);

  const [interest, setInterest] = useState<InterestMessage | null>(null);
  const [replies, setReplies] = useState<InterestReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [contactInfo, setContactInfo] = useState<Record<string, unknown> | null>(null);

  // Modals
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  const myProfileId = profile?.id;
  const filterParam = searchParams.get("filter") ?? "";
  const tabParam = searchParams.get("tab") ?? "all";

  // Fetch the interest
  const fetchInterest = useCallback(async () => {
    if (!myProfileId) return;
    setLoading(true);

    try {
      // First find the other profile by anugraha_id
      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("anugraha_id", anugrahaId)
        .single();

      if (!otherProfile) {
        toast.error("Profile not found");
        router.push("/user-info/interest-message");
        return;
      }

      // Find the interest between me and this profile
      const { data: interestData } = await supabase
        .from("interest_messages")
        .select(`*, sender:profiles!sender_id(${PROFILE_SELECT}), receiver:profiles!receiver_id(${PROFILE_SELECT})`)
        .or(`and(sender_id.eq.${myProfileId},receiver_id.eq.${otherProfile.id}),and(sender_id.eq.${otherProfile.id},receiver_id.eq.${myProfileId})`)
        .order("sent_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!interestData) {
        toast.error("Interest message not found");
        router.push("/user-info/interest-message");
        return;
      }

      setInterest(interestData as unknown as InterestMessage);

      // Mark as read
      if (!interestData.is_read) {
        await supabase
          .from("interest_messages")
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq("id", interestData.id);
      }

      // Load replies
      const { data: replyData } = await supabase
        .from("interest_replies")
        .select("*")
        .eq("interest_id", interestData.id)
        .order("sent_at", { ascending: true });

      setReplies((replyData ?? []) as InterestReply[]);

      // Check premium
      const { data: membership } = await supabase
        .from("user_memberships")
        .select("plan_name")
        .eq("user_id", profile?.user_id ?? "")
        .gt("expires_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();

      setIsPremium(!!membership);

      // Load contact info if premium and status is accepted
      if (membership && (interestData.status === "accepted")) {
        const otherProfileId = interestData.sender_id === myProfileId
          ? interestData.receiver_id
          : interestData.sender_id;

        const { data: contact } = await supabase
          .from("profile_contact_info")
          .select("mobile_number, whatsapp_number, email, custodian_name, custodian_mobile")
          .eq("profile_id", otherProfileId)
          .maybeSingle();

        setContactInfo(contact);
      }
    } catch {
      toast.error("Failed to load interest details");
    } finally {
      setLoading(false);
    }
  }, [myProfileId, anugrahaId, supabase, router, profile?.user_id]);

  useEffect(() => {
    fetchInterest();
  }, [fetchInterest]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowReplyModal(false);
        setShowCancelModal(false);
        setShowTrashModal(false);
        setShowPremiumPopup(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  if (loading || !interest || !myProfileId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const myRole = interest.sender_id === myProfileId ? "sender" : "receiver";
  const otherProfile = myRole === "sender" ? interest.receiver : interest.sender;
  const statusDisplay = getStatusDisplay(interest.status, myRole);
  const starred = myRole === "sender" ? interest.is_starred_by_sender : interest.is_starred_by_receiver;
  const otherPhoto = otherProfile.profile_photos?.find((p) => p.is_primary)?.photo_url
    ?? otherProfile.profile_photos?.[0]?.photo_url;

  // Context-dependent actions
  const canAcceptDecline = myRole === "receiver" && interest.status === "sent";
  const canReply = myRole === "sender" && interest.status === "accepted";
  const canCancel = myRole === "sender" && interest.can_cancel;
  const canResend =
    (interest.status === "expired" || interest.status === "declined") &&
    (!interest.can_resend_after || new Date(interest.can_resend_after) < new Date());

  // Star toggle
  async function handleStarToggle() {
    const field = myRole === "sender" ? "is_starred_by_sender" : "is_starred_by_receiver";
    const { error } = await supabase
      .from("interest_messages")
      .update({ [field]: !starred })
      .eq("id", interest!.id);

    if (!error) {
      setInterest((prev) => prev ? { ...prev, [field]: !starred } : prev);
      toast.success(starred ? "Unstarred" : "Starred");
    }
  }

  // Trash
  async function handleTrash() {
    const field = myRole === "sender" ? "is_deleted_by_sender" : "is_deleted_by_receiver";
    await supabase
      .from("interest_messages")
      .update({ [field]: true })
      .eq("id", interest!.id);
    toast.success("You have successfully trashed the message");
    router.push(`/user-info/interest-message?tab=${tabParam}`);
  }

  // Cancel interest
  async function handleCancel() {
    await supabase
      .from("interest_messages")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", interest!.id);

    // Refund daily quota
    await supabase.rpc("refund_interest_count", {
      p_user_id: myProfileId,
    });

    toast.success("Interest message cancelled successfully.");
    router.push(`/user-info/interest-message?tab=${tabParam}`);
  }

  // Accept
  async function handleAccept(templateId: string, customMessage: string | null) {
    await supabase
      .from("interest_messages")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", interest!.id);

    const replyText = customMessage ?? (
      templateId === "reply_accept_1"
        ? "Thank you for your interest. We are also interested in your profile and would like to proceed."
        : "I am happy to accept your interest. Please feel free to contact me."
    );

    await supabase.from("interest_replies").insert({
      interest_id: interest!.id,
      sender_id: myProfileId,
      reply_type: customMessage ? "custom" : "template",
      reply_template_id: customMessage ? null : templateId,
      reply_text: replyText,
      is_premium_reply: !!customMessage,
    });

    toast.success("You have accepted the interest.");
    fetchInterest();
  }

  // Decline
  async function handleDecline(templateId: string, customMessage: string | null, isSilent: boolean) {
    await supabase
      .from("interest_messages")
      .update({ status: "declined", responded_at: new Date().toISOString() })
      .eq("id", interest!.id);

    if (!isSilent) {
      const replyText = customMessage ?? "Thank you for the interest, but I feel we may not be the right match. Wishing you the best in your search.";
      await supabase.from("interest_replies").insert({
        interest_id: interest!.id,
        sender_id: myProfileId,
        reply_type: customMessage ? "custom" : "template",
        reply_template_id: customMessage ? null : templateId,
        reply_text: replyText,
        is_premium_reply: !!customMessage,
      });
    }

    toast.success("Interest declined successfully.");
    router.push(`/user-info/interest-message?tab=${tabParam}`);
  }

  // Reply click handler
  function handleReplyClick() {
    if (!isPremium) {
      setShowPremiumPopup(true);
      return;
    }
    setShowReplyModal(true);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-4">
        <a href="/my-home" className="hover:text-foreground">My Home</a>
        <span className="mx-1">/</span>
        <a href={`/user-info/interest-message?tab=${tabParam}`} className="hover:text-foreground">
          Interest Messages
        </a>
        <span className="mx-1">/</span>
        <span className="text-foreground">{otherProfile.anugraha_id}</span>
      </nav>

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <Link href={`/user-info/interest-message?tab=${tabParam}${filterParam ? `&filter=${filterParam}` : ""}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowTrashModal(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleStarToggle}>
            <Star className={`h-4 w-4 ${starred ? "fill-yellow-400 text-yellow-400" : ""}`} />
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button variant="ghost" size="sm" disabled>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main thread area */}
        <div>
          {/* Profile card */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 shrink-0">
                {otherPhoto && <AvatarImage src={otherPhoto} alt={otherProfile.full_name} />}
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {otherProfile.full_name?.charAt(0) ?? "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{otherProfile.full_name}</h2>
                  {!otherProfile.is_active && (
                    <Badge variant="destructive" className="text-xs">Unavailable</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                  <span>{otherProfile.anugraha_id}</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                  {otherProfile.age && <span>{otherProfile.age} yrs</span>}
                  {otherProfile.height_cm && <span>{otherProfile.height_cm} cm</span>}
                  {otherProfile.education_level && <span>{otherProfile.education_level}</span>}
                </div>
                {otherProfile.last_login_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Last login: {formatDateShort(otherProfile.last_login_at)}
                  </p>
                )}
              </div>

              <Link
                href={`/view-full-profile/${otherProfile.anugraha_id}`}
                className="text-xs text-primary hover:underline shrink-0"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* Unavailable notice */}
          {!otherProfile.is_active && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-700">
              This profile is no longer available
            </div>
          )}

          {/* Message thread */}
          <div className="space-y-6">
            {/* Original message */}
            <MessageBubble
              senderName={interest.sender.full_name}
              senderPhoto={
                interest.sender.profile_photos?.find((p) => p.is_primary)?.photo_url
                ?? interest.sender.profile_photos?.[0]?.photo_url
              }
              messageText={interest.message_text ?? ""}
              timestamp={interest.sent_at}
              status={interest.status}
              isMine={interest.sender_id === myProfileId}
              canCancel={canCancel}
              onCancel={() => setShowCancelModal(true)}
            />

            {/* Reply bubbles */}
            {replies.map((reply) => (
              <MessageBubble
                key={reply.id}
                senderName={
                  reply.sender_id === myProfileId
                    ? (profile?.full_name ?? "You")
                    : otherProfile.full_name
                }
                senderPhoto={
                  reply.sender_id === myProfileId ? null : otherPhoto
                }
                messageText={reply.reply_text ?? ""}
                timestamp={reply.sent_at}
                status={interest.status}
                isMine={reply.sender_id === myProfileId}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3 flex-wrap">
            {canAcceptDecline && otherProfile.is_active && (
              <>
                <Button onClick={() => setShowReplyModal(true)}>Accept</Button>
                <Button variant="outline" onClick={() => setShowReplyModal(true)}>Decline</Button>
              </>
            )}

            {canReply && otherProfile.is_active && (
              <Button onClick={handleReplyClick}>REPLY</Button>
            )}

            {canResend && otherProfile.is_active && (
              <Button variant="outline" onClick={() => router.push(`/view-full-profile/${otherProfile.anugraha_id}`)}>
                <RefreshCw className="h-4 w-4 mr-2" /> Re-send Interest
              </Button>
            )}
          </div>
        </div>

        {/* Right sidebar — contact panel */}
        <div className="space-y-4">
          {/* Status badge */}
          <div className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-sm font-medium" style={{ color: statusDisplay.color }}>
              {statusDisplay.label}
            </p>
          </div>

          {/* Contact details (premium only) */}
          {(interest.status === "accepted") && (
            <ContactDetailsPanel
              isPremium={isPremium}
              contactInfo={contactInfo as Record<string, string | null> | null}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ReplyModal
        open={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        profileId={otherProfile.anugraha_id}
        isPremium={isPremium}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />

      <CancelConfirmModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
      />

      <TrashConfirmModal
        open={showTrashModal}
        onClose={() => setShowTrashModal(false)}
        onConfirm={handleTrash}
        isPermanent={false}
      />

      <PremiumUpgradePopup
        open={showPremiumPopup}
        onClose={() => setShowPremiumPopup(false)}
        trigger="reply"
      />
    </div>
  );
}
