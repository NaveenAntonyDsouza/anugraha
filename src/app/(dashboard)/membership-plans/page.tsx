"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { PlanCard, ComparePlansTable, type MembershipPlan } from "@/components/payments/plan-card";
import { RazorpayCheckout } from "@/components/payments/razorpay-checkout";
import { CurrentPlanBanner } from "@/components/payments/current-plan-banner";
import { PaymentSuccessModal } from "@/components/payments/payment-success-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MembershipPlansPage() {
  const { profile } = useAuthStore();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMembership, setCurrentMembership] = useState<{
    plan_id: string;
    end_date: string;
    plan_name: string;
  } | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlanName, setSuccessPlanName] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchPlans();
    fetchCurrentMembership();

    // Check for success redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      window.history.replaceState({}, "", "/membership-plans");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPlans() {
    const { data, error } = await supabase
      .from("membership_plans")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to load membership plans");
      setLoading(false);
      return;
    }

    setPlans(data ?? []);
    setLoading(false);
  }

  async function fetchCurrentMembership() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("user_memberships")
      .select("plan_id, end_date, membership_plans(plan_name)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("end_date", new Date().toISOString())
      .order("end_date", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      const planData = data.membership_plans as unknown as { plan_name: string } | null;
      setCurrentMembership({
        plan_id: data.plan_id,
        end_date: data.end_date,
        plan_name: planData?.plan_name ?? "Premium",
      });
    }
  }

  function handleUpgrade(planId: string) {
    setSelectedPlanId(planId);
  }

  function handlePaymentSuccess() {
    const plan = plans.find((p) => p.id === selectedPlanId);
    setSuccessPlanName(plan?.plan_name ?? "Premium");
    setSelectedPlanId(null);
    setShowSuccess(true);
    fetchCurrentMembership();
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);
  const prefill = profile
    ? {
        name: profile.full_name,
        email: profile.email_id,
        contact: profile.primary_mobile_number,
      }
    : undefined;

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-64 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      {/* Promo Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white text-center rounded-lg px-4 py-3 mb-6">
        <p className="text-sm font-medium">
          Special Offer — Upgrade now and get premium features at discounted prices!
        </p>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-center mb-2">
        Upgrade and enjoy added benefits
      </h1>
      <p className="text-center text-muted-foreground mb-8">
        Choose the plan that suits you best
      </p>

      {/* Current Plan Banner */}
      {currentMembership && (
        <CurrentPlanBanner
          planName={currentMembership.plan_name}
          expiresAt={currentMembership.end_date}
        />
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentMembership?.plan_id === plan.id}
            expiryDate={
              currentMembership?.plan_id === plan.id
                ? currentMembership.end_date
                : null
            }
            onUpgrade={handleUpgrade}
            buttonColor="bg-primary hover:bg-primary/90"
          />
        ))}
      </div>

      {/* Compare Plans Toggle */}
      <div className="border rounded-xl">
        <button
          onClick={() => setCompareOpen(!compareOpen)}
          className="w-full flex items-center justify-center gap-2 py-4 text-sm font-semibold hover:bg-muted/50 transition-colors rounded-xl"
        >
          Compare Plans
          {compareOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {compareOpen && (
          <div className="px-4 pb-4">
            <ComparePlansTable
              plans={plans}
              onUpgrade={handleUpgrade}
              currentPlanId={currentMembership?.plan_id}
            />
          </div>
        )}
      </div>

      {/* Razorpay Checkout (hidden — triggered by selecting a plan) */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl p-6 max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-bold">
              Upgrade to {selectedPlan.plan_name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {selectedPlan.duration_months} months access for ₹
              {selectedPlan.price_inr.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">
              Taxes extra as applicable
            </p>
            <RazorpayCheckout
              planId={selectedPlan.id}
              planName={selectedPlan.plan_name}
              prefill={prefill}
              onSuccess={handlePaymentSuccess}
              buttonLabel="Pay Now"
              buttonClassName="w-full"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSelectedPlanId(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      <PaymentSuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        planName={successPlanName}
      />
    </div>
  );
}
