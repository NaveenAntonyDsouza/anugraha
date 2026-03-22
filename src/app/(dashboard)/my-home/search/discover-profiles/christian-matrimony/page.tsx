"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";

const SUBCATEGORIES = [
  "Anglican Church of India",
  "Chaldean Christian",
  "CSI Christian",
  "Jacobite",
  "Knanaya Jacobite",
  "Malabar Independent Syrian Church",
  "Orthodox",
  "Marthomite",
];

const BASE = "/my-home/search/discover-profiles/christian-matrimony";

export default function ChristianMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Christian Matrimony"
      subcategories={SUBCATEGORIES.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      currentCategoryHref={BASE}
    />
  );
}
