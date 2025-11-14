# Environment Variables Documentation

This document describes all environment variables required for the MusicIncome.io application.

## Overview

The application uses environment variables for configuration. Never commit actual secrets to Git. All environment variables should be configured in:
- **Vercel**: Production environment variables
- **Supabase**: Database connection details (public keys are safe)
- **Local Development**: `.env.local` file (gitignored)

## Required Variables

### Supabase Configuration

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Description**: Your Supabase project URL
- **Example**: `https://xxxxx.supabase.co`
- **Location**: Vercel, Supabase Dashboard, Local
- **Public**: Yes (NEXT_PUBLIC_ prefix means it's exposed to the browser)
- **Required**: Yes

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Description**: Supabase anonymous/public API key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Location**: Vercel, Supabase Dashboard, Local
- **Public**: Yes (safe to expose to browser)
- **Required**: Yes

#### `SUPABASE_SERVICE_ROLE_KEY` (Optional)
- **Description**: Supabase service role key (admin access)
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Location**: Vercel, Local (server-side only)
- **Public**: No (keep secret!)
- **Required**: No (only needed for admin operations)

---

### Stripe Configuration

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Description**: Stripe publishable API key (starts with `pk_`)
- **Example**: `pk_test_xxxxx` or `pk_live_xxxxx`
- **Location**: Vercel, Local
- **Public**: Yes (safe to expose to browser)
- **Required**: Yes

#### `STRIPE_SECRET_KEY`
- **Description**: Stripe secret API key (starts with `sk_`)
- **Example**: `sk_test_xxxxx` or `sk_live_xxxxx`
- **Location**: Vercel, Local (server-side only)
- **Public**: No (keep secret!)
- **Required**: Yes

#### `STRIPE_WEBHOOK_SECRET`
- **Description**: Stripe webhook signing secret (starts with `whsec_`)
- **Example**: `whsec_xxxxx`
- **Location**: Vercel, Local (server-side only)
- **Public**: No (keep secret!)
- **Required**: Yes (for webhook signature verification)

#### `STRIPE_PRO_PRICE_ID` (Optional)
- **Description**: Stripe Price ID for Pro subscription plan
- **Example**: `price_xxxxx`
- **Location**: Vercel, Local
- **Public**: No
- **Required**: No (has default fallback: `"price_pro_monthly"`)

---

### Google OAuth Configuration

#### `GOOGLE_CLIENT_ID`
- **Description**: Google OAuth 2.0 Client ID
- **Example**: `xxxxx.apps.googleusercontent.com`
- **Location**: Vercel, Local (server-side only)
- **Public**: No (keep secret!)
- **Required**: Yes (for Gmail integration)

#### `GOOGLE_CLIENT_SECRET`
- **Description**: Google OAuth 2.0 Client Secret
- **Example**: `GOCSPX-xxxxx`
- **Location**: Vercel, Local (server-side only)
- **Public**: No (keep secret!)
- **Required**: Yes (for Gmail integration)

#### `GOOGLE_REDIRECT_URI`
- **Description**: Google OAuth redirect URI (must match Google Console config)
- **Example**: `http://localhost:3001/api/oauth/google/callback` (local) or `https://yourdomain.com/api/oauth/google/callback` (production)
- **Location**: Vercel, Local
- **Public**: No
- **Required**: Yes

---

### Email Configuration (Optional)

#### `RESEND_API_KEY` (Optional)
- **Description**: Resend API key for sending transactional emails
- **Example**: `re_xxxxx`
- **Location**: Vercel, Local (server-side only)
- **Public**: No (keep secret!)
- **Required**: No (email features disabled if not set)

---

### Application Configuration

#### `NEXT_PUBLIC_APP_URL`
- **Description**: Public URL of the application
- **Example**: `http://localhost:3001` (local) or `https://yourdomain.com` (production)
- **Location**: Vercel, Local
- **Public**: Yes
- **Required**: No (defaults to `http://localhost:3000`)

#### `NODE_ENV`
- **Description**: Node.js environment
- **Example**: `development`, `production`, or `test`
- **Location**: Automatically set by Vercel/Node
- **Public**: Yes
- **Required**: No (defaults to `development`)

---

### Cron Job Configuration

#### `CRON_SECRET` (Optional but Recommended in Production)
- **Description**: Secret token for protecting cron endpoints from unauthorized access
- **Example**: `your-secure-random-string`
- **Location**: Vercel (for cron jobs), Local (for testing)
- **Public**: No (keep secret!)
- **Required**: No (optional in dev, recommended in production)
- **Note**: Vercel Cron automatically adds `Authorization: Bearer <secret>` header. Set this in Vercel's cron job configuration or as an env var.

---

## Setup Instructions

### Local Development

1. Copy `.env.example` to `.env.local` (if example exists)
2. Fill in all required variables from the sections above
3. Ensure `.env.local` is in `.gitignore` (it should be)
4. Never commit `.env.local` to Git

### Vercel Production

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add all required variables listed above
4. Set environment to **Production** (and optionally **Preview** and **Development**)
5. Redeploy after adding variables

### Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Copy the `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (if needed)

### Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials (Client ID & Secret)
3. Add authorized redirect URIs:
   - Local: `http://localhost:3001/api/oauth/google/callback`
   - Production: `https://yourdomain.com/api/oauth/google/callback`
4. Enable Gmail API scope: `https://www.googleapis.com/auth/gmail.readonly`

### Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from **Developers** > **API keys**
3. Create a webhook endpoint pointing to `/api/stripe/webhook`
4. Copy the webhook signing secret

---

## Security Notes

- ⚠️ **Never commit** `.env` files to Git
- ⚠️ **Never expose** server-side secrets (keys without `NEXT_PUBLIC_` prefix) to the browser
- ✅ `NEXT_PUBLIC_*` variables are safe to expose (they're bundled in the client)
- ✅ Use different keys for development and production
- ✅ Rotate keys immediately if accidentally committed to Git
- ✅ Use Vercel's environment variable encryption for production secrets

---

## Validation

The application validates all required environment variables at runtime using Zod schemas in `src/lib/validators/env.ts`. Missing required variables will cause build or runtime errors.

---

## Troubleshooting

### "Missing environment variable" error
- Check that all required variables are set in Vercel
- Verify variable names match exactly (case-sensitive)
- Redeploy after adding new environment variables

### OAuth redirect mismatch
- Ensure `GOOGLE_REDIRECT_URI` matches exactly what's configured in Google Console
- Include full protocol (`http://` or `https://`) and port if non-standard

### Webhook signature verification fails
- Verify `STRIPE_WEBHOOK_SECRET` matches your Stripe webhook endpoint secret
- Ensure webhook URL is correct in Stripe dashboard

