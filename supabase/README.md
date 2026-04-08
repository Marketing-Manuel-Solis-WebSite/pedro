# Supabase Setup

## 1. Create Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose org, set project name: `whatsapp-lead-platform`
4. Set a strong database password (save it securely)
5. Select region closest to your users (e.g., `us-east-1` for US)
6. Click "Create new project" and wait ~2 minutes

## 2. Get Credentials

1. Go to Project Settings > API
2. Copy:
   - **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** -> `SUPABASE_SERVICE_ROLE_KEY`
3. Paste into `.env.local`

## 3. Run Schema

1. Go to SQL Editor in Supabase Dashboard
2. Click "New Query"
3. Paste the entire contents of `supabase/schema.sql`
4. Click "Run" (or Cmd+Enter)
5. Verify: you should see 0 errors and all tables created

## 4. Run Seed Data

1. In SQL Editor, new query
2. Paste contents of `supabase/seed.sql`
3. Update the admin email if needed
4. Click "Run"

## 5. Enable Realtime

1. Go to Database > Replication
2. Verify that `leads`, `messages`, and `conversation_events` tables are listed under "supabase_realtime"
3. If not, run: `ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;` (etc.)

## 6. Configure Auth

1. Go to Authentication > Settings
2. Set Site URL: your production URL (e.g., `https://your-domain.com`)
3. Add redirect URLs: `http://localhost:3000/**`, `https://your-domain.com/**`
4. Under Email Auth: keep enabled, disable "Confirm email" for development (re-enable for production)
5. Disable all social providers (admin-only access, no social login)

## 7. Link Admin User

After the first admin signs up through the dashboard:

```sql
-- Get the auth user ID from Authentication > Users in Supabase
UPDATE public.team_members
SET user_id = 'paste-auth-user-uuid-here'
WHERE email = 'admin@manuelsolis.com';
```

## 8. WhatsApp Webhook

Configure in Meta Business Suite or your BSP:
- **Callback URL:** `https://your-domain.com/api/webhook/whatsapp`
- **Verify Token:** same value as `WHATSAPP_WEBHOOK_VERIFY_TOKEN` in `.env.local`
- **Subscribed fields:** `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`

## 9. Verify Everything

Run locally:
```bash
npm run dev
```

Check:
- [ ] Landing page loads at `http://localhost:3000`
- [ ] WhatsApp button captures consent (check `consent_records` table)
- [ ] Dashboard loads at `http://localhost:3000/dashboard` (after login)
- [ ] Webhook responds to GET verification at `/api/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test`
