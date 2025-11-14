# 📧 Email Notifications System

**Complete email notification system using Resend + React Email**

---

## 🎯 Overview

MusicIncome.io now sends beautiful, branded email notifications for:
1. **Welcome Email** - When users complete onboarding
2. **Nightly Sync Results** - When new royalty statements are found
3. **Statement Uploaded** - Confirmation when CSV is manually uploaded
4. **Missing Money Alerts** - (Ready to implement) When significant uncollected royalties detected

---

## 🚀 Quick Setup

### **1. Get Resend API Key**
```bash
1. Go to https://resend.com
2. Sign up (free tier: 100 emails/day, 3,000/month)
3. Create API key
4. Copy API key (starts with "re_")
```

### **2. Add to Environment**
```bash
# .env.local
RESEND_API_KEY=re_your_api_key_here
```

### **3. Verify Domain (Production)**
For production, verify your domain in Resend:
```bash
1. Go to Resend Dashboard → Domains
2. Add your domain (e.g., musicincome.io)
3. Add DNS records (DKIM, SPF, DMARC)
4. Wait for verification (~10 minutes)
```

**For development:**
- Use `onboarding@resend.dev` as sender
- Works immediately, no verification needed

---

## 📨 Email Types

### **1. Welcome Email**

**Sent when:** User completes onboarding
**Trigger:** `completeOnboarding()` server action
**File:** `src/lib/email/templates/WelcomeEmail.tsx`

**Content:**
- Welcome message with artist name
- Quick start guide (connect Gmail, upload CSV, etc.)
- CTA button to dashboard
- Link to knowledge base

**Preview:**
```
Subject: Welcome to MusicIncome.io! 🎵

Hi [Artist Name],

Thanks for signing up! You've just taken the first step
toward never missing another royalty payment.

🎯 Quick Start:
• Connect your Gmail to auto-import statements
• Upload CSV files from DistroKid, TuneCore, or CD Baby
• Check the Missing Money Detector to find uncollected royalties
• Set up nightly auto-sync (Pro feature)

[Go to Dashboard →]
```

---

### **2. Nightly Sync Email**

**Sent when:** Nightly Gmail sync finds new statements
**Trigger:** `scheduleNightlySync()` in cron job
**File:** `src/lib/email/templates/NightlySyncEmail.tsx`

**Content:**
- Number of statements found
- Total new income amount
- Breakdown by source (Streaming, PRO, MLC, etc.)
- CTA to view all income

**Only sends if:**
- New statements were found (skips if 0 results)
- User has valid email

**Preview:**
```
Subject: 🎉 3 new royalty statements found!

Hi [Artist Name],

Good news! Our nightly sync found 3 new royalty statements
in your Gmail.

┌─────────────────────┐
│ Total New Income    │
│ $487.23             │
│ New Entries: 47     │
│ Statements: 3       │
└─────────────────────┘

Breakdown by Source:
• Streaming: $325.50 (32 entries)
• PRO (ASCAP): $125.00 (12 entries)
• MLC: $36.73 (3 entries)

[View All Income →]
```

---

### **3. Statement Uploaded Email**

**Sent when:** User manually uploads CSV
**Trigger:** `createStatementFromCSV()` server action
**File:** `src/lib/email/templates/StatementUploadedEmail.tsx`

**Content:**
- Confirmation of upload
- File name
- Total income from statement
- Number of entries created
- Format detected (DistroKid/TuneCore/CD Baby)

**Preview:**
```
Subject: ✓ Statement uploaded: distrokid-2024-11.csv

Hi [Artist Name],

Your statement distrokid-2024-11.csv has been successfully
uploaded and processed.

┌─────────────────────┐
│ Total Income        │
│ $245.67             │
│ Entries: 42         │
└─────────────────────┘

Format Detected: DistroKid
All 42 income entries have been added to your dashboard.

[View All Income →]
```

---

### **4. Missing Money Alert Email** (Ready to Use)

**File:** `src/lib/email/templates/MissingMoneyAlertEmail.tsx`

