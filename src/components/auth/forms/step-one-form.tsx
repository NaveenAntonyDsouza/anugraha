"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { stepOneSchema, type StepOneFormData } from "@/lib/validations/step-one";
import { createClient } from "@/lib/supabase/client";
import { PhoneInput } from "@/components/auth/phone-input";

export function StepOneForm() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StepOneFormData>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      country_code: "+91",
    },
  });

  const dob = watch("date_of_birth");
  const phone = watch("primary_mobile_number");
  const countryCode = watch("country_code");

  const calculateAge = (dateStr: string) => {
    if (!dateStr) return null;
    const dob = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(dob);

  const onSubmit = async (data: StepOneFormData) => {
    setLoading(true);
    try {
      // Create Supabase auth user with email + password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email_id,
        password: data.password,
        phone: `${data.country_code}${data.primary_mobile_number}`,
      });

      if (authError) {
        if (authError.status === 429) {
          throw new Error("Too many signup attempts. Please wait a few minutes and try again.");
        }
        throw authError;
      }
      if (!authData.user) throw new Error("Failed to create account");

      // Small delay to allow the DB trigger (handle_new_auth_user) to create the public.users row
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Create profile row (retry once if trigger hasn't completed)
      let profileError;
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = await supabase.from("profiles").insert({
          user_id: authData.user.id,
          full_name: data.full_name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          primary_mobile_number: `${data.country_code}${data.primary_mobile_number}`,
          email_id: data.email_id,
          onboarding_step_completed: 1,
        });
        profileError = result.error;
        if (!profileError) break;
        // Wait before retry
        if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (profileError) throw profileError;

      toast.success("Account created successfully!");
      router.push("/register-free/step-two");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Full Name <span className="text-destructive">*</span>
        </label>
        <input
          {...register("full_name")}
          placeholder="Enter your full name"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.full_name ? "border-destructive" : "border-input"
          )}
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Gender <span className="text-destructive">*</span>
        </label>
        <div className="flex gap-4">
          {(["Male", "Female"] as const).map((g) => (
            <label
              key={g}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                value={g}
                {...register("gender")}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm">{g}</span>
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="mt-1 text-sm text-destructive">{errors.gender.message}</p>
        )}
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Date of Birth <span className="text-destructive">*</span>
        </label>
        <input
          type="date"
          {...register("date_of_birth")}
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
            .toISOString()
            .split("T")[0]}
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.date_of_birth ? "border-destructive" : "border-input"
          )}
        />
        {age !== null && age >= 18 && (
          <p className="mt-1 text-sm text-muted-foreground">
            Age: {age} years
          </p>
        )}
        {errors.date_of_birth && (
          <p className="mt-1 text-sm text-destructive">{errors.date_of_birth.message}</p>
        )}
      </div>

      {/* Primary Mobile Number */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Primary Mobile Number <span className="text-destructive">*</span>
        </label>
        <PhoneInput
          value={phone || ""}
          onChange={(val) => setValue("primary_mobile_number", val, { shouldValidate: true })}
          countryCode={countryCode || "+91"}
          onCountryCodeChange={(code) => setValue("country_code", code)}
          error={errors.primary_mobile_number?.message}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Email ID <span className="text-destructive">*</span>
        </label>
        <input
          type="email"
          {...register("email_id")}
          placeholder="Enter your email"
          className={cn(
            "w-full h-11 px-3 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
            errors.email_id ? "border-destructive" : "border-input"
          )}
        />
        {errors.email_id && (
          <p className="mt-1 text-sm text-destructive">{errors.email_id.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Create Password <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password")}
            placeholder="Min 6, Max 14 characters"
            className={cn(
              "w-full h-11 px-3 pr-10 border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.password ? "border-destructive" : "border-input"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        REGISTER FREE
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a href="/login" className="text-primary font-semibold hover:underline">
          LOGIN
        </a>
      </p>
    </form>
  );
}
