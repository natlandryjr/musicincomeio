# 🚀 MusicIncome.io - Implementation Guide

## Quick Start

### 1. Generate Supabase Types (5 minutes)

```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Login to Supabase
supabase login

# Get your project ID from Supabase dashboard
# Then generate types:
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

**Then update imports:**
```typescript
// src/lib/db/income.ts
import type { Database } from "@/types/database.types";
export type IncomeEntry = Database['public']['Tables']['income_entries']['Row'];
```

---

### 2. Migrate Existing Components (30-60 minutes)

#### **Income Form Component**
**File:** `src/components/income/IncomeForm.tsx`

**Before:**
```typescript
const { data, error } = await supabase.from("income_entries").insert({...});
```

**After:**
```typescript
import { createIncomeEntry } from "@/lib/actions";
import { useToast } from "@/lib/hooks";

const { toast } = useToast();

const handleSubmit = async (formData) => {
  const result = await createIncomeEntry(formData);

  if (result.success) {
    toast.success("Income entry created!");
    // Reset form, refresh data, etc.
  } else {
    toast.error(result.error);
  }
};
```

#### **Income Table Component**
**File:** `src/components/income/IncomeTable.tsx`

**Before:**
```typescript
await supabase.from("income_entries").delete().eq("id", id);
```

**After:**
```typescript
import { deleteIncomeEntry } from "@/lib/actions";
import { useToast } from "@/lib/hooks";

const handleDelete = async (id: string) => {
  const result = await deleteIncomeEntry(id);

  if (result.success) {
    toast.success("Entry deleted!");
  } else {
    toast.error(result.error);
  }
};
```

#### **Onboarding Page**
**File:** `src/app/onboarding/page.tsx`

**Before:**
```typescript
await supabase.from("users").update({...});
// Manual redirect
router.push("/dashboard");
```

**After:**
```typescript
import { completeOnboarding } from "@/lib/actions";

const handleComplete = async (data) => {
  const result = await completeOnboarding(data);
  // Server action automatically redirects on success
};
```

#### **Dashboard Page**
**File:** `src/app/dashboard/page.tsx`

**Before:**
```typescript
const { data: entries } = await supabase.from("income_entries").select("*");
const total = entries.reduce((sum, e) => sum + e.amount, 0);
```

**After:**
```typescript
import { getTotalIncome, getIncomeBySource, getRecentIncomeEntries } from "@/lib/db";

const [total, bySource, recentEntries] = await Promise.all([
  getTotalIncome(user.id),
  getIncomeBySource(user.id),
  getRecentIncomeEntries(user.id, 5),
]);
```

---

### 3. Create Statement Archive Page (2-3 hours)

#### **Step 1: Create the route**
**File:** `src/app/(dashboard)/statements/page.tsx`

```typescript
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { StatementList } from "@/components/statements/StatementList";
import { StatementsSkeleton } from "@/components/statements/StatementsSkeleton";

export default async function StatementsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Statement Archive</h1>
        <p className="text-gray-600">Manage your imported royalty statements</p>
      </div>

      <Suspense fallback={<StatementsSkeleton />}>
        <StatementList userId={user.id} />
      </Suspense>
    </div>
  );
}
```

#### **Step 2: Create Statement Components**
**File:** `src/components/statements/StatementList.tsx`

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, RefreshCw } from "lucide-react";

export function StatementList({ userId }: { userId: string }) {
  const [statements, setStatements] = useState([]);

  // Fetch statements from raw_statements table
  // Display as cards with actions

  return (
    <div className="grid gap-4">
      {statements.map((statement) => (
        <Card key={statement.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{statement.label}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div>Provider: {statement.provider}</div>
              <div>Entries: {statement.parsed_entries_count}</div>
              <div>Imported: {new Date(statement.created_at).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### **Step 3: Add Server Actions**
**File:** `src/lib/actions/statements.ts`

```typescript
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteStatement(statementId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Delete statement
  const { error } = await supabase
    .from("raw_statements")
    .delete()
    .eq("id", statementId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/statements");
  return { success: true };
}

export async function reprocessStatement(statementId: string) {
  // Re-parse the CSV and update income_entries
  // Implementation depends on your raw_statements structure
}
```

---

### 4. Add Stripe Customer Portal (1 hour)

#### **Step 1: Create Server Action**
**File:** `src/lib/actions/billing.ts`

```typescript
"use server";

import Stripe from "stripe";
import { env } from "@/lib/validators/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function createCustomerPortalSession() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Get user's Stripe customer ID
  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return { success: false, error: "No Stripe customer found" };
  }

  // Create portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${env.NEXT_PUBLIC_APP_URL}${ROUTES.BILLING}`,
  });

  return { success: true, data: { url: session.url } };
}
```

#### **Step 2: Add Button to Billing Page**
**File:** `src/app/(dashboard)/billing/page.tsx`

```typescript
import { Button } from "@/components/ui/button";
import { createCustomerPortalSession } from "@/lib/actions/billing";

