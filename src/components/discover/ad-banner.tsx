"use client";

export function AdBanner() {
  return (
    <div className="hidden xl:block w-[200px] flex-shrink-0">
      <div className="sticky top-28 space-y-4">
        <div className="bg-gradient-to-b from-primary/5 to-primary/10 rounded-lg border border-input p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Advertisement</p>
          <div className="h-[250px] bg-muted/30 rounded flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Ad Space</p>
          </div>
        </div>
        <div className="bg-gradient-to-b from-primary/5 to-primary/10 rounded-lg border border-input p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Advertisement</p>
          <div className="h-[250px] bg-muted/30 rounded flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Ad Space</p>
          </div>
        </div>
      </div>
    </div>
  );
}
