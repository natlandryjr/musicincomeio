# 🏛️ MusicIncome.io - Architecture Overview

## System Design Philosophy

### Core Principles

1. **Security First**: Authentication, authorization, and validation at every layer
2. **Type Safety**: End-to-end TypeScript with runtime validation (Zod)
3. **Server-First**: Leverage React Server Components and Server Actions
4. **DRY Code**: Reusable functions, no duplication
5. **Developer Experience**: Clear patterns, good docs, fast feedback

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│  - React Client Components                              │
│  - UI interactions, forms, animations                   │
│  - Toast notifications, client state                    │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVER COMPONENT LAYER                │
│  - React Server Components (RSC)                        │
│  - Data fetching, rendering                             │
│  - No client-side JavaScript                            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVER ACTIONS LAYER                  │
│  - Form submissions, mutations                          │
│  - Validation with Zod                                  │
│  - Automatic revalidation                               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                     │
│  - Reusable database queries                            │
│  - Type-safe with generated types                       │
│  - Consistent error handling                            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                     │
│  - Supabase Postgres                                    │
│  - Row-Level Security (RLS)                             │
│  - Automatic backups                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Request Flow Examples

### **Read Operation (Dashboard Page)**

```
1. User navigates to /dashboard
2. Middleware validates session → getUser()
3. Server Component fetches data → getTotalIncome(user.id)
4. Data Access Layer queries Supabase
5. Server Component renders with data
6. HTML sent to client (no JavaScript needed for static content)
```

### **Write Operation (Create Income Entry)**

```
1. User fills form and submits
2. Client Component calls Server Action → createIncomeEntry(data)
3. Server Action validates with Zod
4. Server Action authenticates user
5. Server Action inserts to database
6. Server Action revalidates cache → revalidatePath("/income")
7. Response sent to client
8. Client shows toast notification
9. Page automatically updates (no manual refresh)
```

---

## Data Flow Patterns

### **Pattern 1: Server Component → Direct Render**

**Use when:** Displaying read-only data

```typescript
// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const income = await getTotalIncome(user.id);

  return <div>Total: ${income}</div>;
}
```

**Benefits:**
- No client JavaScript
- SEO-friendly
- Fast initial load

---

### **Pattern 2: Server Component → Client Wrapper**

**Use when:** Need interactivity but want server data fetching

```typescript
// src/app/income/page.tsx (Server Component)
export default async function IncomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const entries = await getIncomeEntries(user.id);

  return <IncomeManager initialEntries={entries} />;
}

// src/components/income/IncomeManager.tsx (Client Component)
"use client";

export function IncomeManager({ initialEntries }) {
  const [entries, setEntries] = useState(initialEntries);

  // Handle client-side interactivity
}
```

**Benefits:**
- Server-side data fetching (fast, secure)
- Client-side interactivity (sorting, filtering, animations)
- Best of both worlds

---

### **Pattern 3: Server Action → Revalidation**

**Use when:** User submits form or triggers mutation

```typescript
// src/lib/actions/income.ts (Server Action)
"use server";

export async function createIncomeEntry(input) {
  // 1. Validate input
  const validated = createIncomeEntrySchema.parse(input);

  // 2. Authenticate
  const user = await requireUser();

  // 3. Mutate data
  await supabase.from("income_entries").insert({ ...validated, user_id: user.id });

  // 4. Revalidate cache
  revalidatePath("/income");
  revalidatePath("/dashboard");

  return { success: true };
}
```

