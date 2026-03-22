"use client";

interface ConditionalFieldProps {
  condition: boolean;
  children: React.ReactNode;
}

export function ConditionalField({ condition, children }: ConditionalFieldProps) {
  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${
        condition
          ? "grid-rows-[1fr] opacity-100"
          : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        {condition && children}
      </div>
    </div>
  );
}
