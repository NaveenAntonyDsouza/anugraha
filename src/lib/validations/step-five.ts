import { z } from "zod/v4";

export const stepFiveSchema = z.object({
  created_by: z.string().min(1, "Please select who created this profile"),
  creator_name: z.string().min(1, "Creator name is required"),
  creator_contact_number: z
    .string()
    .min(7, "Please enter a valid contact number")
    .regex(/^\d+$/, "Contact number must contain only digits"),
  creator_contact_country_code: z.string().min(1, "Country code is required"),
  how_did_you_hear_about_us: z.string().min(1, "Please tell us how you heard about us"),
});

export type StepFiveFormData = z.infer<typeof stepFiveSchema>;
