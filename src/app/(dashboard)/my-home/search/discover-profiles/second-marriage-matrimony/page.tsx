"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";

const SUBCATEGORIES = [
  "Annulled",
  "Awaiting Divorcee",
  "Divorcee",
  "Widow",
];

const BASE = "/my-home/search/discover-profiles/second-marriage-matrimony";

export default function SecondMarriageMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Second Marriage Matrimony"
      subcategories={SUBCATEGORIES.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      currentCategoryHref={BASE}
    />
  );
}
