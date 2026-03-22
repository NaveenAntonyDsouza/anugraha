import { createClient } from "@/lib/supabase/client";

// ─── Types ──────────────────────────────────────────────────────────
export type InterestStatus = "sent" | "accepted" | "declined" | "cancelled" | "expired";

export type TabId = "all" | "received" | "sent" | "starred" | "trash";

export type FilterId =
  | "interest_received"
  | "interest_sent"
  | "i_accepted"
  | "accepted_me"
  | "i_declined"
  | "declined_me"
  | "expired_interests";

export interface InterestMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_type: "template" | "custom";
  message_template_id: string | null;
  message_text: string | null;
  status: InterestStatus;
  is_starred_by_sender: boolean;
  is_starred_by_receiver: boolean;
  is_read: boolean;
  is_deleted_by_sender: boolean;
  is_deleted_by_receiver: boolean;
  sent_at: string;
  read_at: string | null;
  responded_at: string | null;
  cancelled_at: string | null;
  expires_at: string;
  can_cancel: boolean;
  can_resend_after: string | null;
  sender: InterestProfile;
  receiver: InterestProfile;
}

export interface InterestProfile {
  id: string;
  anugraha_id: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  height_cm: number | null;
  education_level: string | null;
  is_active: boolean;
  last_login_at: string | null;
  profile_photos?: { photo_url: string; is_primary: boolean }[];
}

export interface InterestReply {
  id: string;
  interest_id: string;
  sender_id: string;
  reply_type: "template" | "custom";
  reply_template_id: string | null;
  reply_text: string | null;
  is_premium_reply: boolean;
  sent_at: string;
}

// ─── Message Templates ─────────────────────────────────────────────
export const MESSAGE_TEMPLATES = [
  {
    id: "msg_suitable",
    label: "We find your profile suitable",
    text: "We find your profile suitable and would like to take this further. If you feel the same, kindly accept or share your thoughts.",
    isPremium: false,
  },
  {
    id: "msg_parents_like",
    label: "My family and I like your profile",
    text: "My family and I like your profile and wish to hear from you. We look forward to your response, even if you feel we may not be the right match.",
    isPremium: false,
  },
  {
    id: "msg_compatible",
    label: "Our profiles appear compatible",
    text: "Our profiles appear compatible. Please respond with your opinion so we may proceed accordingly.",
    isPremium: false,
  },
  {
    id: "msg_children_align",
    label: "Our children's profiles align",
    text: "Our children's profiles seem to align well; Kindly let us know your interest to take the discussion forward.",
    isPremium: false,
  },
  {
    id: "msg_personal",
    label: "Send a personal message",
    text: "Express your interest by sharing a personal message.",
    isPremium: true,
  },
] as const;

export const REPLY_ACCEPT_TEMPLATES = [
  {
    id: "reply_accept_1",
    text: "Thank you for your interest. We are also interested in your profile and would like to proceed.",
    isPremium: false,
  },
  {
    id: "reply_accept_2",
    text: "I am happy to accept your interest. Please feel free to contact me.",
    isPremium: false,
  },
  {
    id: "reply_personal",
    text: "Accept and send a personal reply.",
    isPremium: true,
  },
] as const;

export const REPLY_DECLINE_TEMPLATES = [
  {
    id: "decline_standard",
    text: "Thank you for the interest, but I feel we may not be the right match. Wishing you the best in your search.",
    isPremium: false,
    isSilent: false,
  },
  {
    id: "decline_no_response",
    text: "Decline without sending a message (Ignore).",
    isPremium: false,
    isSilent: true,
  },
  {
    id: "decline_personal",
    text: "Decline and send a personal note.",
    isPremium: true,
    isSilent: false,
  },
] as const;

// ─── Tab & Filter Config ────────────────────────────────────────────
export const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "received", label: "Received" },
  { id: "sent", label: "Sent" },
  { id: "starred", label: "Starred" },
  { id: "trash", label: "Trash" },
];

export const FILTERS: { id: FilterId; label: string; color: string }[] = [
  { id: "interest_received", label: "Interest Received", color: "#3B82F6" },
  { id: "interest_sent", label: "Interest Sent", color: "#6B7280" },
  { id: "i_accepted", label: "I Accepted", color: "#10B981" },
  { id: "accepted_me", label: "Accepted Me", color: "#10B981" },
  { id: "i_declined", label: "I Declined", color: "#EF4444" },
  { id: "declined_me", label: "Declined Me", color: "#EF4444" },
  { id: "expired_interests", label: "Expired Interests", color: "#F59E0B" },
];

