import Link from "next/link";
import { Pencil } from "lucide-react";

interface SectionViewCardProps {
  title: string;
  editHref: string;
  children: React.ReactNode;
}

export function SectionViewCard({
  title,
  editHref,
  children,
}: SectionViewCardProps) {
  return (
    <div className="bg-white rounded-lg border border-input">
      <div className="flex items-center justify-between p-4 border-b border-input">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <Link
          href={editHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
