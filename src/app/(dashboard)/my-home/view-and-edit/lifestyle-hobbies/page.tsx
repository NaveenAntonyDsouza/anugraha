import { getMyProfileData } from "@/lib/profile-data";
import { SectionViewCard } from "@/components/profile/section-view-card";
import { DetailRow } from "@/components/profile/detail-row";
import { TagPillRow } from "@/components/profile/tag-pill";

export default async function LifestyleHobbiesPage() {
  const profile = await getMyProfileData();
  const info = Array.isArray(profile.profile_lifestyle_hobbies)
    ? profile.profile_lifestyle_hobbies[0]
    : profile.profile_lifestyle_hobbies;

  return (
    <SectionViewCard title="Hobbies & Interests" editHref="/my-home/view-and-edit/lifestyle-hobbies-edit">
      <DetailRow label="Eating Habits" value={info?.eating_habits} />
      <DetailRow label="Drinking Habits" value={info?.drinking_habits} />
      <DetailRow label="Smoking Habits" value={info?.smoking_habits} />
      <DetailRow label="Cultural Background" value={info?.cultural_background} />

      <div className="my-2 border-t border-input" />

      <TagPillRow label="Hobbies" values={info?.hobbies} />
      <TagPillRow label="Favorite Music" values={info?.favorite_music} />
      <TagPillRow label="Preferred Books" values={info?.preferred_books} />
      <TagPillRow label="Preferred Movies" values={info?.preferred_movies} />
      <TagPillRow label="Sports & Fitness" values={info?.sports_fitness_games} />
      <TagPillRow label="Favorite Cuisine" values={info?.favorite_cuisine} />
      <TagPillRow label="Spoken Languages" values={info?.spoken_languages} />
    </SectionViewCard>
  );
}
