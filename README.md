# 🎵 MusicIncome.io

A comprehensive platform for musicians to track income from multiple sources, discover missing royalties, and manage financial statements—all in one place.

## 🚀 Features

- **Multi-Source Income Tracking**: Track income from DistroKid, TuneCore, CD Baby, and more
- **Statement Archive**: Upload and manage CSV statements with automatic parsing
- **Missing Royalties Detection**: Smart algorithms to identify unclaimed income
- **Gmail Integration**: Automatically sync income data from email statements
- **Dashboard & Analytics**: Visual charts and insights into your income streams
- **Royalty Checklist**: Step-by-step guide to ensure all royalties are claimed
- **Stripe Integration**: Subscription-based Pro plans with advanced features

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React Server Components)
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Payments**: [Stripe](https://stripe.com/)
- **Email**: [Resend](https://resend.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Stripe account (for payments)
- Google Cloud Console project (for Gmail OAuth)
- Resend account (optional, for email notifications)

## 🏃 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/musicincome-io.git
cd musicincome-io
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local  # if example exists
```

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for a complete list of required environment variables.

**Minimum required variables:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/oauth/google/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

## 📚 Project Structure

```
musicincome-io/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth routes (sign-in, sign-up)
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Auth callbacks
│   │   │   ├── billing/       # Stripe checkout
│   │   │   ├── cron/          # Scheduled jobs
│   │   │   ├── oauth/         # OAuth flows
│   │   │   ├── stripe/        # Webhooks
│   │   │   └── sync/          # Gmail sync
│   │   ├── billing/           # Billing page
│   │   ├── connections/       # Gmail connections
│   │   ├── dashboard/         # Main dashboard
│   │   ├── income/            # Income management
│   │   ├── library/           # Music library
│   │   └── onboarding/        # Onboarding flow
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── income/           # Income components
│   │   └── statements/       # Statement components
│   └── lib/                  # Utilities & business logic
│       ├── actions/          # Server actions
│       ├── db/               # Database queries
│       ├── parsers/          # Statement parsers
│       ├── validators/       # Zod schemas
│       └── supabase/         # Supabase clients
├── public/                   # Static assets
├── middleware.ts             # Auth middleware
├── next.config.ts            # Next.js config
├── vercel.json               # Vercel config (cron jobs)
└── package.json              # Dependencies
```

## 🚢 Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - In Vercel project settings, go to **Environment Variables**
   - Add all required variables from [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)
   - Set `NEXT_PUBLIC_APP_URL` to your production domain
   - Set `GOOGLE_REDIRECT_URI` to your production callback URL

4. **Set Up Stripe Webhook**:
   - In Stripe Dashboard, create a webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Copy the webhook signing secret to Vercel as `STRIPE_WEBHOOK_SECRET`

5. **Configure Google OAuth**:
   - In Google Cloud Console, add authorized redirect URI:
     `https://yourdomain.com/api/oauth/google/callback`

6. **Deploy**:
   - Vercel will automatically deploy on every push to `main`
   - Or trigger a manual deployment from the dashboard

### Cron Jobs

The app includes a nightly Gmail sync cron job configured in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/gmail-sync",
    "schedule": "0 2 * * *"
  }]
}
```

Make sure to:
1. Set `CRON_SECRET` in Vercel environment variables
2. Configure the cron job in Vercel Dashboard → Cron Jobs
3. Add `Authorization: Bearer <CRON_SECRET>` header if using manual triggers

## 🔐 Environment Variables

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for complete documentation of all environment variables, including:
- Required vs optional variables
- Where to configure them (Vercel, Supabase, Local)
- Security notes
- Setup instructions for each service

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- Server Components by default (use `"use client"` only when needed)

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and design patterns
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Environment variable reference
- [FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md) - Feature implementation details
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Development guide
- [EMAIL_NOTIFICATIONS.md](./EMAIL_NOTIFICATIONS.md) - Email notification system

## 🔒 Security

- ✅ All environment variables are validated with Zod
- ✅ No secrets committed to Git (`.env*` files are gitignored)
- ✅ Server-side secrets never exposed to client
- ✅ Supabase Row-Level Security (RLS) enabled
- ✅ Stripe webhook signature verification
- ✅ Protected cron endpoints with secret authentication

## 🐛 Troubleshooting

### Build Errors

- Ensure all required environment variables are set in Vercel
- Check that Node.js version matches (18+)
- Verify TypeScript types are correct

### OAuth Issues

- Verify redirect URIs match exactly in Google Console
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure callback URL is accessible from the internet

### Database Connection

- Verify Supabase project is active
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Ensure RLS policies allow authenticated users

## 📄 License

Private project - All rights reserved

## 👥 Contributing

This is a private project. For issues or feature requests, please contact the project maintainers.

---

Built with ❤️ for musicians
