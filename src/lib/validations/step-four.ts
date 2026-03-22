import { z } from "zod/v4";

export const stepFourSchema = z.object({
  native_country: z.string().min(1, "Native country is required"),
  native_state: z.string().optional(),
  native_district: z.string().optional(),
  whatsapp_number: z.string().optional(),
  whatsapp_country_code: z.string().min(1, "Country code is required"),
  mobile_number: z.string().optional(), // pre-filled, read-only
  mobile_country_code: z.string().min(1, "Country code is required"),
  custodian_name: z.string().min(1, "Custodian name is required"),
  custodian_relation: z.string().min(1, "Custodian relation is required"),
  communication_address: z
    .string()
    .min(1, "Communication address is required")
    .max(200, "Address must be under 200 characters"),
  pin_zip_code: z.string().min(1, "PIN/ZIP code is required"),
});

export type StepFourFormData = z.infer<typeof stepFourSchema>;
