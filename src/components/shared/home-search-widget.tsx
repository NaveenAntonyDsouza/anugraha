"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const ageOptions = Array.from({ length: 53 }, (_, i) => i + 18);

export function HomeSearchWidget() {
  const router = useRouter();
  const [lookingFor, setLookingFor] = useState<"Bride" | "Groom">("Bride");
  const [ageFrom, setAgeFrom] = useState(21);
  const [ageTo, setAgeTo] = useState(30);

  function handleSearch() {
    const params = new URLSearchParams({
      gender: lookingFor === "Bride" ? "Female" : "Male",
      age_from: String(ageFrom),
      age_to: String(ageTo),
    });
    router.push(`/my-home/search/partner-search?${params.toString()}`);
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 sm:p-8 max-w-2xl w-full">
      <h2 className="text-lg font-semibold text-foreground mb-4 text-center">
        Find Your Perfect Match
      </h2>

      {/* Looking For */}
      <div className="mb-4">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          I&apos;m looking for a
        </label>
        <div className="flex gap-3">
          {(["Bride", "Groom"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setLookingFor(option)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                lookingFor === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Age Range */}
      <div className="mb-6">
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Age
        </label>
        <div className="flex items-center gap-3">
          <select
            value={ageFrom}
            onChange={(e) => setAgeFrom(Number(e.target.value))}
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {ageOptions.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">to</span>
          <select
            value={ageTo}
            onChange={(e) => setAgeTo(Number(e.target.value))}
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            {ageOptions.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={handleSearch}
        className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
      >
        <Search className="h-4 w-4" />
        View Profiles
      </button>
    </div>
  );
}
