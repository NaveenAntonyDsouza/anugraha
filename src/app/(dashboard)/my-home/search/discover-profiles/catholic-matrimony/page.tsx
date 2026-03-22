"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";

const SUBCATEGORIES = [
  "Anglo Indian",
  "Cheramar Christian",
  "Knanaya Catholic",
  "Latin Catholic",
  "Malankara Catholic",
  "Nadar Christian",
  "Syrian Catholic",
];

const BASE = "/my-home/search/discover-profiles/catholic-matrimony";

export default function CatholicMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Catholic Matrimony"
      subcategories={SUBCATEGORIES.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      currentCategoryHref={BASE}
    />
  );
}
