import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCheckoutSession, createPortalSession } from "@/lib/actions/billing";
import { PLANS } from "@/lib/constants";
import { CreditCard, CheckCircle2, Zap } from "lucide-react";

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("subscription_tier, stripe_customer_id")
    .eq("id", user.id)
    .single();

  const tier = profile?.subscription_tier ?? "free";
  const isPro = tier === "pro";
  const currentPlan = isPro ? PLANS.PRO : PLANS.FREE;

  async function handleUpgrade() {
    "use server";
    const result = await createCheckoutSession();
    if (result.success) {
      redirect(result.data.url);
    }
  }

  async function handleManageBilling() {
    "use server";
    const result = await createPortalSession();
    if (result.success) {
      redirect(result.data.url);
    }
  }

  return (
    <AppShell
      title="Billing"
      user={{
        name: null,
        email: user.email ?? null,
        plan: tier,
      }}
    >
      <div className="space-y-8">
        {/* Current Plan Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold capitalize">{tier}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {isPro ? "$12/month" : "Free forever"}
                </p>
              </div>
              <Badge variant={isPro ? "default" : "outline"} className="px-3 py-1">
                {isPro ? "Active" : "Free"}
              </Badge>
            </div>

            {isPro && (
              <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 px-4 py-3">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Thanks for supporting MusicIncome.io! You have access to all features.
                </p>
              </div>
            )}

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Plan Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>
                    {currentPlan.limits.incomeEntries === Infinity
                      ? "Unlimited"
                      : `Up to ${currentPlan.limits.incomeEntries}`}{" "}
                    income entries
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>
                    {currentPlan.limits.statements === Infinity
                      ? "Unlimited"
                      : `Up to ${currentPlan.limits.statements}`}{" "}
                    statements
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>
                    {currentPlan.limits.connections === Infinity
                      ? "Unlimited"
                      : `Up to ${currentPlan.limits.connections}`}{" "}
                    connections
                  </span>
                </li>
                {currentPlan.features.exportData && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Export data (CSV/Excel)</span>
                  </li>
                )}
                {currentPlan.features.emailReports && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Email notifications</span>
                  </li>
                )}
                {currentPlan.features.autoSync && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Automatic nightly sync</span>
                  </li>
                )}
                {currentPlan.features.advancedAnalytics && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Advanced analytics</span>
                  </li>
                )}
                {currentPlan.features.prioritySupport && (
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Priority support</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t">
              {isPro ? (
                <form action={handleManageBilling}>
                  <Button type="submit" variant="secondary">
                    Manage Billing & Subscription
                  </Button>
                </form>
              ) : (
                <form action={handleUpgrade}>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Zap className="mr-2 h-4 w-4" />
                    Upgrade to Pro — ${PLANS.PRO.price}/mo
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Card (for Free users) */}
        {!isPro && (
          <Card className="max-w-2xl border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Upgrade to Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Get unlimited everything and support the development of MusicIncome.io
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(PLANS.PRO.features)
                  .filter(([_, enabled]) => enabled)
                  .map(([feature]) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm"
                    >
                      <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      <span className="capitalize">
                        {feature.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}


