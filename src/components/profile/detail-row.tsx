interface DetailRowProps {
  label: string;
  value: string | number | null | undefined;
}

export function DetailRow({ label, value }: DetailRowProps) {
  const display =
    value === null || value === undefined || value === "" ? "\u2014" : String(value);

  return (
    <div className="flex flex-col sm:flex-row sm:items-start py-2 border-b border-input last:border-0">
      <span className="text-sm text-muted-foreground sm:w-48 sm:flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-foreground mt-0.5 sm:mt-0">{display}</span>
    </div>
  );
}
