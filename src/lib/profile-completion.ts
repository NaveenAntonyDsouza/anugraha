import { createClient } from "@/lib/supabase/client";

/**
 * Calculates profile completion percentage based on filled fields across all profile tables.
 * Base 40% comes from mandatory registration (Slice 1).
 * Remaining 60% split across optional sections.
 */

interface SectionWeight {
  table: string;
  fields: string[];
  weight: number; // percentage points this section contributes
}

const SECTIONS: SectionWeight[] = [
  // Additional Step One (20% total)
  {
    table: "profile_primary_info",
    fields: ["weight", "blood_group", "mother_tongue", "about_the_candidate"],
    weight: 5,
  },
  {
    table: "profile_education_profession",
    fields: ["education_in_detail", "occupation_in_detail", "organization_name"],
    weight: 5,
  },
  {
    table: "profile_family_info",
    fields: [
      "father_name",
      "father_house_name",
      "father_native_place",
      "father_occupation",
      "mother_name",
      "mother_house_name",
      "mother_native_place",
      "mother_occupation",
      "candidate_asset_details",
      "about_candidate_family",
    ],
    weight: 5,
  },
  {
    table: "profile_sibling_info",
    fields: [
      "brothers_married",
      "brothers_unmarried",
      "brothers_priest",
      "sisters_married",
      "sisters_unmarried",
      "sisters_nun",
    ],
    weight: 5,
  },

  // Additional Step Two (15% total)
  {
    table: "profile_location_info",
    fields: ["residing_country", "preferred_branch"],
    weight: 4,
  },
  {
    table: "profile_contact_info",
    fields: [
      "residential_phone_number",
      "secondary_mobile_number",
      "preferred_call_time",
      "alternate_email_id",
      "reference_name",
    ],
    weight: 4,
  },
  {
    table: "profile_contact_info",
    fields: ["present_address", "present_pin_zip_code"],
    weight: 3,
  },
  {
    table: "profile_contact_info",
    fields: ["permanent_address", "permanent_pin_zip_code"],
    weight: 4,
  },

  // Partner Preferences (Slice 2B — 10%)
  // Photos (Slice 2C — 10%)
  // ID Proof (Slice 2C — 5%)
  // These will be added in their respective slices
];

const BASE_COMPLETION = 40; // from mandatory registration

export async function calculateProfileCompletion(
  profileId: string
): Promise<number> {
  const supabase = createClient();
  let earned = 0;

  // Group sections by table to minimize queries
  const tableGroups = new Map<string, { fields: string[]; weight: number }[]>();
  for (const section of SECTIONS) {
    const existing = tableGroups.get(section.table) ?? [];
    existing.push({ fields: section.fields, weight: section.weight });
    tableGroups.set(section.table, existing);
  }

  for (const [table, sections] of tableGroups) {
    // Collect all fields needed from this table
    const allFields = sections.flatMap((s) => s.fields);
    const uniqueFields = [...new Set(allFields)];

    const { data } = await supabase
      .from(table)
      .select(uniqueFields.join(", "))
      .eq("profile_id", profileId)
      .single();

    if (!data) continue;

    for (const section of sections) {
      const filledCount = section.fields.filter((field) => {
        const value = (data as unknown as Record<string, unknown>)[field];
        if (value === null || value === undefined || value === "") return false;
        if (typeof value === "number" && value === 0) return false;
        return true;
      }).length;

      if (filledCount > 0) {
        const ratio = filledCount / section.fields.length;
        earned += Math.round(section.weight * ratio);
      }
    }
  }

  return Math.min(BASE_COMPLETION + earned, 100);
}
