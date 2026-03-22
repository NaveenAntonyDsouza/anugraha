"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, ShieldCheck } from "lucide-react";
import {
  type InterestMessage,
  type TabId,
  type FilterId,
  getStatusDisplay,
  formatInterestDate,
} from "@/lib/interest-messages";

interface InterestTableProps {
  interests: InterestMessage[];
  myProfileId: string;
  currentTab: TabId;
  currentFilter: FilterId | null;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onStarToggle: (interest: InterestMessage) => void;
  onMarkRead: (interest: InterestMessage) => void;
}

export function InterestTable({
  interests,
  myProfileId,
  currentTab,
  currentFilter,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onStarToggle,
  onMarkRead,
}: InterestTableProps) {
  const router = useRouter();

  function getOtherProfile(interest: InterestMessage) {
    return interest.sender_id === myProfileId ? interest.receiver : interest.sender;
  }

  function getMyRole(interest: InterestMessage): "sender" | "receiver" {
    return interest.sender_id === myProfileId ? "sender" : "receiver";
  }

  function isStarred(interest: InterestMessage): boolean {
    const role = getMyRole(interest);
    return role === "sender" ? interest.is_starred_by_sender : interest.is_starred_by_receiver;
  }

  function handleRowClick(interest: InterestMessage) {
    onMarkRead(interest);
    const other = getOtherProfile(interest);
    const params = new URLSearchParams();
    if (currentFilter) params.set("filter", currentFilter);
    params.set("tab", currentTab);
    router.push(`/user-info/interest-message/${other.anugraha_id}?${params.toString()}`);
  }

  const allSelected = interests.length > 0 && interests.every((i) => selectedIds.has(i.id));

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="hidden md:grid grid-cols-[40px_40px_60px_1fr_180px_180px] items-center px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
        <div>
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
          />
        </div>
        <div />
        <div />
        <div>Name & ID</div>
        <div>Status</div>
        <div>Date</div>
      </div>

      {/* Rows */}
      {interests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No interest messages found.
        </div>
      ) : (
        interests.map((interest) => {
          const other = getOtherProfile(interest);
          const role = getMyRole(interest);
          const status = getStatusDisplay(interest.status, role);
          const starred = isStarred(interest);
          const photo = other.profile_photos?.find((p) => p.is_primary)?.photo_url
            ?? other.profile_photos?.[0]?.photo_url;

          return (
            <div
              key={interest.id}
              className={`grid grid-cols-[40px_40px_60px_1fr_180px_180px] items-center px-3 py-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/30 ${
                !interest.is_read ? "bg-primary/5" : ""
              } ${!other.is_active ? "opacity-60" : ""}`}
              onClick={() => handleRowClick(interest)}
            >
              {/* Checkbox */}
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(interest.id)}
                  onCheckedChange={() => onSelectToggle(interest.id)}
                />
              </div>

              {/* Star */}
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onStarToggle(interest)}
                  className="p-1 rounded hover:bg-muted"
                >
                  <Star
                    className={`h-4 w-4 ${
                      starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>

              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-10 w-10">
                  {photo && <AvatarImage src={photo} alt={other.full_name} />}
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {other.full_name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                {other.last_login_at && isOnline(other.last_login_at) && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>

              {/* Name & ID */}
              <div className="min-w-0 pl-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm truncate ${!interest.is_read ? "font-semibold" : ""}`}>
                    {other.full_name}
                  </span>
                  {!other.is_active && (
                    <span className="text-xs text-red-500 bg-red-50 px-1.5 rounded">Unavailable</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{other.anugraha_id}</span>
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                </div>
              </div>

              {/* Status */}
              <div>
                <span
                  className={`text-sm ${!interest.is_read ? "font-bold" : ""}`}
                  style={{ color: status.color }}
                >
                  {status.label}
                </span>
              </div>

              {/* Date */}
              <div className="text-xs text-muted-foreground">
                {formatInterestDate(interest.sent_at)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Mobile card layout ─────────────────────────────────────────────
export function InterestCardList({
  interests,
  myProfileId,
  currentTab,
  currentFilter,
  onStarToggle,
  onMarkRead,
}: Omit<InterestTableProps, "selectedIds" | "onSelectToggle" | "onSelectAll">) {
  const router = useRouter();

  function getOtherProfile(interest: InterestMessage) {
    return interest.sender_id === myProfileId ? interest.receiver : interest.sender;
  }

  function getMyRole(interest: InterestMessage): "sender" | "receiver" {
    return interest.sender_id === myProfileId ? "sender" : "receiver";
  }

  function handleRowClick(interest: InterestMessage) {
    onMarkRead(interest);
    const other = getOtherProfile(interest);
    const params = new URLSearchParams();
    if (currentFilter) params.set("filter", currentFilter);
    params.set("tab", currentTab);
    router.push(`/user-info/interest-message/${other.anugraha_id}?${params.toString()}`);
  }

  return (
    <div className="space-y-3 md:hidden">
      {interests.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No interest messages found.
        </div>
      ) : (
        interests.map((interest) => {
          const other = getOtherProfile(interest);
          const role = getMyRole(interest);
          const status = getStatusDisplay(interest.status, role);
          const starred = interest.sender_id === myProfileId
            ? interest.is_starred_by_sender
            : interest.is_starred_by_receiver;
          const photo = other.profile_photos?.find((p) => p.is_primary)?.photo_url
            ?? other.profile_photos?.[0]?.photo_url;

          return (
            <div
              key={interest.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-muted/30 ${
                !interest.is_read ? "bg-primary/5 border-primary/20" : ""
              } ${!other.is_active ? "opacity-60" : ""}`}
              onClick={() => handleRowClick(interest)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  {photo && <AvatarImage src={photo} alt={other.full_name} />}
                  <AvatarFallback className="text-sm bg-primary/10 text-primary">
                    {other.full_name?.charAt(0) ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm truncate ${!interest.is_read ? "font-semibold" : ""}`}>
                      {other.full_name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStarToggle(interest);
                      }}
                      className="p-1"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  </div>
                  <div className="text-xs text-muted-foreground">{other.anugraha_id}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-medium" style={{ color: status.color }}>
                      {status.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatInterestDate(interest.sent_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function isOnline(lastLogin: string): boolean {
  const diff = Date.now() - new Date(lastLogin).getTime();
  return diff < 15 * 60 * 1000; // 15 minutes
}
