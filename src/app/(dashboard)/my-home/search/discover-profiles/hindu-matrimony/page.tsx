"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";
import { casteList } from "@/lib/reference-data";

const BASE = "/my-home/search/discover-profiles/hindu-matrimony";

export default function HinduMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Hindu Matrimony"
      subcategories={casteList.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      showSearch={true}
      currentCategoryHref={BASE}
    />
  );
}