**To activate:**
```typescript
// In dashboard or onboarding flow
import { sendMissingMoneyAlert } from "@/lib/email/send";

const analysis = await analyzeMissingMoney(profile, entries);

if (analysis.totalEstimated > 100) {
  await sendMissingMoneyAlert(user.email, {
    artistName: profile.artist_name,
    totalEstimated: analysis.totalEstimated,
    topOpportunities: analysis.estimates.slice(0, 3).map(e => ({
      source: e.sourceName,
      amount: e.estimatedAnnual,
      actionUrl: e.actionUrl || "#",
    })),
  });
}
```

**Content:**
- Total estimated uncollected royalties
- Top 3 opportunities with amounts
- Registration links for each source
- CTA to view full analysis

**Only sends if:**
- Estimated amount > $100
- Prevents spam for low-value estimates

**Preview:**
```
Subject: 🚨 You may be missing $1,125 in royalties

Hi [Artist Name],

Based on your activity, we've detected you may be missing
out on $1,125 in uncollected royalties annually.

┌─────────────────────────────────┐
│ $1,125                          │
│ Estimated Uncollected (Annual)  │
└─────────────────────────────────┘

Top Opportunities:

PRO (ASCAP/BMI/SESAC)
$315/year
[Register →]

MLC (Mechanical Rights)
$630/year
[Register →]

SoundExchange
$180/year
[Register →]

[See Full Analysis →]
```

---

## 🏗️ Architecture

### **Email Service Layer**

```
src/lib/email/
├── client.ts              # Resend client & helper
├── send.ts                # High-level send functions
└── templates/
    ├── WelcomeEmail.tsx
    ├── NightlySyncEmail.tsx
    ├── StatementUploadedEmail.tsx
    ├── MissingMoneyAlertEmail.tsx
    └── index.ts
```

### **Template System**

Uses **React Email** for beautiful, responsive emails:
- Write emails as React components
- Automatic HTML/text generation
- Mobile-friendly
- Dark mode support
- Preview in development

### **Sending Pattern**

All emails use "fire and forget" pattern:
```typescript
// Don't await - send in background
sendWelcomeEmail(email, artistName).catch((error) => {
  console.error("Error sending email:", error);
  // Don't fail the main operation if email fails
});
```

**Why?**
- Main operation (onboarding, upload, etc.) shouldn't fail if email fails
- Faster response times
- Better user experience

---

## 🎨 Email Design

### **Brand Colors**
- Primary: `#3b82f6` (Blue)
- Success: `#16a34a` (Green)
- Warning: `#fbbf24` (Amber)
- Danger: `#ef4444` (Red)

### **Typography**
- Font: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI)
- Heading: 24px, bold
- Body: 16px, line-height 26px
- Footer: 12px

### **Responsive Design**
- Mobile-first layout
- Tested on iOS Mail, Gmail, Outlook
- Fallback styles for older clients

---

## 🧪 Testing

### **Development Testing**

1. **Preview Emails Locally**
   ```bash
   # Install React Email CLI (optional)
   npm install -g react-email

   # Preview templates
   email dev
   ```

2. **Test Sending**
   ```bash
   # Add to .env.local
   RESEND_API_KEY=re_your_test_key

   # Trigger onboarding to test welcome email
   # Upload statement to test upload email
   # Manually trigger cron to test sync email
   ```

3. **Use Resend Test Mode**
   - Test API keys start with `re_test_`
   - Emails sent to `delivered@resend.dev`
   - No real emails sent

### **Production Testing**

1. **Verify Domain**
   - Add DNS records in Resend Dashboard
   - Wait for verification
   - Test with your actual email

2. **Monitor Logs**
   - Check Vercel logs for email sending
   - Check Resend Dashboard for delivery status
   - Set up webhooks for bounces/complaints

---

## 📊 Email Analytics

### **Resend Dashboard**
Track in real-time:
- Emails sent
- Delivery rate
- Open rate (if enabled)
- Click rate
- Bounces
- Complaints

### **Setup Webhooks** (Optional)
```typescript
// src/app/api/webhooks/resend/route.ts
export async function POST(request: Request) {
  const payload = await request.json();

  // Handle email events
  switch (payload.type) {
    case "email.delivered":
      // Track successful delivery
      break;
    case "email.bounced":
      // Handle bounce (bad email)
      break;
    case "email.complained":
      // Handle spam complaint
      break;
  }

  return new Response("OK");
}
```

---

## 🔒 Security & Best Practices

### **1. API Key Security**
- ✅ Store in environment variables
- ✅ Never commit to git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys periodically

