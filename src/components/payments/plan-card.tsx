"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanFeatures {
  view_contacts: number;
  daily_contacts: number;
  interest_per_day: number;
  personalized_messages: boolean;
  personalised_support_branch: boolean;
  dedicated_personal_adviser: boolean;
  featured_profile_search: boolean;
  email_mobile_alert: boolean;
  search_express_interest: boolean;
  daily_match_alert: boolean;
  customer_care_support: boolean;
  profile_filter_facility: boolean;
}

export interface MembershipPlan {
  id: string;
  plan_name: string;
  plan_slug: string;
  duration_months: number;
  price_inr: number;
  original_price_inr: number | null;
  features: PlanFeatures;
  is_active: boolean;
  display_order: number;
}

interface PlanCardProps {
  plan: MembershipPlan;
  isCurrentPlan: boolean;
  expiryDate?: string | null;
  onUpgrade: (planId: string) => void;
  buttonColor: string;
}

const BUTTON_COLORS: Record<string, string> = {
  "diamond-plus": "bg-emerald-500 hover:bg-emerald-600",
  diamond: "bg-[#8B1D91] hover:bg-[#7A1A80]",
  gold: "bg-pink-500 hover:bg-pink-600",
  celestial: "bg-[#1E1E3F] hover:bg-[#2A2A50]",
};

