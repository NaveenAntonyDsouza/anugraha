"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";
import { countryList } from "@/lib/reference-data";

const ALL_COUNTRIES = countryList.flatMap((group) => group.options).filter((c) => c !== "India");

const BASE = "/my-home/search/discover-profiles/nri-matrimony";

export default function NriMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="NRI Matrimony"
      subcategories={ALL_COUNTRIES.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      currentCategoryHref={BASE}
      showSearch
    />
  );
}
