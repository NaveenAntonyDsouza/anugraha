"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, PartyPopper } from "lucide-react";

interface PaymentSuccessModalProps {
  open: boolean;
  onClose: () => void;
  planName?: string;
}

export function PaymentSuccessModal({ open, onClose, planName }: PaymentSuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <PartyPopper className="h-8 w-8 text-amber-500 absolute -top-2 -right-2" />
          </div>

          <DialogTitle className="text-xl font-bold text-green-600">
            Payment Successful!
          </DialogTitle>

          <p className="text-sm text-muted-foreground">
            {planName
              ? `Your ${planName} membership is now active. Enjoy premium features!`
              : "Your membership is now active. Enjoy premium features!"}
          </p>

          <Button onClick={onClose} className="w-full mt-2">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
