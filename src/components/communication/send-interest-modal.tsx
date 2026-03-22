"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";
import { MESSAGE_TEMPLATES } from "@/lib/interest-messages";
import { PremiumUpgradePopup } from "./premium-upgrade-popup";

interface SendInterestModalProps {
  open: boolean;
  onClose: () => void;
  profileId: string; // anugraha_id
  onSend: (templateId: string, customMessage: string | null) => Promise<void>;
  isPremium: boolean;
}

export function SendInterestModal({
  open,
  onClose,
  profileId,
  onSend,
  isPremium,
}: SendInterestModalProps) {
  const [selected, setSelected] = useState("msg_suitable");
  const [customMessage, setCustomMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);

  function handleSelect(value: string) {
    if (value === "msg_personal" && !isPremium) {
      setShowPremiumPopup(true);
      return;
    }
    setSelected(value);
  }

  async function handleSend() {
    if (selected === "msg_personal" && !isPremium) return;
    if (selected === "msg_personal" && (customMessage.length < 10 || customMessage.length > 500)) return;

    setSending(true);
    try {
      await onSend(
        selected,
        selected === "msg_personal" ? customMessage : null
      );
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setSending(false);
    }
  }

  function handlePremiumPopupClose() {
    setShowPremiumPopup(false);
    setSelected("msg_suitable");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="sm:max-w-[600px]"

        >
          <DialogHeader>
            <DialogTitle>Send Interest Message To {profileId}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Express interest by selecting message
            </p>
          </DialogHeader>

          <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-3 mt-2">
            {MESSAGE_TEMPLATES.map((t) => (
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
          </RadioGroup>

          {selected === "msg_personal" && isPremium && (
            <div className="mt-3">
              <Textarea
                placeholder="Write your personal message here..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {customMessage.length}/500 (min 10)
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={onClose} disabled={sending}>
              CANCEL
            </Button>
            <Button onClick={handleSend} disabled={sending || !selected}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "SEND"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PremiumUpgradePopup
        open={showPremiumPopup}
        onClose={handlePremiumPopupClose}
        trigger="personal_message"
      />
    </>
  );
}
