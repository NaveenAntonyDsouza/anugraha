"use client";

import Link from "next/link";

interface StatCardProps {
  label: string;
  count: number;
  href: string;
}

export function StatCard({ label, count, href }: StatCardProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-input hover:border-primary/30 hover:shadow-sm transition-all text-center"
    >
      <span className="text-2xl font-bold text-primary">{count}</span>
      <span className="text-xs text-muted-foreground mt-1">{label}</span>
    </Link>
  );
}
