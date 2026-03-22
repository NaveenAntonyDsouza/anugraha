"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";
import { jamathList } from "@/lib/reference-data";

const SECTS = ["Sunni", "Shia"];
const SUBCATEGORIES = [...SECTS, ...jamathList];

const BASE = "/my-home/search/discover-profiles/muslim-matrimony";

export default function MuslimMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Muslim Matrimony"
      subcategories={SUBCATEGORIES.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      showSearch={false}
      currentCategoryHref={BASE}
    />
  );
}
