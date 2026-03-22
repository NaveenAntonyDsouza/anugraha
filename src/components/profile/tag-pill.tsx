interface TagPillProps {
  value: string;
}

export function TagPill({ value }: TagPillProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
      {value}
    </span>
  );
}

interface TagPillListProps {
  values: string[] | null | undefined;
  label: string;
}

export function TagPillRow({ values, label }: TagPillListProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-input last:border-0">
      <span className="text-sm text-muted-foreground sm:w-48 sm:flex-shrink-0">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5 mt-0.5 sm:mt-0">
        {values && values.length > 0 ? (
          values.filter((v) => v !== "Any").map((v) => <TagPill key={v} value={v} />)
        ) : (
          <span className="text-sm text-foreground">{"\u2014"}</span>
        )}
      </div>
    </div>
  );
}
