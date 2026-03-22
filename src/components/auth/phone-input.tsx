"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳", label: "India" },
  { code: "+1", country: "US", flag: "🇺🇸", label: "USA" },
  { code: "+44", country: "GB", flag: "🇬🇧", label: "UK" },
  { code: "+971", country: "AE", flag: "🇦🇪", label: "UAE" },
  { code: "+65", country: "SG", flag: "🇸🇬", label: "Singapore" },
  { code: "+61", country: "AU", flag: "🇦🇺", label: "Australia" },
  { code: "+1", country: "CA", flag: "🇨🇦", label: "Canada" },
  { code: "+49", country: "DE", flag: "🇩🇪", label: "Germany" },
  { code: "+966", country: "SA", flag: "🇸🇦", label: "Saudi Arabia" },
  { code: "+974", country: "QA", flag: "🇶🇦", label: "Qatar" },
  { code: "+968", country: "OM", flag: "🇴🇲", label: "Oman" },
  { code: "+973", country: "BH", flag: "🇧🇭", label: "Bahrain" },
  { code: "+965", country: "KW", flag: "🇰🇼", label: "Kuwait" },
] as const;

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  id?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  function PhoneInput(
    {
      value,
      onChange,
      countryCode,
      onCountryCodeChange,
      placeholder = "Mobile Number",
      disabled = false,
      readOnly = false,
      error,
      id,
    },
    ref
  ) {
    const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) ?? COUNTRY_CODES[0];

    return (
      <div>
        <div
          className={cn(
            "flex items-center border rounded-lg overflow-hidden transition-all duration-200",
            error ? "border-destructive" : "border-input",
            "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          )}
        >
          <select
            value={countryCode}
            onChange={(e) => onCountryCodeChange(e.target.value)}
            disabled={disabled || readOnly}
            className="h-11 px-2 bg-muted border-r border-input text-sm focus:outline-none cursor-pointer"
            aria-label="Country code"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={`${c.country}-${c.code}`} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <input
            ref={ref}
            id={id}
            type="tel"
            value={value}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, "").slice(0, 15);
              onChange(cleaned);
            }}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            className={cn(
              "flex-1 h-11 px-3 text-sm bg-transparent focus:outline-none",
              "placeholder:text-muted-foreground",
              readOnly && "cursor-not-allowed opacity-70"
            )}
            aria-invalid={!!error}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);
