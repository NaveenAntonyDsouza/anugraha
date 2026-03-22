"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";
import { occupationCategoryList } from "@/lib/reference-data";

const ALL_OCCUPATIONS = occupationCategoryList.flatMap((group) => group.options);

const BASE = "/my-home/search/discover-profiles/occupation-matrimony";

export default function OccupationMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Occupation Matrimony"
      subcategories={ALL_OCCUPATIONS.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      currentCategoryHref={BASE}
      showSearch
    />
  );
}
