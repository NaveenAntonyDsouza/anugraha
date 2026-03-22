import { z } from "zod/v4";

export const stepTwoSchema = z.object({
  height: z.string().min(1, "Height is required"),
  complexion: z.string().min(1, "Complexion is required"),
  body_type: z.string().min(1, "Body type is required"),
  physical_status: z.string().min(1, "Physical status is required"),
  category_differently_abled: z.array(z.string()).optional(),
  differently_abled_describe: z.string().optional(),
  differently_abled_specify: z.string().optional(),
  marital_status: z.string().min(1, "Marital status is required"),
  children_with_me: z.number().int().min(0).optional(),
  children_not_with_me: z.number().int().min(0).optional(),
  family_status: z.string().min(1, "Family status is required"),

  // Religion fields
  religion: z.string().min(1, "Religion is required"),
  // Christian
  denomination: z.string().optional(),
  diocese: z.string().optional(),
  diocese_name: z.string().optional(),
  parish_name_place: z.string().optional(),
  // Hindu / Jain
  caste_community: z.string().optional(),
  sub_caste_community: z.string().optional(),
  time_of_birth: z.string().optional(),
  place_of_birth: z.string().optional(),
  rasi: z.string().optional(),
  nakshatra: z.string().optional(),
  gothram: z.string().optional(),
  manglik: z.string().optional(),
  jathakam_upload_url: z.string().optional(),
  // Muslim
  muslim_sect: z.string().optional(),
  muslim_community: z.string().optional(),
  religious_observance: z.string().optional(),
  // Jain
  jain_sect: z.string().optional(),
  // Other
  other_religion_name: z.string().optional(),
});

export type StepTwoFormData = z.infer<typeof stepTwoSchema>;
