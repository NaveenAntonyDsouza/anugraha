"use client";

import { use, Suspense } from "react";
import { InterestDetailView } from "@/components/communication/interest-detail-view";

export default function InterestDetailPage({
  params,
}: {
  params: Promise<{ anugraha_id: string }>;
}) {
  const { anugraha_id } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InterestDetailView anugrahaId={anugraha_id} />
    </Suspense>
  );
}
