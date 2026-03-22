"use client";

import { SubcategoryListPage } from "@/components/discover/subcategory-list-page";
import { toSlug } from "@/lib/search/slug-utils";
import { jainSectList } from "@/lib/reference-data";

const BASE = "/my-home/search/discover-profiles/jain-matrimony";

export default function JainMatrimonyPage() {
  return (
    <SubcategoryListPage
      title="Jain Matrimony"
      subcategories={jainSectList.map((s) => ({
        label: s + " Brides",
        href: `${BASE}/${toSlug(s)}`,
      }))}
      showSearch={false}
      currentCategoryHref={BASE}
    />
  );
}
