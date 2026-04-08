-- ============================================================
-- Seed Data — Run after schema.sql
-- Replace the email below with the actual admin email
-- ============================================================

-- Default admin (link to Supabase Auth user after first signup)
-- After the admin signs up via the dashboard login, run:
--   UPDATE public.team_members SET user_id = 'AUTH_USER_UUID_HERE' WHERE email = 'admin@manuelsolis.com';
INSERT INTO public.team_members (name, email, role, office_location, specialties)
VALUES (
  'Admin',
  'admin@manuelsolis.com',
  'admin',
  'texas',
  ARRAY['all']
)
ON CONFLICT (email) DO NOTHING;
