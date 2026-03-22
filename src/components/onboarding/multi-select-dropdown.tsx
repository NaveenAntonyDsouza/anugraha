"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MultiSelectGroup {
  label: string;
  options: string[];
}

interface MultiSelectDropdownProps {
  /** Flat list of options OR grouped options */
  options?: string[];
  groups?: MultiSelectGroup[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  /** Whether to include "Any" option with select-all logic */
  includeAny?: boolean;
  label?: string;
}

export function MultiSelectDropdown({
  options,
  groups,
  value,
  onChange,
  placeholder = "Select...",
  error,
  disabled = false,
  searchable = false,
  includeAny = true,
  label,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Normalize to groups format
  const allGroups: MultiSelectGroup[] = useMemo(() => {
    if (groups) return groups;
    if (options) return [{ label: "", options }];
    return [];
  }, [groups, options]);

  // All non-"Any" options flat
  const allOptions = useMemo(
    () => allGroups.flatMap((g) => g.options),
    [allGroups]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allGroups;
    const q = search.toLowerCase();
    return allGroups
      .map((g) => ({
        ...g,
        options: g.options.filter((o) => o.toLowerCase().includes(q)),
      }))
      .filter((g) => g.options.length > 0);
  }, [allGroups, search]);

  const hasAny = value.includes("Any");

  function toggleOption(opt: string) {
    if (opt === "Any") {
      // Toggle all
      if (hasAny) {
        onChange([]);
      } else {
        onChange(["Any", ...allOptions]);
      }
      return;
    }

    let next: string[];
    if (value.includes(opt)) {
      // Deselect
      next = value.filter((v) => v !== opt && v !== "Any");
    } else {
      // Select
      next = [...value.filter((v) => v !== "Any"), opt];
      // If all specific options selected, auto-add "Any"
      if (includeAny && allOptions.every((o) => next.includes(o))) {
        next = ["Any", ...next];
      }
    }
    onChange(next);
  }

  function removeTag(opt: string) {
    if (opt === "Any") {
      onChange([]);
    } else {
      onChange(value.filter((v) => v !== opt && v !== "Any"));
    }
  }

  const displayText =
    value.length === 0
      ? placeholder
      : hasAny
        ? "Any"
        : `${value.length} selected`;

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between h-11 px-3",
          "border rounded-lg text-sm text-left",
          "transition-all duration-200",
          error ? "border-destructive" : "border-input",
          isOpen && "border-primary ring-2 ring-primary/20",
          value.length === 0 && "text-muted-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Tags */}
      {value.length > 0 && !hasAny && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {value.slice(0, 8).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-destructive"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {value.length > 8 && (
            <span className="text-xs text-muted-foreground px-1 py-0.5">
              +{value.length - 8} more
            </span>
          )}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-input rounded-lg shadow-lg max-h-72 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-input">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full h-9 pl-8 pr-8 text-sm border border-input rounded-md focus:outline-none focus:border-primary"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="overflow-y-auto max-h-56" role="listbox">
            {/* "Any" option */}
            {includeAny && !search && (
              <button
                type="button"
                role="option"
                aria-selected={hasAny}
                onClick={() => toggleOption("Any")}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                  "hover:bg-accent transition-colors font-medium",
                  hasAny && "bg-accent text-accent-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px]",
                    hasAny
                      ? "bg-primary border-primary text-white"
                      : "border-input"
                  )}
                >
                  {hasAny && "\u2713"}
                </span>
                Any
              </button>
            )}

            {filtered.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                No results found
              </p>
            ) : (
              filtered.map((group) => (
                <div key={group.label || "__flat__"}>
                  {group.label && (
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase bg-muted/50 sticky top-0">
                      {group.label}
                    </div>
                  )}
                  {group.options.map((option) => {
                    const selected = value.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => toggleOption(option)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                          "hover:bg-accent transition-colors",
                          selected && "bg-accent/50"
                        )}
                      >
                        <span
                          className={cn(
                            "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center text-[10px]",
                            selected
                              ? "bg-primary border-primary text-white"
                              : "border-input"
                          )}
                        >
                          {selected && "\u2713"}
                        </span>
                        {option}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
