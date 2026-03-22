import { createClient } from "@/lib/supabase/client";

const FREE_DAILY_LIMIT = 5;
const FREE_MONTHLY_LIMIT = 50;

function getTodayIST(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split("T")[0];
}

export async function getDailyUsage(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<{ sentCount: number; remaining: number; monthlyCount: number }> {
  const today = getTodayIST();

  const { data } = await supabase
    .from("daily_interest_usage")
    .select("sent_count, monthly_count")
    .eq("user_id", userId)
    .eq("usage_date", today)
    .maybeSingle();

  const sentCount = data?.sent_count ?? 0;
  const monthlyCount = data?.monthly_count ?? 0;

  return {
    sentCount,
    remaining: Math.max(0, FREE_DAILY_LIMIT - sentCount),
    monthlyCount,
  };
}

export function getRemainingColor(remaining: number): string {
  if (remaining >= 4) return "text-green-600";
  if (remaining >= 2) return "text-amber-600";
  if (remaining >= 1) return "text-red-600";
  return "text-muted-foreground";
}

export { FREE_DAILY_LIMIT, FREE_MONTHLY_LIMIT };
