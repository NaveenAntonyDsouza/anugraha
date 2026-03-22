"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MultiSelectFilter } from "./multi-select-filter";
import type { SearchFilters, ShowProfileToggles } from "@/lib/search/filter-types";
import {
  heightList,
  maritalStatusList,
  educationLevelList,
  motherTongueList,
  religionList,
  denominationList,
  dioceseList,
  casteList,
  subCasteList,
  jamathList,
  physicalStatusList,
  familyStatusList,
  bodyTypeList,
  annualIncomeList,
  employmentCategoryList,
  residentialStatusList,
  branchList,
  eatingHabitsList,
  drinkingHabitsList,
  smokingHabitsList,
  countryList,
  indianStateList,
  karnatakaDistrictList,
  differentlyAbledCategoryList,
} from "@/lib/reference-data";
import {
  occupationCategoryList,
  educationalQualificationsList,
} from "@/lib/reference-data";

// Age range 18-70
const ageOptions = Array.from({ length: 53 }, (_, i) => String(18 + i));

interface FilterPanelProps {
  filters: SearchFilters;
  toggles: ShowProfileToggles;
  onFilterChange: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  onToggleChange: (key: keyof ShowProfileToggles, value: boolean) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function FilterPanel({
  filters,
  toggles,
  onFilterChange,
  onToggleChange,
  onSearch,
  onReset,
}: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  function toggleSection(id: string) {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const selectedReligions = filters.religion ?? [];
  const showChristianFields = selectedReligions.includes("Christian");
  const showHinduJainFields = selectedReligions.includes("Hindu") || selectedReligions.includes("Jain");
  const showMuslimFields = selectedReligions.includes("Muslim");

  // Flatten grouped lists for multi-select
  const flatOccupations = occupationCategoryList.flatMap((g) => g.options);
  const flatEducation = educationalQualificationsList.flatMap((g) => g.options);

  return (
    <div className="space-y-4">
      {/* Primary Fields */}
      <div className="space-y-3">
        {/* Age Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Age From</label>
            <select
              value={filters.min_age ?? ""}
              onChange={(e) => onFilterChange("min_age", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
            >
              <option value="">Any</option>
              {ageOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Age To</label>
            <select
              value={filters.max_age ?? ""}
              onChange={(e) => onFilterChange("max_age", e.target.value ? Number(e.target.value) : undefined)}
              className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
            >
              <option value="">Any</option>
              {ageOptions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Height Range */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Height From</label>
            <select
              value={filters.min_height ?? ""}
              onChange={(e) => onFilterChange("min_height", e.target.value || undefined)}
              className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
            >
              <option value="">Any</option>
              {heightList.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Height To</label>
            <select
              value={filters.max_height ?? ""}
              onChange={(e) => onFilterChange("max_height", e.target.value || undefined)}
              className="w-full h-9 border border-input rounded-lg px-2 text-sm bg-white"
            >
              <option value="">Any</option>
              {heightList.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        <MultiSelectFilter
          label="Marital Status"
          options={maritalStatusList}
          selected={filters.marital_status ?? []}
          onChange={(v) => onFilterChange("marital_status", v)}
        />

        <MultiSelectFilter
          label="Education"
          options={educationalQualificationsList}
          selected={filters.education_level ?? []}
          onChange={(v) => onFilterChange("education_level", v)}
          searchable
        />

        <MultiSelectFilter
          label="Occupation"
          options={occupationCategoryList}
          selected={filters.occupation_category ?? []}
          onChange={(v) => onFilterChange("occupation_category", v)}
          searchable
        />

        {/* Working Location */}
        <MultiSelectFilter
          label="Working Country"
          options={countryList}
          selected={filters.working_country ?? []}
          onChange={(v) => onFilterChange("working_country", v)}
          searchable
        />
        {filters.working_country?.includes("India") && (
          <>
            <MultiSelectFilter
              label="Working State"
              options={indianStateList}
              selected={filters.working_state ?? []}
              onChange={(v) => onFilterChange("working_state", v)}
              searchable
            />
            {filters.working_state?.includes("Karnataka") && (
              <MultiSelectFilter
                label="Working District"
                options={karnatakaDistrictList}
                selected={filters.working_district ?? []}
                onChange={(v) => onFilterChange("working_district", v)}
                searchable
              />
            )}
          </>
        )}

        {/* Native Location */}
        <MultiSelectFilter
          label="Native Country"
          options={countryList}
          selected={filters.native_country ?? []}
          onChange={(v) => onFilterChange("native_country", v)}
          searchable
        />
        {filters.native_country?.includes("India") && (
          <>
            <MultiSelectFilter
              label="Native State"
              options={indianStateList}
              selected={filters.native_state ?? []}
              onChange={(v) => onFilterChange("native_state", v)}
              searchable
            />
            {filters.native_state?.includes("Karnataka") && (
              <MultiSelectFilter
                label="Native District"
                options={karnatakaDistrictList}
                selected={filters.native_district ?? []}
                onChange={(v) => onFilterChange("native_district", v)}
                searchable
              />
            )}
          </>
        )}

        <MultiSelectFilter
          label="Mother Tongue"
          options={motherTongueList}
          selected={filters.mother_tongue ?? []}
          onChange={(v) => onFilterChange("mother_tongue", v)}
        />

        <MultiSelectFilter
          label="Religion"
          options={religionList}
          selected={filters.religion ?? []}
          onChange={(v) => onFilterChange("religion", v)}
        />

        {/* Religion conditional children */}
        {showChristianFields && (
          <>
            <MultiSelectFilter
              label="Denomination"
              options={denominationList}
              selected={filters.denomination ?? []}
              onChange={(v) => onFilterChange("denomination", v)}
            />
            <MultiSelectFilter
              label="Diocese"
              options={dioceseList}
              selected={filters.diocese ?? []}
              onChange={(v) => onFilterChange("diocese", v)}
              searchable
            />
          </>
        )}
        {showHinduJainFields && (
          <>
            <MultiSelectFilter
              label="Caste / Community"
              options={casteList}
              selected={filters.caste ?? []}
              onChange={(v) => onFilterChange("caste", v)}
              searchable
            />
            <MultiSelectFilter
              label="Sub-Caste"
              options={subCasteList}
              selected={filters.sub_caste ?? []}
              onChange={(v) => onFilterChange("sub_caste", v)}
            />
          </>
        )}
        {showMuslimFields && (
          <>
            <MultiSelectFilter
              label="Sect"
              options={["Sunni", "Shia", "Other", "Prefer Not to Say"]}
              selected={filters.muslim_sect ?? []}
              onChange={(v) => onFilterChange("muslim_sect", v)}
            />
            <MultiSelectFilter
              label="Community / Jamath"
              options={jamathList}
              selected={filters.muslim_community ?? []}
              onChange={(v) => onFilterChange("muslim_community", v)}
            />
          </>
        )}
      </div>

      {/* Search + Reset */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onSearch}
          className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          SEARCH
        </button>
        <button
          onClick={onReset}
          className="h-10 px-4 border border-input rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Collapsible: Add More Criteria */}
      <CollapsibleSection
        title="Add More Criteria"
        isOpen={expandedSections["add_more"] ?? false}
        onToggle={() => toggleSection("add_more")}
      >
        <div className="space-y-3">
          <MultiSelectFilter
            label="Physical Status"
            options={physicalStatusList}
            selected={filters.physical_status ?? []}
            onChange={(v) => onFilterChange("physical_status", v)}
          />
          <MultiSelectFilter
            label="Category of Differently Abled"
            options={differentlyAbledCategoryList}
            selected={filters.category_differently_abled ?? []}
            onChange={(v) => onFilterChange("category_differently_abled", v)}
          />
          <MultiSelectFilter
            label="Family Status"
            options={familyStatusList}
            selected={filters.family_status ?? []}
            onChange={(v) => onFilterChange("family_status", v)}
          />
          <MultiSelectFilter
            label="Body Type"
            options={bodyTypeList}
            selected={filters.body_type ?? []}
            onChange={(v) => onFilterChange("body_type", v)}
          />
          <MultiSelectFilter
            label="Annual Income"
            options={annualIncomeList}
            selected={filters.annual_income ?? []}
            onChange={(v) => onFilterChange("annual_income", v)}
          />
          <MultiSelectFilter
            label="Employment Category"
            options={employmentCategoryList}
            selected={filters.employment_status ?? []}
            onChange={(v) => onFilterChange("employment_status", v)}
          />
          <MultiSelectFilter
            label="Residing Country"
            options={countryList}
            selected={filters.residing_country ?? []}
            onChange={(v) => onFilterChange("residing_country", v)}
            searchable
          />
          <MultiSelectFilter
            label="Residential Status"
            options={residentialStatusList}
            selected={filters.residential_status ?? []}
            onChange={(v) => onFilterChange("residential_status", v)}
          />
        </div>
      </CollapsibleSection>

      {/* Collapsible: Branch Name */}
      <CollapsibleSection
        title="Branch Name"
        isOpen={expandedSections["branch"] ?? false}
        onToggle={() => toggleSection("branch")}
      >
        <MultiSelectFilter
          label="Branch Name"
          options={branchList}
          selected={filters.branch ?? []}
          onChange={(v) => onFilterChange("branch", v)}
        />
      </CollapsibleSection>

      {/* Collapsible: Show Profile */}
      <CollapsibleSection
        title="Show Profile"
        isOpen={expandedSections["show_profile"] ?? false}
        onToggle={() => toggleSection("show_profile")}
      >
        <div className="space-y-2">
          {([
            ["filter_already_seen", "Don't show profiles I have already seen"],
            ["filter_already_contacted", "Don't show profiles I have seen contact info"],
            ["filter_interest_sent", "Don't show profiles I have sent interest"],
            ["filter_shortlisted", "Don't show profiles I have shortlisted"],
            ["filter_with_photo", "With Photo"],
            ["filter_online", "Currently Online"],
            ["filter_premium", "Premium Members"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={toggles[key]}
                onChange={(e) => onToggleChange(key, e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary/30"
              />
              <span className="text-xs text-foreground">{label}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Collapsible: Life Style Habits */}
      <CollapsibleSection
        title="Life Style Habits"
        isOpen={expandedSections["lifestyle"] ?? false}
        onToggle={() => toggleSection("lifestyle")}
      >
        <div className="space-y-3">
          <MultiSelectFilter
            label="Eating Habit"
            options={eatingHabitsList}
            selected={filters.eating_habits ?? []}
            onChange={(v) => onFilterChange("eating_habits", v)}
          />
          <MultiSelectFilter
            label="Drinking Habit"
            options={drinkingHabitsList}
            selected={filters.drinking_habits ?? []}
            onChange={(v) => onFilterChange("drinking_habits", v)}
          />
          <MultiSelectFilter
            label="Smoking Habit"
            options={smokingHabitsList}
            selected={filters.smoking_habits ?? []}
            onChange={(v) => onFilterChange("smoking_habits", v)}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}

function CollapsibleSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-input rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors"
      >
        {title}
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isOpen && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
