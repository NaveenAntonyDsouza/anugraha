import { z } from "zod/v4";

export const stepThreeSchema = z.object({
  educational_qualifications: z.string().min(1, "Educational qualification is required"),
  education_level: z.string().min(1, "Education level is required"),
  occupation_category: z.string().min(1, "Occupation category is required"),
  employment_category: z.string().min(1, "Employment category is required"),
  working_country: z.string().min(1, "Working country is required"),
  working_state: z.string().optional(),
  working_district: z.string().optional(),
  annual_income: z.string().min(1, "Annual income is required"),
});

export type StepThreeFormData = z.infer<typeof stepThreeSchema>;