export default function BillingPage() {
  async function handleManageBilling() {
    "use server";
    const result = await createCustomerPortalSession();
    if (result.success) {
      redirect(result.data.url);
    }
  }

  return (
    <div>
      {/* ...existing billing UI... */}

      <form action={handleManageBilling}>
        <Button type="submit">Manage Billing</Button>
      </form>
    </div>
  );
}
```

---

### 5. Implement Nightly Gmail Sync (2 hours)

#### **Step 1: Create Cron Endpoint**
**File:** `src/app/api/cron/gmail-sync/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncGmailForUser } from "@/lib/sync/gmail";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = await createSupabaseServerClient();

  // Get all users with Gmail connected
  const { data: accounts } = await supabase
    .from("external_accounts")
    .select("user_id, access_token, refresh_token")
    .eq("provider", "gmail");

  const results = [];

  for (const account of accounts || []) {
    try {
      const result = await syncGmailForUser(
        account.user_id,
        account.access_token,
        account.refresh_token
      );
      results.push({ userId: account.user_id, success: true, ...result });
    } catch (error) {
      results.push({
        userId: account.user_id,
        success: false,
        error: error.message,
      });
    }
  }

  return NextResponse.json({ results });
}
```

#### **Step 2: Configure Vercel Cron**
**File:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/gmail-sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Or use external scheduler (Render Cron, Upstash QStash, etc.)**

---

### 6. Enhance Missing Money Detector (2-3 hours)

#### **Step 1: Add to Dashboard**
**File:** `src/app/dashboard/page.tsx`

```typescript
import { MissingMoneyCard } from "@/components/missing-money/MissingMoneyCard";
import { estimateMissingMoney } from "@/lib/missingMoney";

export default async function DashboardPage() {
  const user = await getUser();
  const profile = await getUserProfile(user.id);
  const entries = await getIncomeEntries(user.id);

  const missingMoney = await estimateMissingMoney(profile, entries);

  return (
    <div className="space-y-8">
      {/* Existing dashboard content */}

      {missingMoney.totalEstimated > 0 && (
        <MissingMoneyCard data={missingMoney} />
      )}
    </div>
  );
}
```

#### **Step 2: Enhanced Missing Money Component**
**File:** `src/components/missing-money/MissingMoneyCard.tsx`

```typescript
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";

export function MissingMoneyCard({ data }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Missing Money Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold text-amber-600">
          ${data.totalEstimated.toFixed(2)}
        </div>
        <p className="text-sm text-gray-600">
          Estimated uncollected royalties based on your activity
        </p>

        <div className="space-y-2">
          {data.breakdown.map((item) => (
            <Alert key={item.source}>
              <AlertDescription className="flex items-center justify-between">
                <span>{item.source}: ${item.amount.toFixed(2)}</span>
                <Button size="sm" variant="outline" asChild>
                  <a href={item.registrationUrl} target="_blank">
                    Register <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Testing Checklist

After implementing each feature:

- [ ] Test in development (`npm run dev`)
- [ ] Check for TypeScript errors (`npm run build`)
- [ ] Test error cases (invalid input, unauthorized access)
- [ ] Test loading states
- [ ] Test toast notifications
- [ ] Test mobile responsiveness

---

## Common Issues & Solutions

### **"Module not found" errors**
- Run `npm install`
- Check import paths use `@/` alias
- Verify `tsconfig.json` has path mappings

### **Supabase types errors**
- Regenerate types: `npx supabase gen types...`
- Check table/column names match database
- Ensure RLS policies allow access

### **Server action not working**
- Check `"use server"` directive at top of file
- Verify file is in `src/lib/actions/` or server component
- Check for validation errors in console

### **Middleware redirect loop**
- Check PROTECTED_ROUTES and AUTH_ROUTES don't overlap
- Verify middleware matcher pattern
- Check for circular redirects

---

## Deployment Checklist

Before deploying to production:

1. [ ] All environment variables set in Vercel/hosting
2. [ ] Supabase RLS policies configured
3. [ ] Stripe webhooks configured with production endpoint
4. [ ] Google OAuth redirect URIs updated for production domain
5. [ ] NEXT_PUBLIC_APP_URL set to production URL
6. [ ] Cron jobs configured (if using)
7. [ ] Error tracking set up (Sentry, LogRocket, etc.)
8. [ ] Analytics configured (PostHog, Plausible, etc.)

---

## Next Level Features (Future)

- [ ] Email notifications (Resend, SendGrid)
- [ ] Advanced analytics dashboard
- [ ] AI-powered royalty predictions
- [ ] Mobile app (React Native)
- [ ] Public API
- [ ] Webhooks for external integrations
- [ ] Team/collaboration features
- [ ] Accounting software integration (QuickBooks, Xero)

---

## Getting Help

- **Claude Code Issues:** https://github.com/anthropics/claude-code/issues
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Stripe Docs:** https://stripe.com/docs

---

_Happy coding! 🚀_
