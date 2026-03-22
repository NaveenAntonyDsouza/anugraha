"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";

const SUBCATEGORIES = [
  "Latin Catholic",
  "Syrian Catholic",
  "Knanaya Catholic",
  "Nadar Christian",
  "Cheramar Christian",
  "Anglo Indian",
  "Malankara Catholic",
];

const BASE = "/my-home/search/discover-profiles/community-matrimony";

export default function CommunityMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Community Matrimony"
      subcategories={SUBCATEGORIES.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      showSearch={false}
      currentCategoryHref={BASE}
    />
  );
}