**Benefits:**
- Server-side validation (can't be bypassed)
- Automatic cache invalidation
- Type-safe with TypeScript + Zod
- No manual refetching needed

---

## Security Model

### **Layer 1: Middleware (Edge)**

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const { user } = await getUser(req);

  if (isProtectedRoute && !user) {
    return redirect("/sign-in");
  }
}
```

**Protects:** Route-level access

---

### **Layer 2: Server Components/Actions**

```typescript
// Always verify user in server code
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  redirect("/sign-in");
}
```

**Protects:** Page/action-level access

---

### **Layer 3: Database (RLS)**

```sql
-- Supabase Row-Level Security
CREATE POLICY "Users can only see own income"
ON income_entries FOR SELECT
USING (auth.uid() = user_id);
```

**Protects:** Data-level access

---

### **Layer 4: Validation (Zod)**

```typescript
// Validate all user input
const validated = createIncomeEntrySchema.parse(input);
```

**Protects:** Data integrity

---

## State Management

### **Server State**
- **Where:** React Server Components
- **When:** Initial page load, navigation
- **How:** Fetch in server component, pass as props

### **Client State**
- **Where:** React Client Components
- **When:** User interactions, real-time updates
- **How:** `useState`, `useReducer` for local state

### **URL State**
- **Where:** Search params, route params
- **When:** Shareable state (filters, pagination)
- **How:** Next.js `useSearchParams`, `useParams`

### **Form State**
- **Where:** Server Actions
- **When:** Form submissions
- **How:** `useFormState` hook (Next.js 15)

**We don't use:**
- Redux (overkill for this app size)
- React Query (server components eliminate need)
- Zustand (server state > client state)

---

## Caching Strategy

### **Server Component Cache**

```typescript
// Default: Cached until revalidate
export default async function Page() {
  const data = await fetch("/api/data"); // Cached
  return <div>{data}</div>;
}

// Manual revalidation
export const revalidate = 3600; // 1 hour
```

### **Server Action Revalidation**

```typescript
"use server";

export async function createItem() {
  await db.insert();

  // Invalidate specific paths
  revalidatePath("/items");
  revalidatePath("/dashboard");
}
```

### **On-Demand Revalidation**

```typescript
// Webhook endpoint
export async function POST(req: Request) {
  revalidatePath("/items");
  return NextResponse.json({ revalidated: true });
}
```

---

## Error Handling Strategy

### **Server Components**

```typescript
// app/dashboard/error.tsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### **Server Actions**

```typescript
export async function createItem(input) {
  try {
    const validated = schema.parse(input);
    await db.insert(validated);
    return { success: true };
  } catch (error) {
    console.error("Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### **Client Components**

```typescript
"use client";

