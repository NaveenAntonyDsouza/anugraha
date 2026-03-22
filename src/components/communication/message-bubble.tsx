"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, CheckCircle, XCircle, Ban, Info } from "lucide-react";
import { formatInterestDate } from "@/lib/interest-messages";
import type { InterestStatus } from "@/lib/interest-messages";

interface MessageBubbleProps {
  senderName: string;
  senderPhoto?: string | null;
  messageText: string;
  timestamp: string;
  status: InterestStatus;
  isMine: boolean;
  canCancel?: boolean;
  onCancel?: () => void;
}

function getStatusIcon(status: InterestStatus, isMine: boolean) {
  if (status === "sent") return <Mail className="h-4 w-4 text-muted-foreground" />;
  if (status === "accepted") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "declined") return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === "cancelled") return <Ban className="h-4 w-4 text-muted-foreground" />;
  return <Mail className="h-4 w-4 text-amber-500" />;
}

function getStatusLabel(status: InterestStatus, isMine: boolean) {
  if (isMine) {
    switch (status) {
      case "sent": return "Interest message sent";
      case "accepted": return "Interest accepted";
      case "declined": return "Interest declined";
      case "cancelled": return "Interest Cancelled";
      case "expired": return "Interest expired";
    }
  } else {
    switch (status) {
      case "sent": return "Interest message received";
      case "accepted": return "Accepted Me";
      case "declined": return "Declined Me";
      case "cancelled": return "Cancelled by sender";
      case "expired": return "Interest expired";
    }
  }
}

export function MessageBubble({
  senderName,
  senderPhoto,
  messageText,
  timestamp,
  status,
  isMine,
  canCancel,
  onCancel,
}: MessageBubbleProps) {
  return (
    <div className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-10 w-10 shrink-0">
        {senderPhoto && <AvatarImage src={senderPhoto} alt={senderName} />}
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {senderName?.charAt(0) ?? "?"}
        </AvatarFallback>
      </Avatar>

      <div className={`max-w-[75%] ${isMine ? "text-right" : ""}`}>
        {/* Status label */}
        <div className={`flex items-center gap-1.5 mb-1 text-xs ${isMine ? "justify-end" : ""}`}>
          {getStatusIcon(status, isMine)}
          <span className="font-medium">{getStatusLabel(status, isMine)}</span>
        </div>

        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            isMine
              ? "bg-primary/10 text-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="leading-relaxed">{messageText}</p>

          {/* Cancel notice — on the bubble itself */}
          {canCancel && onCancel && (
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-primary">
                <Info className="h-3.5 w-3.5 shrink-0" />
                <span>You can cancel the message within 24 hours</span>
              </div>
              <button
                onClick={onCancel}
                className="text-xs font-semibold text-red-600 hover:underline shrink-0"
              >
                CANCEL
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-[11px] text-muted-foreground mt-1">
          {formatInterestDate(timestamp)}
        </p>
      </div>
    </div>
  );
}
