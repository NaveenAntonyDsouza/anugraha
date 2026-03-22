"use client";

import { Sparkles, ImageUp } from "lucide-react";
import { RazorpayCheckout } from "./razorpay-checkout";

interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: "highlight" | "photo-boost";
}

interface AddonCardProps {
  addon: Addon;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: () => void;
}

const ICONS = {
  highlight: Sparkles,
  "photo-boost": ImageUp,
};

export function AddonCard({ addon, prefill, onSuccess }: AddonCardProps) {
  const Icon = ICONS[addon.icon];

  return (
    <div className="border rounded-xl p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{addon.name}</h3>
          <p className="text-xs text-muted-foreground">{addon.duration}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground flex-1">{addon.description}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <span className="text-xl font-bold">₹{addon.price.toLocaleString("en-IN")}</span>
        <RazorpayCheckout
          planId={addon.id}
          planName={addon.name}
          prefill={prefill}
          onSuccess={onSuccess}
          buttonLabel="Buy Now"
        />
      </div>
    </div>
  );
}