export function Form() {
  const { toast } = useToast();

  const handleSubmit = async (data) => {
    const result = await createItem(data);

    if (result.success) {
      toast.success("Created!");
    } else {
      toast.error(result.error);
    }
  };
}
```

---

## File Naming Conventions

### **Server Components**
- `page.tsx` - Route pages
- `layout.tsx` - Layouts
- `loading.tsx` - Loading states
- `error.tsx` - Error boundaries

### **Client Components**
- `ComponentName.tsx` - PascalCase
- `"use client"` at top of file
- Keep close to where used

### **Server Actions**
- `actions/feature.ts` - Group by feature
- `"use server"` at top of file

### **Utilities**
- `lib/utils.ts` - General utilities
- `lib/validators/*.ts` - Zod schemas
- `lib/constants/*.ts` - App constants

### **Database**
- `lib/db/*.ts` - Query functions
- Group by entity (users, income, etc.)

---

## Testing Strategy

### **Unit Tests** (Vitest)
- Test validators (Zod schemas)
- Test utility functions
- Test CSV parsers

### **Integration Tests** (Playwright)
- Test user flows (sign up → dashboard → create income)
- Test forms and validation
- Test error states

### **E2E Tests** (Playwright)
- Test critical paths
- Test payment flow
- Test OAuth flow

---

## Performance Optimizations

### **1. Server Components by Default**
- Less client JavaScript
- Faster initial page load
- Better SEO

### **2. Lazy Loading**
```typescript
const IncomeCharts = dynamic(() => import("./IncomeCharts"), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### **3. Database Indexes**
```sql
CREATE INDEX idx_income_user_id ON income_entries(user_id);
CREATE INDEX idx_income_period ON income_entries(period_start, period_end);
```

### **4. Optimistic Updates**
```typescript
// Update UI immediately, then sync
setEntries([newEntry, ...entries]);
const result = await createEntry(newEntry);
if (!result.success) {
  // Rollback on error
  setEntries(entries);
}
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────┐
│           Vercel (Edge Network)          │
│  - Next.js App                           │
│  - Edge Middleware (auth checks)         │
│  - Serverless Functions (API routes)     │
│  - Static Assets (CDN)                   │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│         Supabase (Database)              │
│  - PostgreSQL                            │
│  - Auth                                  │
│  - Storage                               │
│  - Edge Functions                        │
└──────────────────────────────────────────┘
                  ↓
┌──────────────────────────────────────────┐
│         External Services                │
│  - Stripe (Payments)                     │
│  - Google OAuth (Gmail sync)             │
│  - Resend (Emails)                       │
└──────────────────────────────────────────┘
```

---

## Scaling Considerations

### **Current Architecture (0-10k users)**
- ✅ Serverless functions (auto-scales)
- ✅ Supabase (managed, auto-scales)
- ✅ Edge caching (Next.js + Vercel)

### **Future Scaling (10k-100k users)**
- Add Redis for caching (Upstash)
- Add job queue for background tasks (Inngest, Trigger.dev)
- Add CDN for static assets
- Optimize database queries with materialized views

### **Enterprise Scaling (100k+ users)**
- Database read replicas
- Dedicated caching layer
- Event-driven architecture
- Microservices for heavy computations

---

## Monitoring & Observability

### **Recommended Tools**

1. **Error Tracking:** Sentry
2. **Analytics:** PostHog, Plausible
3. **Performance:** Vercel Analytics
4. **Logging:** Better Stack (Logtail)
5. **Uptime:** Better Uptime

### **Key Metrics to Track**

- Page load time (p50, p95, p99)
- API response time
- Error rate
- User sign-ups / conversions
- Income entries created
- CSV parse success rate
- Stripe checkout completion rate

---

## Code Quality Tools

### **Linting**
```bash
npm run lint  # ESLint + Next.js rules
```

### **Type Checking**
```bash
npm run build  # TypeScript compilation
```

### **Formatting**
```bash
npx prettier --write .  # Code formatting
```

---

## Environment Variables

### **Required**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### **Optional**
- `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
- `CRON_SECRET` (for scheduled jobs)
- `SENTRY_DSN` (for error tracking)
- `POSTHOG_KEY` (for analytics)

---

## Database Schema Overview

### **Core Tables**

```sql
users
  - id (PK, FK to auth.users)
  - email
  - artist_name
  - subscription_tier (free|pro)
  - stripe_customer_id

income_entries
  - id (PK)
  - user_id (FK → users.id)
  - source_type (enum)
  - amount (decimal)
  - period_start (date)
  - period_end (date)

raw_statements
  - id (PK)
  - user_id (FK → users.id)
  - provider (gmail|upload)
  - raw_payload (jsonb)

external_accounts
  - id (PK)
  - user_id (FK → users.id)
  - provider (gmail|google_drive)
  - access_token (encrypted)
  - refresh_token (encrypted)
```

---

## Migration Strategy

### **Phase 1: Foundation (Completed)**
- ✅ Environment validation
- ✅ Secure middleware
- ✅ Server actions
- ✅ Data access layer
- ✅ CSV parsers

### **Phase 2: Features (In Progress)**
- ⏳ Statement Archive
- ⏳ Stripe Customer Portal
- ⏳ Nightly sync
- ⏳ Enhanced Missing Money Detector

### **Phase 3: Polish (Future)**
- ⏳ UI/UX improvements
- ⏳ Email notifications
- ⏳ Advanced analytics
- ⏳ Mobile responsiveness

---

## Contributing Guidelines

### **Code Style**
- Use TypeScript strict mode
- Use functional components
- Use Server Components by default
- Add JSDoc comments to functions
- Use Zod for all validation

### **Git Workflow**
```bash
# Feature branch
git checkout -b feature/statement-archive

# Commit with conventional commits
git commit -m "feat: add statement archive page"

# Push and create PR
git push origin feature/statement-archive
```

### **PR Checklist**
- [ ] TypeScript compiles (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] Manual testing completed
- [ ] No console.log statements
- [ ] Updated documentation

---

_Last updated: November 13, 2025_
