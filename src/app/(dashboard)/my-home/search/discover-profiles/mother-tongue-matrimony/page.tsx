"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";

const SUBCATEGORIES = [
  "Kannada",
  "Konkani",
  "Tamil",
  "Telugu",
  "Hindi",
  "Tulu",
];

const BASE = "/my-home/search/discover-profiles/mother-tongue-matrimony";

export default function MotherTongueMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Mother Tongue Matrimony"
      subcategories={SUBCATEGORIES.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      showSearch={false}
      currentCategoryHref={BASE}
    />
  );
}