// ─── Status color helper ────────────────────────────────────────────
export function getStatusDisplay(
  status: InterestStatus,
  myRole: "sender" | "receiver"
): { label: string; color: string } {
  if (myRole === "sender") {
    switch (status) {
      case "sent": return { label: "Interest Sent", color: "#6B7280" };
      case "accepted": return { label: "Accepted Me", color: "#8B1D91" };
      case "declined": return { label: "Declined Me", color: "#EF4444" };
      case "cancelled": return { label: "Interest Cancelled", color: "#6B7280" };
      case "expired": return { label: "Expired", color: "#F59E0B" };
    }
  } else {
    switch (status) {
      case "sent": return { label: "Interest Received", color: "#3B82F6" };
      case "accepted": return { label: "I Accepted", color: "#10B981" };
      case "declined": return { label: "I Declined", color: "#EF4444" };
      case "cancelled": return { label: "Cancelled by Sender", color: "#6B7280" };
      case "expired": return { label: "Expired", color: "#F59E0B" };
    }
  }
}

// ─── Query builder ──────────────────────────────────────────────────
const PROFILE_SELECT = "id, anugraha_id, full_name, age, gender, height_cm, education_level, is_active, last_login_at, profile_photos(photo_url, is_primary)";

export function buildInterestQuery(
  supabase: ReturnType<typeof createClient>,
  myProfileId: string,
  tab: TabId,
  filter: FilterId | null,
  page: number,
  pageSize: number,
  searchId?: string
) {
  let query = supabase
    .from("interest_messages")
    .select(
      `*, sender:profiles!sender_id(${PROFILE_SELECT}), receiver:profiles!receiver_id(${PROFILE_SELECT})`,
      { count: "exact" }
    );

  // Tab scope
  switch (tab) {
    case "all":
      query = query.or(`sender_id.eq.${myProfileId},receiver_id.eq.${myProfileId}`);
      // Exclude deleted by current user (handled per-row in client since we don't know role at DB level for "all")
      break;
    case "received":
      query = query.eq("receiver_id", myProfileId).eq("is_deleted_by_receiver", false);
      break;
    case "sent":
      query = query.eq("sender_id", myProfileId).eq("is_deleted_by_sender", false);
      break;
    case "starred":
      query = query.or(`and(sender_id.eq.${myProfileId},is_starred_by_sender.eq.true),and(receiver_id.eq.${myProfileId},is_starred_by_receiver.eq.true)`);
      break;
    case "trash":
      query = query.or(`and(sender_id.eq.${myProfileId},is_deleted_by_sender.eq.true),and(receiver_id.eq.${myProfileId},is_deleted_by_receiver.eq.true)`);
      break;
  }

  // Status filter
  if (filter) {
    switch (filter) {
      case "interest_received":
        query = query.eq("receiver_id", myProfileId).eq("status", "sent");
        break;
      case "interest_sent":
        query = query.eq("sender_id", myProfileId).eq("status", "sent");
        break;
      case "i_accepted":
        query = query.eq("receiver_id", myProfileId).eq("status", "accepted");
        break;
      case "accepted_me":
        query = query.eq("sender_id", myProfileId).eq("status", "accepted");
        break;
      case "i_declined":
        query = query.eq("receiver_id", myProfileId).eq("status", "declined");
        break;
      case "declined_me":
        query = query.eq("sender_id", myProfileId).eq("status", "declined");
        break;
      case "expired_interests":
        query = query.eq("status", "expired");
        break;
    }
  }

  // Search by Anugraha ID
  if (searchId && searchId.trim()) {
    // Will filter client-side after fetch since we need to match on joined profile
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.order("sent_at", { ascending: false }).range(from, to);

  return query;
}

// ─── Check existing interest between two profiles ───────────────────
export async function checkExistingInterest(
  supabase: ReturnType<typeof createClient>,
  senderId: string,
  receiverId: string
) {
  const { data } = await supabase
    .from("interest_messages")
    .select("id, status, sent_at, can_resend_after")
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

// ─── Send interest ──────────────────────────────────────────────────
export async function sendInterest(
  supabase: ReturnType<typeof createClient>,
  senderId: string,
  receiverId: string,
  templateId: string,
  messageText: string | null,
  isPremium: boolean
) {
  // Check daily limit
  const { data: canSend, error: limitError } = await supabase.rpc(
    "check_and_increment_interest_count",
    { p_user_id: senderId, p_is_premium: isPremium }
  );

  if (limitError) throw new Error("Failed to check interest limit");
  if (!canSend) throw new Error("DAILY_LIMIT_REACHED");

  const isCustom = templateId === "msg_personal";
  const text = isCustom
    ? messageText
    : MESSAGE_TEMPLATES.find((t) => t.id === templateId)?.text ?? "";

  const { data, error } = await supabase
    .from("interest_messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message_type: isCustom ? "custom" : "template",
      message_template_id: isCustom ? null : templateId,
      message_text: text,
      status: "sent",
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

// ─── Format date ────────────────────────────────────────────────────
export function formatInterestDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mon = months[d.getMonth()];
  const yr = String(d.getFullYear()).slice(2);
  const hr = d.getHours() % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = d.getHours() >= 12 ? "PM" : "AM";
  return `${day} ${mon} ${yr}, ${hr}:${min} ${ampm}`;
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[d.getMonth()]}-${d.getFullYear()}`;
}