### **2. Email Validation**
```typescript
// Already handled by Zod in validators/auth.ts
z.string().email("Invalid email address")
```

### **3. Rate Limiting**
Resend free tier limits:
- 100 emails/day
- 3,000 emails/month

For scaling:
- Pro plan: $20/mo for 50,000 emails
- Business plan: $80/mo for 100,000 emails

### **4. Unsubscribe** (Future)
Add unsubscribe link to footer:
```tsx
<Link href={`${APP_URL}/settings/notifications?unsubscribe=true`}>
  Unsubscribe from these emails
</Link>
```

---

## 🚦 Deployment Checklist

- [ ] Add `RESEND_API_KEY` to Vercel environment variables
- [ ] Verify domain in Resend (production)
- [ ] Update `FROM_EMAIL` to use your domain
- [ ] Test welcome email (sign up)
- [ ] Test upload email (upload CSV)
- [ ] Test nightly sync email (trigger cron manually)
- [ ] Monitor Resend dashboard for deliverability
- [ ] Set up bounce/complaint webhooks (optional)

---

## 🎓 Customization

### **Change Sender Email**
```typescript
// src/lib/email/client.ts
export const FROM_EMAIL = "MusicIncome.io <hello@yourdomain.com>";
```

### **Add New Email Template**

1. **Create Template**
   ```typescript
   // src/lib/email/templates/MyNewEmail.tsx
   export function MyNewEmail({ name }: { name: string }) {
     return (
       <Html>
         <Body>
           <Text>Hello {name}!</Text>
         </Body>
       </Html>
     );
   }
   ```

2. **Add Send Function**
   ```typescript
   // src/lib/email/send.ts
   export async function sendMyNewEmail(to: string, name: string) {
     return sendEmail({
       to,
       subject: "My Subject",
       react: MyNewEmail({ name }),
     });
   }
   ```

3. **Use It**
   ```typescript
   import { sendMyNewEmail } from "@/lib/email/send";

   await sendMyNewEmail(user.email, user.name);
   ```

---

## 📈 Future Enhancements

### **Planned**
- [ ] Weekly summary emails (digest)
- [ ] Missing money alerts (weekly)
- [ ] Export completed emails
- [ ] Payment reminder emails
- [ ] User notification preferences page

### **Ideas**
- [ ] Email templates in database (customizable)
- [ ] A/B testing different subject lines
- [ ] Personalized recommendations
- [ ] Referral program emails
- [ ] Milestone celebration emails (first $1000, etc.)

---

## 🐛 Troubleshooting

### **Emails not sending?**

1. **Check API key**
   ```bash
   echo $RESEND_API_KEY  # Should start with "re_"
   ```

2. **Check logs**
   ```bash
   # Vercel
   vercel logs --follow

   # Look for "Error sending email"
   ```

3. **Verify domain** (production)
   - DNS records must be added
   - Wait 10-15 minutes for propagation

4. **Check Resend Dashboard**
   - See if email was accepted
   - Check delivery status
   - View error messages

### **Emails going to spam?**

1. **Verify domain** (must have DKIM/SPF)
2. **Warm up domain** (send gradually at first)
3. **Add unsubscribe link**
4. **Monitor bounce/complaint rates**
5. **Use proper from address** (not noreply@)

### **Template not rendering?**

1. **Check React Email syntax**
2. **Test locally** with `email dev`
3. **Check for JSX errors**
4. **Ensure all imports are correct**

---

## 📞 Support

- **Resend Docs:** https://resend.com/docs
- **React Email:** https://react.email/docs
- **Email Testing:** https://www.mail-tester.com/

---

## ✅ Summary

You now have a **production-ready email notification system**:

**Features:**
- ✅ 4 beautiful email templates
- ✅ Automatic sending on key events
- ✅ Mobile-responsive design
- ✅ Error handling & logging
- ✅ Fire-and-forget pattern
- ✅ Easy to customize

**Integration Points:**
- ✅ Onboarding → Welcome email
- ✅ Statement upload → Confirmation email
- ✅ Nightly sync → Results email
- ✅ Missing money → Alert email (ready)

**Ready to use!** Just add `RESEND_API_KEY` to your environment variables. 🚀

---

_Last updated: November 13, 2025_
