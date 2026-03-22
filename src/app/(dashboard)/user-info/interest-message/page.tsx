"use client";

import { Suspense } from "react";
import { InterestListView } from "@/components/communication/interest-list-view";

export default function InterestMessagePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <InterestListView />
    </Suspense>
  );
}
