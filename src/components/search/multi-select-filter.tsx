"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectFilterProps {
  label: string;
  options: string[] | { label: string; options: string[] }[];
  selected: string[];
  onChange: (values: string[]) => void;
  searchable?: boolean;
  placeholder?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  searchable = false,
  placeholder,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Flatten options for filtering
  const isGrouped = options.length > 0 && typeof options[0] === "object" && "label" in (options[0] as object);

  const flatOptions: string[] = isGrouped
    ? (options as { label: string; options: string[] }[]).flatMap((g) => g.options)
    : (options as string[]);

  const filteredFlat = search
    ? flatOptions.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : flatOptions;

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  function selectAll() {
    onChange([...flatOptions]);
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full h-9 border border-input rounded-lg px-3 text-left text-sm flex items-center justify-between bg-white",
          selected.length > 0 ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span className="truncate">
          {selected.length > 0
            ? selected.length === 1
              ? selected[0]
              : `${selected.length} selected`
            : placeholder ?? "Any"}
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 ml-1" />
      </button>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selected.slice(0, 3).map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-full"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="hover:text-primary/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selected.length > 3 && (
            <span className="text-[11px] text-muted-foreground px-1">+{selected.length - 3} more</span>
          )}
        </div>
      )}

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-input rounded-lg shadow-lg max-h-60 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-input">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-8 border border-input rounded px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                autoFocus
              />
            </div>
          )}

          <div className="flex gap-2 px-3 py-1.5 border-b border-input">
            <button type="button" onClick={selectAll} className="text-[11px] text-primary hover:underline">
              Select All
            </button>
            <button type="button" onClick={clearAll} className="text-[11px] text-muted-foreground hover:underline">
              Clear
            </button>
          </div>

          <div className="overflow-y-auto max-h-48">
            {isGrouped ? (
              (options as { label: string; options: string[] }[]).map((group) => {
                const visibleOpts = search
                  ? group.options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
                  : group.options;
                if (visibleOpts.length === 0) return null;
                return (
                  <div key={group.label}>
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group.label}
                    </p>
                    {visibleOpts.map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(opt)}
                          onChange={() => toggle(opt)}
                          className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/30"
                        />
                        <span className="text-xs">{opt}</span>
                      </label>
                    ))}
                  </div>
                );
              })
            ) : (
              filteredFlat.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(opt)}
                    onChange={() => toggle(opt)}
                    className="h-3.5 w-3.5 rounded border-input text-primary focus:ring-primary/30"
                  />
                  <span className="text-xs">{opt}</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