export function PlanCard({
  plan,
  isCurrentPlan,
  expiryDate,
  onUpgrade,
  buttonColor,
}: PlanCardProps) {
  const features = plan.features;
  const colorClass = BUTTON_COLORS[plan.plan_slug] ?? buttonColor;

  return (
    <div
      className={`border rounded-xl p-5 flex flex-col ${
        isCurrentPlan ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
    >
      {isCurrentPlan && (
        <div className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full self-start mb-3">
          Current Plan
        </div>
      )}

      <h3 className="text-lg font-bold">{plan.plan_name}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Get {plan.duration_months} Months Access
      </p>

      <div className="mt-4">
        {plan.original_price_inr && plan.original_price_inr > plan.price_inr && (
          <span className="text-sm text-muted-foreground line-through mr-2">
            ₹{plan.original_price_inr.toLocaleString("en-IN")}
          </span>
        )}
        <span className="text-2xl font-bold">
          ₹{plan.price_inr.toLocaleString("en-IN")}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        Taxes extra as applicable
      </p>

      {isCurrentPlan && expiryDate ? (
        <div className="mt-4 text-sm text-muted-foreground">
          Expires: {new Date(expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
      ) : (
        <Button
          className={`mt-4 text-white ${colorClass}`}
          onClick={() => onUpgrade(plan.id)}
        >
          UPGRADE
        </Button>
      )}

      {/* Feature highlights */}
      <div className="mt-4 pt-4 border-t space-y-2">
        <FeatureRow
          label={`View Contacts: ${features.view_contacts} Nos`}
          available={features.view_contacts > 0}
        />
        <FeatureRow
          label={`Daily contacts view: ${features.daily_contacts}/Day`}
          available={features.daily_contacts > 0}
        />
        <FeatureRow
          label="Dedicated Personal Adviser"
          available={features.dedicated_personal_adviser}
        />
      </div>
    </div>
  );
}

function FeatureRow({ label, available }: { label: string; available: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {available ? (
        <Check className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <X className="h-4 w-4 text-red-400 shrink-0" />
      )}
      <span className={available ? "" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

// ─── Compare Plans Table ────────────────────────────────────────────
interface ComparePlansTableProps {
  plans: MembershipPlan[];
  onUpgrade: (planId: string) => void;
  currentPlanId?: string | null;
}

const FEATURE_ROWS: { key: string; label: string; format: (f: PlanFeatures) => string }[] = [
  { key: "duration", label: "Duration", format: (f) => `${f.view_contacts > 0 ? "" : "30 Days"}` },
  { key: "view_contacts", label: "View Contacts", format: (f) => f.view_contacts > 0 ? `${f.view_contacts} Nos` : "✗" },
  { key: "daily_contacts", label: "Daily Limit to Access Contact Details", format: (f) => f.daily_contacts > 0 ? `${f.daily_contacts} Details/Day` : "✗" },
  { key: "interest_per_day", label: "Interest Message", format: (f) => `${f.interest_per_day} Nos/Day` },
  { key: "personalized_messages", label: "Write Personalized Messages", format: (f) => f.personalized_messages ? "✓" : "✗" },
  { key: "personalised_support_branch", label: "Personalised support (Branch)", format: (f) => f.personalised_support_branch ? "✓" : "✗" },
  { key: "dedicated_personal_adviser", label: "Dedicated Personal Adviser", format: (f) => f.dedicated_personal_adviser ? "✓" : "✗" },
  { key: "featured_profile_search", label: "Featured Profile in Search (Once in 3 months)", format: (f) => f.featured_profile_search ? "✓" : "✗" },
  { key: "email_mobile_alert", label: "Email & Mobile Alert", format: (f) => f.email_mobile_alert ? "✓" : "✗" },
  { key: "search_express_interest", label: "Search & Express Interest in members", format: (f) => f.search_express_interest ? "✓" : "✗" },
  { key: "daily_match_alert", label: "Get Daily Match Alert", format: (f) => f.daily_match_alert ? "✓" : "✗" },
  { key: "customer_care_support", label: "Customer Care Support", format: (f) => f.customer_care_support ? "✓" : "✗" },
  { key: "profile_filter_facility", label: "Profile Filter Facility", format: (f) => f.profile_filter_facility ? "✓" : "✗" },
];

const FREE_VALUES: Record<string, string> = {
  duration: "30 Days",
  view_contacts: "✗",
  daily_contacts: "✗",
  interest_per_day: "5 Nos/Day",
  personalized_messages: "✗",
  personalised_support_branch: "✗",
  dedicated_personal_adviser: "✗",
  featured_profile_search: "✗",
  email_mobile_alert: "✓",
  search_express_interest: "✓",
  daily_match_alert: "✓",
  customer_care_support: "✗",
  profile_filter_facility: "✗",
};

export function ComparePlansTable({ plans, onUpgrade, currentPlanId }: ComparePlansTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-3 min-w-[200px]">Feature</th>
            <th className="text-center py-3 px-2 min-w-[100px]">Active Free</th>
            {plans.map((p) => (
              <th key={p.id} className="text-center py-3 px-2 min-w-[120px]">
                {p.plan_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_ROWS.map((row) => (
            <tr key={row.key} className="border-b hover:bg-muted/30">
              <td className="py-2.5 px-3 text-muted-foreground">{row.label}</td>
              <td className="py-2.5 px-2 text-center">
                <CellValue value={FREE_VALUES[row.key]} />
              </td>
              {plans.map((p) => {
                const val = row.key === "duration" ? `${p.duration_months} Months` : row.format(p.features);
                return (
                  <td key={p.id} className="py-2.5 px-2 text-center">
                    <CellValue value={val} />
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Upgrade buttons row */}
          <tr>
            <td className="py-4 px-3" />
            <td className="py-4 px-2 text-center text-xs text-muted-foreground">
              Current
            </td>
            {plans.map((p) => (
              <td key={p.id} className="py-4 px-2 text-center">
                {currentPlanId === p.id ? (
                  <span className="text-xs text-primary font-medium">Active</span>
                ) : (
                  <Button size="sm" onClick={() => onUpgrade(p.id)}>
                    UPGRADE
                  </Button>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CellValue({ value }: { value: string }) {
  if (value === "✓") return <Check className="h-4 w-4 text-green-500 mx-auto" />;
  if (value === "✗") return <X className="h-4 w-4 text-red-400 mx-auto" />;
  return <span>{value}</span>;
}
