"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";
import { dioceseList } from "@/lib/reference-data";

const BASE = "/my-home/search/discover-profiles/diocese-matrimony";

export default function DioceseMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Diocese Matrimony"
      subcategories={dioceseList.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      currentCategoryHref={BASE}
      showSearch
    />
  );
}
