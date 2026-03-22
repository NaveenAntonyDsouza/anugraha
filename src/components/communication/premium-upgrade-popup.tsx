"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Mail, MessageCircle, Star, X, Lock } from "lucide-react";

interface PremiumUpgradePopupProps {
  open: boolean;
  onClose: () => void;
  trigger: "reply" | "personal_message";
}

const BENEFITS = [
  { icon: Users, label: "Contact interested candidates" },
  { icon: Mail, label: "Initiate messages to candidates" },
  { icon: MessageCircle, label: "Send personalized messages" },
  { icon: Star, label: "Featured profile in searches" },
];

export function PremiumUpgradePopup({ open, onClose, trigger }: PremiumUpgradePopupProps) {
  const title =
    trigger === "reply"
      ? "Upgrade your membership to send a reply message."
      : "Send personalized messages to stand out and make meaningful connections";

  const ctaLabel = trigger === "reply" ? "UPGRADE NOW" : "View Premium Plans";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 rounded-full p-1 hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Top section */}
          <div className="p-6 text-center">
            <DialogTitle className="text-lg font-semibold text-primary mb-3">
              {title}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              With customized messaging, you can more effectively convey your feelings to interested candidates.
            </p>

            {/* Lock illustration */}
            <div className="my-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Purple benefits section */}
          <div className="bg-primary text-white p-6 rounded-t-3xl">
            <h3 className="text-center font-semibold mb-4">
              Why should you upgrade to Premium Plans?
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {BENEFITS.map((b) => (
                <div key={b.label} className="flex items-start gap-2">
                  <b.icon className="h-5 w-5 mt-0.5 shrink-0" />
                  <span className="text-sm">{b.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/membership-plans">
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8"
                >
                  {ctaLabel}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
