import { z } from "zod/v4";

export const stepOneSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .regex(/^[a-zA-Z\s.'-]+$/, "Name can only contain letters, spaces, dots, hyphens and apostrophes"),
  gender: z.enum(["Male", "Female"], { message: "Please select your gender" }),
  date_of_birth: z
    .string()
    .min(1, "Date of birth is required")
    .refine((val) => {
      const dob = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
        ? age - 1
        : age;
      return actualAge >= 18;
    }, "You must be at least 18 years old"),
  primary_mobile_number: z
    .string()
    .min(7, "Please enter a valid mobile number")
    .max(15, "Mobile number is too long")
    .regex(/^\d+$/, "Mobile number must contain only digits"),
  country_code: z.string().min(1, "Country code is required"),
  email_id: z
    .string()
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(14, "Password must be under 14 characters"),
});

export type StepOneFormData = z.infer<typeof stepOneSchema>;
