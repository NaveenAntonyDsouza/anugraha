"use client";

import { useState } from "react";
import { Loader2, X, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";

/* ─── Forward Profile Dropdown ─── */

interface ForwardProfileDropdownProps {
  profileUrl: string;
  onMailClick: () => void;
}

export function ForwardProfileDropdown({
  profileUrl,
  onMailClick,
}: ForwardProfileDropdownProps) {
  const [open, setOpen] = useState(false);

  function handleWhatsApp() {
    const text = `Check out this profile on Anugraha Matrimony: ${profileUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
      >
        <Mail className="h-4 w-4" />
        Forward Profile
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-full top-0 ml-1 z-50 bg-white border border-input rounded-lg shadow-lg py-1 w-36">
            <button
              type="button"
              onClick={() => {
                onMailClick();
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              Mail
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
              WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Forward Profile By Mail Modal ─── */

interface ForwardProfileByMailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  senderName: string;
}

export function ForwardProfileByMailModal({
  isOpen,
  onClose,
  profileId,
  senderName,
}: ForwardProfileByMailModalProps) {
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  async function handleSend() {
    if (!recipientName.trim() || !recipientEmail.trim()) {
      toast.error("Recipient name and email are required");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/profile/forward-by-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientEmail,
          customMessage,
          profileId,
          senderName,
        }),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success("Profile forwarded successfully.");
      setRecipientName("");
      setRecipientEmail("");
      setCustomMessage("");
      onClose();
    } catch {
      toast.error("Failed to forward profile");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Forward profile by mail
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Recipient Name"
              className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <div>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Recipient Email ID"
              className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm"
            />
          </div>
          <div>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value.slice(0, 1000))}
              placeholder="Enter Your Custom Message"
              rows={4}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {customMessage.length} Characters Typed.(Max. 1000 Chars )
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 border border-input text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            SEND
          </button>
        </div>
      </div>
    </div>
  );
}
