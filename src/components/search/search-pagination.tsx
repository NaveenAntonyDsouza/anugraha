"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}

export function SearchPagination({
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  onPerPageChange,
}: SearchPaginationProps) {
  const [jumpTo, setJumpTo] = useState("");

  if (totalPages <= 1) return null;

  // Generate page numbers to show
  const pages: number[] = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  function handleJump() {
    const p = parseInt(jumpTo, 10);
    if (p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpTo("");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Profiles per page</span>
        <select
          value={perPage}
          onChange={(e) => onPerPageChange(Number(e.target.value))}
          className="h-8 border border-input rounded px-2 text-sm bg-white"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-8 w-8 flex items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="First page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 flex items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Desktop page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-8 min-w-[32px] px-2 flex items-center justify-center rounded text-sm font-medium",
                p === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "border border-input text-muted-foreground hover:bg-muted/50"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Mobile: just show current/total */}
        <span className="sm:hidden text-sm text-muted-foreground px-2">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 flex items-center justify-center rounded border border-input text-muted-foreground hover:bg-muted/50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>

      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <span>Page No</span>
        <input
          type="number"
          value={jumpTo}
          onChange={(e) => setJumpTo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleJump()}
          min={1}
          max={totalPages}
          className="h-8 w-16 border border-input rounded px-2 text-sm text-center"
        />
        <button
          onClick={handleJump}
          className="h-8 px-3 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Go
        </button>
      </div>
    </div>
  );
}
