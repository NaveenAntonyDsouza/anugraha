"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { REPLY_ACCEPT_TEMPLATES, REPLY_DECLINE_TEMPLATES } from "@/lib/interest-messages";
import { PremiumUpgradePopup } from "./premium-upgrade-popup";

interface ReplyModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string;
  isPremium: boolean;
  onAccept: (templateId: string, customMessage: string | null) => Promise<void>;
  onDecline: (templateId: string, customMessage: string | null, isSilent: boolean) => Promise<void>;
}

export function ReplyModal({
  open,
  onClose,
  profileId,
  isPremium,
  onAccept,
  onDecline,
}: ReplyModalProps) {
  const [selected, setSelected] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  const isAcceptOption = selected.startsWith("reply_");
  const isDeclineOption = selected.startsWith("decline_");

  function handleSelect(value: string) {
    const template = [...REPLY_ACCEPT_TEMPLATES, ...REPLY_DECLINE_TEMPLATES].find(
      (t) => t.id === value
    );
    if (template?.isPremium && !isPremium) {
      setShowPremiumPopup(true);
      return;
    }
    setSelected(value);
    setCustomMessage("");
  }

  async function handleSend() {
    setSending(true);
    try {
      if (isAcceptOption) {
        await onAccept(
          selected,
          selected === "reply_personal" ? customMessage : null
        );
      } else if (isDeclineOption) {
        const declineTemplate = REPLY_DECLINE_TEMPLATES.find((t) => t.id === selected);
        await onDecline(
          selected,
          selected === "decline_personal" ? customMessage : null,
          declineTemplate?.isSilent ?? false
        );
      }
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSending(false);
    }
  }

  const needsTextarea =
    (selected === "reply_personal" || selected === "decline_personal") && isPremium;
  const maxChars = selected === "decline_personal" ? 250 : 500;

  const isValid =
    selected &&
    (!needsTextarea || (customMessage.length >= 10 && customMessage.length <= maxChars));

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to {profileId}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Accept their interest and send a response
            </p>
          </DialogHeader>

          <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-2 mt-2">
            {/* Accept section */}
            <h4 className="text-sm font-semibold text-green-700">Accept</h4>
            {REPLY_ACCEPT_TEMPLATES.map((t) => (
              <div
                key={t.id}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  selected === t.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
                onClick={() => handleSelect(t.id)}
              >
                <RadioGroupItem value={t.id} id={t.id} className="mt-1" />
                <Label htmlFor={t.id} className="cursor-pointer flex-1 text-sm leading-relaxed">
                  {t.text}
                  {t.isPremium && (
                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                      <Lock className="h-3 w-3" /> Premium
                    </span>
                  )}
                </Label>
              </div>
            ))}

            {/* Decline section */}
            <button
              type="button"
              onClick={() => setShowDecline(!showDecline)}
              className="flex items-center gap-2 text-sm font-semibold text-red-600 mt-3 hover:underline"
            >
              Decline
              {showDecline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showDecline &&
              REPLY_DECLINE_TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    selected === t.id ? "border-red-500 bg-red-50" : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleSelect(t.id)}
                >
                  <RadioGroupItem value={t.id} id={t.id} className="mt-1" />
                  <Label htmlFor={t.id} className="cursor-pointer flex-1 text-sm leading-relaxed">
                    {t.text}
                    {t.isPremium && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                        <Lock className="h-3 w-3" /> Premium
                      </span>
                    )}
                  </Label>
                </div>
              ))}
          </RadioGroup>

          {needsTextarea && (
            <div className="mt-3">
              <Textarea
                placeholder={
                  selected === "reply_personal"
                    ? "Write your personal reply..."
                    : "Write your personal note..."
                }
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[80px]"
                maxLength={maxChars}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {customMessage.length}/{maxChars} (min 10)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              CANCEL
            </Button>
            <Button
              onClick={handleSend}
              disabled={sending || !isValid}
              variant={isDeclineOption ? "destructive" : "default"}
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "SEND REPLY"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumUpgradePopup
        open={showPremiumPopup}
        onClose={() => setShowPremiumPopup(false)}
        trigger="reply"
      />
    </>
  );
}
