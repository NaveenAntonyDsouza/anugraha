"use client";

import { FILTERS, type FilterId } from "@/lib/interest-messages";

interface InterestFilterSidebarProps {
  activeFilter: FilterId | null;
  onFilterChange: (filter: FilterId | null) => void;
  filterCounts: Record<string, number>;
}

export function InterestFilterSidebar({
  activeFilter,
  onFilterChange,
  filterCounts,
}: InterestFilterSidebarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Filter By:</h3>
        {activeFilter && (
          <button
            onClick={() => onFilterChange(null)}
            className="text-xs text-primary hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="space-y-1">
        {FILTERS.map((f) => (
          <label
            key={f.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm ${
              activeFilter === f.id
                ? "bg-primary/10 font-medium"
                : "hover:bg-muted/50"
            }`}
          >
            <input
              type="radio"
              name="interest-filter"
              checked={activeFilter === f.id}
              onChange={() => onFilterChange(activeFilter === f.id ? null : f.id)}
              className="sr-only"
            />
            <span
              className="h-3 w-3 rounded-full shrink-0 border-2"
              style={{
                borderColor: f.color,
                backgroundColor: activeFilter === f.id ? f.color : "transparent",
              }}
            />
            <span className="flex-1">{f.label}</span>
            {filterCounts[f.id] !== undefined && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {filterCounts[f.id]}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
