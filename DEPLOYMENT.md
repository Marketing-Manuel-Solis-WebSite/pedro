# Deployment Guide

## Pre-Deploy Checklist

### 1. Supabase (do this first)
- [ ] Create Supabase project
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Run `supabase/seed.sql` in SQL Editor
- [ ] Copy Project URL -> `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy anon key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy service_role key -> `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configure Auth: set Site URL, redirect URLs, disable social providers
- [ ] Verify Realtime is enabled for leads, messages, conversation_events

### 2. WhatsApp Business Platform
- [ ] Choose BSP or direct Cloud API access via Meta Business Suite
- [ ] Create WhatsApp Business Account
- [ ] Register phone number
- [ ] Get permanent System User token (not the temp token)
- [ ] Copy: Access Token, Phone Number ID, Business Account ID, App Secret
- [ ] Generate a random verify token: `openssl rand -hex 32`
- [ ] Submit templates for approval (start with followup_inactive_24h)

### 3. Google AI (Gemini)
- [ ] Go to https://aistudio.google.com/apikey
- [ ] Click "Create API Key"
- [ ] Select or create a Google Cloud project
- [ ] Copy the API key -> `GEMINI_API_KEY`
- [ ] (Optional) Set up billing in Google Cloud Console for higher rate limits
- [ ] Free tier: 15 RPM, 1M TPM, 1500 RPD — sufficient for low-medium volume

### 4. Upstash Redis
- [ ] Create database at console.upstash.com (choose region near Vercel)
- [ ] Copy REST URL -> `UPSTASH_REDIS_REST_URL`
- [ ] Copy REST Token -> `UPSTASH_REDIS_REST_TOKEN`

### 5. Generate Secrets
```bash
# Encryption key for sensitive fields
openssl rand -hex 32
# -> FIELD_ENCRYPTION_KEY

# Cron endpoint secret
openssl rand -hex 32
# -> CRON_SECRET

# WhatsApp webhook verify token
openssl rand -hex 32
# -> WHATSAPP_WEBHOOK_VERIFY_TOKEN
```

## Deploy to Vercel

### 1. Connect Repository
```bash
vercel link
# or connect via Vercel Dashboard > New Project > Import Git Repository
```

### 2. Set Environment Variables
In Vercel Dashboard > Project Settings > Environment Variables, add ALL variables from `.env.example`. Set them for Production, Preview, and Development as appropriate:

**Production + Preview + Development:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_FIRM_NAME`
- `NEXT_PUBLIC_FIRM_NAME_SHORT`
- `NEXT_PUBLIC_DEFAULT_LOCALE`
- `NEXT_PUBLIC_SITE_URL` (different per environment)
- `NEXT_PUBLIC_PRIVACY_POLICY_VERSION`
- `NEXT_PUBLIC_CONSENT_TEXT_VERSION`
- `NEXT_PUBLIC_WA_NUMBER` (global WhatsApp number)

**Production only (secrets):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_APP_SECRET`
- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `FIELD_ENCRYPTION_KEY`
- `CRON_SECRET`
- All other `WHATSAPP_*` variables

### 3. Deploy
```bash
vercel --prod
```

### 4. Configure WhatsApp Webhook
After deployment, in Meta Business Suite or your BSP:
1. Set Callback URL: `https://your-domain.com/api/webhook/whatsapp`
2. Set Verify Token: same as `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
3. Subscribe to: messages, message_deliveries, message_reads
4. Send a test message to the WhatsApp number -- verify it arrives in the webhook

### 5. Verify Crons
In Vercel Dashboard > Project > Crons tab:
- Verify 4 crons are listed
- Trigger each one manually to test
- Check logs for 200 responses

### 6. Create Admin Account
1. Go to `https://your-domain.com/dashboard`
2. Sign up with the email matching `seed.sql` (admin@manuelsolis.com or your email)
3. In Supabase, get the auth user UUID from Authentication > Users
4. Run in SQL Editor:
```sql
UPDATE public.team_members
SET user_id = 'YOUR-AUTH-USER-UUID'
WHERE email = 'admin@manuelsolis.com';
```

### 7. Submit WhatsApp Templates
After webhook is verified:
1. Go to Dashboard > Templates
2. For each template, submit for WhatsApp approval via Meta Business Suite
3. Once approved, update the template's `wa_status` and `wa_template_id` in the database

## Post-Deploy Verification

- [ ] Landing page loads, WhatsApp button works
- [ ] Consent record appears in Supabase after clicking button
- [ ] Webhook receives test message
- [ ] AI qualification responds correctly
- [ ] Dashboard login works
- [ ] Inbox shows conversations
- [ ] Replying from dashboard sends WhatsApp message
- [ ] Opt-out keyword stops messaging
- [ ] Cron follow-ups fire on schedule
- [ ] Analytics page shows data
- [ ] Window countdown displays correctly
- [ ] Quiet hours block follow-ups appropriately

## Local Testing

Test scripts are provided for development without live WhatsApp:

```bash
# Start dev server first
npm run dev

# Test consent recording
npm run test:consent

# Test webhook scenarios
npm run test:webhook:new      # New lead message
npm run test:webhook:reply    # User selects option 1
npm run test:webhook:info     # User provides case info
npm run test:webhook:optout   # User sends BAJA

# Test cron jobs
npm run test:cron followup
npm run test:cron window-closer
npm run test:cron consent-audit
npm run test:cron analytics-rollup
```
