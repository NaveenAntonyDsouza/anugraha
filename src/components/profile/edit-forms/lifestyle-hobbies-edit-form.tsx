"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionEditForm } from "@/components/profile/section-edit-form";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import {
  eatingHabitsList,
  drinkingHabitsList,
  smokingHabitsList,
  culturalBackgroundList,
  hobbiesList,
  musicList,
  booksList,
  moviesList,
  sportsList,
  cuisineList,
  spokenLanguagesList,
} from "@/lib/reference-data";

const schema = z.object({
  eating_habits: z.string().optional(),
  drinking_habits: z.string().optional(),
  smoking_habits: z.string().optional(),
  cultural_background: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  favorite_music: z.array(z.string()).optional(),
  preferred_books: z.array(z.string()).optional(),
  preferred_movies: z.array(z.string()).optional(),
  sports_fitness_games: z.array(z.string()).optional(),
  favorite_cuisine: z.array(z.string()).optional(),
  spoken_languages: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

function CheckboxGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={(e) => {
                onChange(
                  e.target.checked
                    ? [...selected, opt]
                    : selected.filter((s) => s !== opt)
                );
              }}
              className="rounded border-input"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function LifestyleHobbiesEditForm() {
  const router = useRouter();
  const supabase = createClient();
  const profile = useAuthStore((s) => s.profile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hobbies: [],
      favorite_music: [],
      preferred_books: [],
      preferred_movies: [],
      sports_fitness_games: [],
      favorite_cuisine: [],
      spoken_languages: [],
    },
  });

  useEffect(() => {
    async function load() {
      if (!profile) return;
      const { data } = await supabase
        .from("profile_lifestyle_hobbies")
        .select("*")
        .eq("profile_id", profile.id)
        .single();
      if (data) {
        form.reset({
          eating_habits: data.eating_habits ?? "",
          drinking_habits: data.drinking_habits ?? "",
          smoking_habits: data.smoking_habits ?? "",
          cultural_background: data.cultural_background ?? "",
          hobbies: data.hobbies ?? [],
          favorite_music: data.favorite_music ?? [],
          preferred_books: data.preferred_books ?? [],
          preferred_movies: data.preferred_movies ?? [],
          sports_fitness_games: data.sports_fitness_games ?? [],
          favorite_cuisine: data.favorite_cuisine ?? [],
          spoken_languages: data.spoken_languages ?? [],
        });
      }
      setLoading(false);
    }
    load();
  }, [profile, supabase, form]);

  async function onSave() {
    const valid = await form.trigger();
    if (!valid || !profile) return;
    setSaving(true);

    const values = form.getValues();
    const { error } = await supabase
      .from("profile_lifestyle_hobbies")
      .upsert(
        { profile_id: profile.id, ...values },
        { onConflict: "profile_id" }
      );

    if (error) {
      toast.error("Failed to save. Please try again.");
      setSaving(false);
      return;
    }

    const pct = await calculateProfileCompletion(profile.id);
    await supabase.from("profiles").update({ profile_completion_pct: pct }).eq("id", profile.id);

    toast.success("Hobbies & interests saved.");
    setSaving(false);
    router.push("/my-home/view-and-edit/lifestyle-hobbies");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SectionEditForm
      title="Edit Hobbies & Interests"
      breadcrumb="Hobbies & Interests"
      cancelHref="/my-home/view-and-edit/lifestyle-hobbies"
      saving={saving}
      onSave={onSave}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Eating Habits</label>
          <select {...form.register("eating_habits")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select</option>
            {eatingHabitsList.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Drinking Habits</label>
          <select {...form.register("drinking_habits")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select</option>
            {drinkingHabitsList.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Smoking Habits</label>
          <select {...form.register("smoking_habits")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select</option>
            {smokingHabitsList.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Cultural Background</label>
          <select {...form.register("cultural_background")} className="w-full h-10 border border-input rounded-lg px-3 text-sm bg-white">
            <option value="">Select</option>
            {culturalBackgroundList.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="my-4 border-t border-input" />

      <div className="space-y-6">
        <CheckboxGroup
          label="Hobbies"
          options={hobbiesList}
          selected={form.watch("hobbies") ?? []}
          onChange={(v) => form.setValue("hobbies", v)}
        />
        <CheckboxGroup
          label="Favorite Music"
          options={musicList}
          selected={form.watch("favorite_music") ?? []}
          onChange={(v) => form.setValue("favorite_music", v)}
        />
        <CheckboxGroup
          label="Preferred Books"
          options={booksList}
          selected={form.watch("preferred_books") ?? []}
          onChange={(v) => form.setValue("preferred_books", v)}
        />
        <CheckboxGroup
          label="Preferred Movies"
          options={moviesList}
          selected={form.watch("preferred_movies") ?? []}
          onChange={(v) => form.setValue("preferred_movies", v)}
        />
        <CheckboxGroup
          label="Sports & Fitness"
          options={sportsList}
          selected={form.watch("sports_fitness_games") ?? []}
          onChange={(v) => form.setValue("sports_fitness_games", v)}
        />
        <CheckboxGroup
          label="Favorite Cuisine"
          options={cuisineList}
          selected={form.watch("favorite_cuisine") ?? []}
          onChange={(v) => form.setValue("favorite_cuisine", v)}
        />
        <CheckboxGroup
          label="Spoken Languages"
          options={spokenLanguagesList}
          selected={form.watch("spoken_languages") ?? []}
          onChange={(v) => form.setValue("spoken_languages", v)}
        />
      </div>
    </SectionEditForm>
  );
}
