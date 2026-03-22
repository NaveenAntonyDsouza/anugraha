"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { AddonCard } from "@/components/payments/addon-card";
import { PaymentSuccessModal } from "@/components/payments/payment-success-modal";

const ADDONS = [
  {
    id: "addon_highlight",
    name: "Highlight My Profile",
    description:
      "Your profile appears in the \"Featured\" section on the homepage and discover pages. Stand out from the crowd with a ✨ Featured badge.",
    price: 500,
    duration: "30 days",
    icon: "highlight" as const,
  },
  {
    id: "addon_photo_boost",
    name: "Photo Boost",
    description:
      "Your profile photo appears more prominently in search results for 7 days. Get more visibility and attract more interest.",
    price: 200,
    duration: "7 days",
    icon: "photo-boost" as const,
  },
];

export default function AddonsPackagesPage() {
  const { profile } = useAuthStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAddonName, setSuccessAddonName] = useState("");

  const prefill = profile
    ? {
        name: profile.full_name,
        email: profile.email_id,
        contact: profile.primary_mobile_number,
      }
    : undefined;

  function handleSuccess(addonName: string) {
    setSuccessAddonName(addonName);
    setShowSuccess(true);
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-center mb-2">Add-on Packages</h1>
      <p className="text-center text-muted-foreground mb-8">
        Boost your profile visibility with these add-on features
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {ADDONS.map((addon) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            prefill={prefill}
            onSuccess={() => handleSuccess(addon.name)}
          />
        ))}
      </div>

      <PaymentSuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        planName={successAddonName}
      />
    </div>
  );
}
