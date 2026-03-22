"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

interface SectionEditFormProps {
  title: string;
  breadcrumb: string;
  cancelHref: string;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}

export function SectionEditForm({
  title,
  breadcrumb,
  cancelHref,
  saving,
  onSave,
  children,
}: SectionEditFormProps) {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <Link href="/my-home/view-and-edit" className="hover:text-primary">
          My Profile
        </Link>
        <span>/</span>
        <span>{breadcrumb}</span>
        <span>/</span>
        <span className="text-foreground">Edit</span>
      </div>

      <div className="bg-white rounded-lg border border-input">
        <div className="p-4 border-b border-input">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <div className="p-4 space-y-4">{children}</div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-input">
          <Link
            href={cancelHref}
            className="h-10 px-5 border border-input text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors flex items-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="h-10 px-5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
