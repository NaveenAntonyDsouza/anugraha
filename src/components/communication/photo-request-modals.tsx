"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PhotoRequestConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  requestType: "view_request" | "upload_request";
}

export function PhotoRequestConfirmModal({
  open,
  onClose,
  onConfirm,
  requestType,
}: PhotoRequestConfirmProps) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // handled by parent
    } finally {
      setLoading(false);
    }
  }

  const message =
    requestType === "view_request"
      ? "Are you sure, you wish to send a photo view request?"
      : "Are you sure, you wish to send a photo request?";

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {requestType === "view_request" ? "Send Photo View Request" : "Request Photo"}
          </AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            NO
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            YES
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface AlreadySentModalProps {
  open: boolean;
  onClose: () => void;
  requestType: "view_request" | "upload_request";
  sentDate: string;
}

export function AlreadySentModal({ open, onClose, requestType, sentDate }: AlreadySentModalProps) {
  const typeLabel = requestType === "view_request" ? "photo view request" : "photo upload request";

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Request Already Sent</AlertDialogTitle>
          <AlertDialogDescription>
            You have already sent a {typeLabel} to this candidate on {sentDate}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose}>OK</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
