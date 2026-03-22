"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface LogoutSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutSection({ isOpen, onClose }: LogoutSectionProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      toast.error("Failed to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 space-y-6">
        <p className="text-sm text-center font-medium">
          Are you sure, you wish to logout now?
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            disabled={loggingOut}
            className="h-10 px-6 border border-input rounded-lg text-sm font-semibold hover:bg-muted/50 transition-colors"
          >
            NO
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "YES"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
