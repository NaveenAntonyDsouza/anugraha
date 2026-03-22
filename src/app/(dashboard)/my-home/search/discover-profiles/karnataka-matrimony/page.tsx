"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";
import { karnatakaDistrictList } from "@/lib/reference-data";

const BASE = "/my-home/search/discover-profiles/karnataka-matrimony";

export default function KarnatakaMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Karnataka Matrimony"
      subcategories={karnatakaDistrictList.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      currentCategoryHref={BASE}
      showSearch
    />
  );
}
