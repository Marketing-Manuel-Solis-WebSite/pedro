-- ============================================================
-- WhatsApp Lead Intelligence Platform — Full Database Schema
-- Run this entire file in Supabase SQL Editor as a single execution.
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ============================================================
-- 1. TEAM MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'attorney', 'paralegal', 'intake')),
  office_location VARCHAR(100),
  specialties TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  max_concurrent_chats INTEGER DEFAULT 5 CHECK (max_concurrent_chats > 0),
  current_chat_count INTEGER DEFAULT 0 CHECK (current_chat_count >= 0),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_members_role ON public.team_members(role);
CREATE INDEX idx_team_members_available ON public.team_members(is_available) WHERE is_available = true;

-- ============================================================
-- 2. CONSENT RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consent_event_id UUID NOT NULL UNIQUE, -- idempotency key from client
  phone VARCHAR(20) NOT NULL,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN ('whatsapp_initial', 'whatsapp_followup', 'marketing')),
  consent_method VARCHAR(50) NOT NULL CHECK (consent_method IN ('button_click', 'reply_message', 'template_reply')),
  source_url TEXT NOT NULL,
  source_page_title VARCHAR(500),
  campaign VARCHAR(255),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),
  legal_text_shown TEXT NOT NULL,
  legal_text_version VARCHAR(50) NOT NULL,
  privacy_policy_url TEXT NOT NULL,
  privacy_policy_version VARCHAR(50) NOT NULL,
  destination_phone VARCHAR(20) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  language VARCHAR(10) DEFAULT 'es' CHECK (language IN ('es', 'en')),
  is_active BOOLEAN DEFAULT true,
  is_complete BOOLEAN DEFAULT true, -- false if any required field was missing
  revoked_at TIMESTAMPTZ,
  revocation_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_phone ON public.consent_records(phone);
CREATE INDEX idx_consent_active ON public.consent_records(is_active) WHERE is_active = true;
CREATE INDEX idx_consent_event_id ON public.consent_records(consent_event_id);
CREATE INDEX idx_consent_created ON public.consent_records(created_at DESC);
CREATE INDEX idx_consent_incomplete ON public.consent_records(is_complete) WHERE is_complete = false;

-- ============================================================
-- 3. LEADS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  phone_normalized VARCHAR(20) NOT NULL, -- E.164 format
  name VARCHAR(255),
  email CITEXT,
  city VARCHAR(255),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'US',
  description TEXT,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'assigned', 'in_progress', 'closed_won', 'closed_lost', 'spam', 'archived')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
  qualification_summary TEXT,
  office_location VARCHAR(100),
  case_type VARCHAR(100),
  case_subtype VARCHAR(100),
  source_url TEXT NOT NULL,
  source_campaign VARCHAR(255),
  source_medium VARCHAR(100),
  source_utm_source VARCHAR(255),
  source_utm_campaign VARCHAR(255),
  source_utm_content VARCHAR(255),
  source_utm_term VARCHAR(255),
  consent_id UUID REFERENCES public.consent_records(id) ON DELETE RESTRICT NOT NULL,
  wa_conversation_id VARCHAR(255),
  wa_window_expires_at TIMESTAMPTZ,
  last_user_message_at TIMESTAMPTZ,
  last_bot_message_at TIMESTAMPTZ,
  last_human_message_at TIMESTAMPTZ,
  followup_count INTEGER DEFAULT 0 CHECK (followup_count >= 0),
  is_opted_out BOOLEAN DEFAULT false,
  opted_out_at TIMESTAMPTZ,
  opted_out_method VARCHAR(50),
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  timezone VARCHAR(50) DEFAULT 'America/Chicago',
  language VARCHAR(10) DEFAULT 'es' CHECK (language IN ('es', 'en')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_leads_phone_normalized ON public.leads(phone_normalized);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_priority ON public.leads(priority);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_leads_wa_window ON public.leads(wa_window_expires_at) WHERE wa_window_expires_at IS NOT NULL;
CREATE INDEX idx_leads_opted_out ON public.leads(is_opted_out) WHERE is_opted_out = true;
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX idx_leads_office ON public.leads(office_location) WHERE office_location IS NOT NULL;
CREATE INDEX idx_leads_consent ON public.leads(consent_id);
CREATE INDEX idx_leads_followup_eligible ON public.leads(status, is_opted_out, wa_window_expires_at, followup_count)
  WHERE is_opted_out = false AND status IN ('new', 'qualified');

-- ============================================================
-- 4. MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  wa_message_id VARCHAR(255) UNIQUE,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('user', 'bot', 'human', 'template', 'system')),
  sender_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL, -- NULL for bot/user/system
  content TEXT NOT NULL,
  content_type VARCHAR(50) DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'document', 'audio', 'video', 'template', 'interactive', 'reaction')),
  template_name VARCHAR(255),
  template_variables JSONB,
  is_within_window BOOLEAN DEFAULT true,
  ai_intent_detected VARCHAR(100),
  ai_sentiment VARCHAR(50),
  ai_handoff_recommended BOOLEAN DEFAULT false,
  ai_qualification_data JSONB, -- full AI response JSON for audit
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_lead ON public.messages(lead_id);
CREATE INDEX idx_messages_lead_created ON public.messages(lead_id, created_at DESC);
CREATE INDEX idx_messages_wa_id ON public.messages(wa_message_id) WHERE wa_message_id IS NOT NULL;
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX idx_messages_direction ON public.messages(direction);
CREATE INDEX idx_messages_failed ON public.messages(failed_at) WHERE failed_at IS NOT NULL;

-- ============================================================
-- 5. WHATSAPP TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.wa_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL, -- human-readable name for dashboard
  language VARCHAR(10) DEFAULT 'es' CHECK (language IN ('es', 'en')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('utility', 'marketing', 'authentication')),
  body_text TEXT NOT NULL,
  header_text TEXT,
  header_type VARCHAR(20) CHECK (header_type IN ('text', 'image', 'document', 'video')),
  footer_text TEXT,
  buttons JSONB DEFAULT '[]',
  variables TEXT[] DEFAULT '{}',
  sample_values TEXT[] DEFAULT '{}', -- sample data for preview
  wa_status VARCHAR(50) DEFAULT 'draft' CHECK (wa_status IN ('draft', 'pending', 'approved', 'rejected', 'paused', 'disabled')),
  wa_template_id VARCHAR(255), -- ID from WhatsApp after approval
  wa_rejection_reason TEXT,
  use_case VARCHAR(100) NOT NULL, -- 'followup_24h' | 'appointment_confirm' | 'case_update' | 'reactivation' | 'opt_in_request'
  send_count INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.team_members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_status ON public.wa_templates(wa_status);
CREATE INDEX idx_templates_use_case ON public.wa_templates(use_case);
CREATE INDEX idx_templates_name ON public.wa_templates(template_name);

-- ============================================================
-- 6. CONVERSATION EVENTS (audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'window_opened', 'window_closed', 'window_renewed',
    'handoff_to_human', 'handoff_accepted', 'handoff_rejected',
    'followup_sent', 'followup_skipped',
    'opt_out', 'opt_in',
    'template_sent', 'template_failed',
    'blocked', 'spam_reported',
    'qualification_complete', 'qualification_failed',
    'status_changed', 'priority_changed',
    'assigned', 'unassigned', 'transferred',
    'note_added', 'tag_added', 'tag_removed',
    'phone_viewed', 'data_exported',
    'lead_archived', 'lead_restored',
    'consent_recorded', 'consent_revoked',
    'message_failed', 'message_retried',
    'quiet_hours_blocked'
  )),
  event_data JSONB DEFAULT '{}',
  triggered_by VARCHAR(50) NOT NULL CHECK (triggered_by IN ('system', 'bot', 'human', 'user', 'cron', 'webhook')),
  actor_id UUID REFERENCES public.team_members(id) ON DELETE SET NULL, -- who performed it (NULL for system/bot/cron)
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_lead ON public.conversation_events(lead_id);
CREATE INDEX idx_events_lead_created ON public.conversation_events(lead_id, created_at DESC);
CREATE INDEX idx_events_type ON public.conversation_events(event_type);
CREATE INDEX idx_events_created ON public.conversation_events(created_at DESC);
CREATE INDEX idx_events_actor ON public.conversation_events(actor_id) WHERE actor_id IS NOT NULL;

-- ============================================================
-- 7. OPT-OUT EXCLUSION LIST (denormalized for fast lookups)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.opt_out_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_normalized VARCHAR(20) NOT NULL UNIQUE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  reason VARCHAR(100) DEFAULT 'user_request',
  opted_out_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_opt_out_phone ON public.opt_out_list(phone_normalized);

-- ============================================================
-- 8. ANALYTICS DAILY ROLLUPS (for fast dashboard queries)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  office_location VARCHAR(100),
  source_campaign VARCHAR(255),
  source_medium VARCHAR(100),
  total_leads INTEGER DEFAULT 0,
  qualified_leads INTEGER DEFAULT 0,
  assigned_leads INTEGER DEFAULT 0,
  closed_won INTEGER DEFAULT 0,
  closed_lost INTEGER DEFAULT 0,
  opt_outs INTEGER DEFAULT 0,
  avg_first_response_ms BIGINT, -- milliseconds
  avg_handoff_ms BIGINT,
  total_messages_inbound INTEGER DEFAULT 0,
  total_messages_outbound INTEGER DEFAULT 0,
  total_templates_sent INTEGER DEFAULT 0,
  total_followups_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, office_location, source_campaign, source_medium)
);

CREATE INDEX idx_analytics_date ON public.analytics_daily(date DESC);
CREATE INDEX idx_analytics_office ON public.analytics_daily(office_location);
CREATE INDEX idx_analytics_date_range ON public.analytics_daily(date, office_location);

-- ============================================================
-- 9. FUNCTIONS
-- ============================================================

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER set_updated_at_leads
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_wa_templates
  BEFORE UPDATE ON public.wa_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_analytics
  BEFORE UPDATE ON public.analytics_daily
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function: Renew the 24h window when a user sends a message
CREATE OR REPLACE FUNCTION public.renew_wa_window()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'inbound' AND NEW.sender_type = 'user' THEN
    UPDATE public.leads
    SET
      wa_window_expires_at = NOW() + INTERVAL '24 hours',
      last_user_message_at = NOW(),
      followup_count = 0, -- reset followup counter on re-engagement
      updated_at = NOW()
    WHERE id = NEW.lead_id;

    -- Log window renewal event
    INSERT INTO public.conversation_events (lead_id, event_type, triggered_by, event_data)
    VALUES (
      NEW.lead_id,
      'window_renewed',
      'webhook',
      jsonb_build_object('message_id', NEW.id, 'new_expiry', (NOW() + INTERVAL '24 hours')::text)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_renew_wa_window
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.renew_wa_window();

-- Function: Auto-add to opt-out list when lead opts out
CREATE OR REPLACE FUNCTION public.sync_opt_out_list()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_opted_out = true AND (OLD.is_opted_out IS NULL OR OLD.is_opted_out = false) THEN
    INSERT INTO public.opt_out_list (phone_normalized, lead_id, reason, opted_out_at)
    VALUES (NEW.phone_normalized, NEW.id, COALESCE(NEW.opted_out_method, 'user_request'), COALESCE(NEW.opted_out_at, NOW()))
    ON CONFLICT (phone_normalized) DO UPDATE SET
      opted_out_at = COALESCE(NEW.opted_out_at, NOW());

    -- Deactivate all consent records for this phone
    UPDATE public.consent_records
    SET is_active = false, revoked_at = NOW(), revocation_method = COALESCE(NEW.opted_out_method, 'user_request')
    WHERE phone = NEW.phone AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_sync_opt_out
  AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.sync_opt_out_list();

-- Function: Update team member chat count on lead assignment
CREATE OR REPLACE FUNCTION public.update_chat_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement old assignee count
  IF OLD.assigned_to IS NOT NULL AND (NEW.assigned_to IS NULL OR NEW.assigned_to != OLD.assigned_to) THEN
    UPDATE public.team_members
    SET current_chat_count = GREATEST(current_chat_count - 1, 0)
    WHERE id = OLD.assigned_to;
  END IF;

  -- Increment new assignee count
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR NEW.assigned_to != OLD.assigned_to) THEN
    UPDATE public.team_members
    SET current_chat_count = current_chat_count + 1
    WHERE id = NEW.assigned_to;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_chat_counts
  AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_chat_counts();

-- Function: Check if phone is in opt-out list before sending
CREATE OR REPLACE FUNCTION public.is_phone_opted_out(p_phone VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.opt_out_list WHERE phone_normalized = p_phone);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Check if lead is within 24h window
CREATE OR REPLACE FUNCTION public.is_within_wa_window(p_lead_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leads
    WHERE id = p_lead_id
    AND wa_window_expires_at IS NOT NULL
    AND wa_window_expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Get follow-up eligible leads (used by cron)
CREATE OR REPLACE FUNCTION public.get_followup_eligible_leads()
RETURNS TABLE (
  lead_id UUID,
  phone_normalized VARCHAR,
  followup_count INTEGER,
  last_bot_message_at TIMESTAMPTZ,
  wa_window_expires_at TIMESTAMPTZ,
  timezone VARCHAR,
  language VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.phone_normalized,
    l.followup_count,
    l.last_bot_message_at,
    l.wa_window_expires_at,
    l.timezone,
    l.language
  FROM public.leads l
  WHERE l.is_opted_out = false
    AND l.status IN ('new', 'qualified')
    AND l.wa_window_expires_at > NOW() -- still within window
    AND l.last_user_message_at IS NOT NULL
    AND l.last_bot_message_at IS NOT NULL
    AND l.last_bot_message_at > l.last_user_message_at -- bot sent last (user hasn't replied)
    AND l.followup_count < 2
    AND NOT EXISTS (SELECT 1 FROM public.opt_out_list o WHERE o.phone_normalized = l.phone_normalized);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Get leads whose window expired (need template follow-up)
CREATE OR REPLACE FUNCTION public.get_window_expired_leads()
RETURNS TABLE (
  lead_id UUID,
  phone_normalized VARCHAR,
  followup_count INTEGER,
  timezone VARCHAR,
  language VARCHAR,
  consent_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.phone_normalized,
    l.followup_count,
    l.timezone,
    l.language,
    l.consent_id
  FROM public.leads l
  WHERE l.is_opted_out = false
    AND l.status IN ('new', 'qualified')
    AND l.wa_window_expires_at IS NOT NULL
    AND l.wa_window_expires_at <= NOW() -- window expired
    AND l.followup_count = 2 -- already sent 2 in-window follow-ups, now template
    AND NOT EXISTS (SELECT 1 FROM public.opt_out_list o WHERE o.phone_normalized = l.phone_normalized);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function: Daily analytics rollup
CREATE OR REPLACE FUNCTION public.rollup_daily_analytics(target_date DATE)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.analytics_daily (
    date, office_location, source_campaign, source_medium,
    total_leads, qualified_leads, assigned_leads, closed_won, closed_lost, opt_outs,
    total_messages_inbound, total_messages_outbound, total_templates_sent, total_followups_sent
  )
  WITH lead_stats AS (
    SELECT
      l.office_location,
      l.source_campaign,
      l.source_medium,
      COUNT(*) FILTER (WHERE l.created_at::date = target_date) AS total_leads,
      COUNT(*) FILTER (WHERE l.status = 'qualified' AND l.updated_at::date = target_date) AS qualified_leads,
      COUNT(*) FILTER (WHERE l.status = 'assigned' AND l.updated_at::date = target_date) AS assigned_leads,
      COUNT(*) FILTER (WHERE l.status = 'closed_won' AND l.updated_at::date = target_date) AS closed_won,
      COUNT(*) FILTER (WHERE l.status = 'closed_lost' AND l.updated_at::date = target_date) AS closed_lost,
      COUNT(*) FILTER (WHERE l.is_opted_out = true AND l.opted_out_at::date = target_date) AS opt_outs
    FROM public.leads l
    WHERE l.created_at::date = target_date OR l.updated_at::date = target_date
    GROUP BY l.office_location, l.source_campaign, l.source_medium
  ),
  msg_stats AS (
    SELECT
      l.office_location,
      l.source_campaign,
      l.source_medium,
      COUNT(*) FILTER (WHERE m.direction = 'inbound') AS inbound,
      COUNT(*) FILTER (WHERE m.direction = 'outbound') AS outbound,
      COUNT(*) FILTER (WHERE m.sender_type = 'template') AS templates
    FROM public.messages m
    JOIN public.leads l ON l.id = m.lead_id
    WHERE m.created_at::date = target_date
    GROUP BY l.office_location, l.source_campaign, l.source_medium
  ),
  ev_stats AS (
    SELECT
      l.office_location,
      l.source_campaign,
      l.source_medium,
      COUNT(*) AS followups
    FROM public.conversation_events e
    JOIN public.leads l ON l.id = e.lead_id
    WHERE e.event_type = 'followup_sent' AND e.created_at::date = target_date
    GROUP BY l.office_location, l.source_campaign, l.source_medium
  )
  SELECT
    target_date,
    ls.office_location,
    ls.source_campaign,
    ls.source_medium,
    ls.total_leads,
    ls.qualified_leads,
    ls.assigned_leads,
    ls.closed_won,
    ls.closed_lost,
    ls.opt_outs,
    COALESCE(ms.inbound, 0),
    COALESCE(ms.outbound, 0),
    COALESCE(ms.templates, 0),
    COALESCE(es.followups, 0)
  FROM lead_stats ls
  LEFT JOIN msg_stats ms
    ON ls.office_location IS NOT DISTINCT FROM ms.office_location
    AND ls.source_campaign IS NOT DISTINCT FROM ms.source_campaign
    AND ls.source_medium IS NOT DISTINCT FROM ms.source_medium
  LEFT JOIN ev_stats es
    ON ls.office_location IS NOT DISTINCT FROM es.office_location
    AND ls.source_campaign IS NOT DISTINCT FROM es.source_campaign
    AND ls.source_medium IS NOT DISTINCT FROM es.source_medium
  ON CONFLICT (date, office_location, source_campaign, source_medium)
  DO UPDATE SET
    total_leads = EXCLUDED.total_leads,
    qualified_leads = EXCLUDED.qualified_leads,
    assigned_leads = EXCLUDED.assigned_leads,
    closed_won = EXCLUDED.closed_won,
    closed_lost = EXCLUDED.closed_lost,
    opt_outs = EXCLUDED.opt_outs,
    total_messages_inbound = EXCLUDED.total_messages_inbound,
    total_messages_outbound = EXCLUDED.total_messages_outbound,
    total_templates_sent = EXCLUDED.total_templates_sent,
    total_followups_sent = EXCLUDED.total_followups_sent,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 10. ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opt_out_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily ENABLE ROW LEVEL SECURITY;

-- Helper: Check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: Check if current user is a team member
CREATE OR REPLACE FUNCTION public.is_team_member()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: Get current team member id
CREATE OR REPLACE FUNCTION public.current_team_member_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.team_members WHERE user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- TEAM MEMBERS: all team members can read, only admins can write
CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT TO authenticated USING (public.is_team_member());

CREATE POLICY "team_members_insert" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "team_members_update" ON public.team_members
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "team_members_delete" ON public.team_members
  FOR DELETE TO authenticated USING (public.is_admin());

-- CONSENT RECORDS: all team members can read, insert via service role (API routes)
-- Consent records are never deleted, only deactivated
CREATE POLICY "consent_select" ON public.consent_records
  FOR SELECT TO authenticated USING (public.is_team_member());

CREATE POLICY "consent_insert_service" ON public.consent_records
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "consent_update_service" ON public.consent_records
  FOR UPDATE TO service_role USING (true);

-- LEADS: team members see their assigned leads + unassigned, admins see all
CREATE POLICY "leads_select" ON public.leads
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR assigned_to = public.current_team_member_id()
    OR assigned_to IS NULL
  );

CREATE POLICY "leads_insert_service" ON public.leads
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "leads_update" ON public.leads
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR assigned_to = public.current_team_member_id()
  );

CREATE POLICY "leads_update_service" ON public.leads
  FOR UPDATE TO service_role USING (true);

-- MESSAGES: team members see messages for leads they can access
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = messages.lead_id
      AND (
        public.is_admin()
        OR l.assigned_to = public.current_team_member_id()
        OR l.assigned_to IS NULL
      )
    )
  );

CREATE POLICY "messages_insert_service" ON public.messages
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "messages_update_service" ON public.messages
  FOR UPDATE TO service_role USING (true);

-- WA TEMPLATES: all team members can read, admins can write
CREATE POLICY "templates_select" ON public.wa_templates
  FOR SELECT TO authenticated USING (public.is_team_member());

CREATE POLICY "templates_insert" ON public.wa_templates
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());

CREATE POLICY "templates_update" ON public.wa_templates
  FOR UPDATE TO authenticated USING (public.is_admin());

CREATE POLICY "templates_delete" ON public.wa_templates
  FOR DELETE TO authenticated USING (public.is_admin());

-- CONVERSATION EVENTS: team members read for accessible leads, service role writes
CREATE POLICY "events_select" ON public.conversation_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = conversation_events.lead_id
      AND (
        public.is_admin()
        OR l.assigned_to = public.current_team_member_id()
        OR l.assigned_to IS NULL
      )
    )
  );

CREATE POLICY "events_insert_service" ON public.conversation_events
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "events_insert_auth" ON public.conversation_events
  FOR INSERT TO authenticated WITH CHECK (public.is_team_member());

-- OPT OUT LIST: service role only (checked by API routes)
CREATE POLICY "opt_out_select_service" ON public.opt_out_list
  FOR SELECT TO service_role USING (true);

CREATE POLICY "opt_out_select_auth" ON public.opt_out_list
  FOR SELECT TO authenticated USING (public.is_admin());

CREATE POLICY "opt_out_insert_service" ON public.opt_out_list
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "opt_out_update_service" ON public.opt_out_list
  FOR UPDATE TO service_role USING (true);

-- ANALYTICS: all team members can read, service role writes
CREATE POLICY "analytics_select" ON public.analytics_daily
  FOR SELECT TO authenticated USING (public.is_team_member());

CREATE POLICY "analytics_insert_service" ON public.analytics_daily
  FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "analytics_update_service" ON public.analytics_daily
  FOR UPDATE TO service_role USING (true);

-- ============================================================
-- 11. ENABLE REALTIME for inbox
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_events;

-- ============================================================
-- 12. SEED: Default templates
-- ============================================================
INSERT INTO public.wa_templates (template_name, display_name, language, category, body_text, variables, use_case, wa_status)
VALUES
  (
    'followup_inactive_24h',
    'Seguimiento 24h - Consulta Pendiente',
    'es',
    'utility',
    'Gracias por contactar a {{1}}. Tu consulta quedó pendiente. Si deseas continuar, responde a este mensaje y con gusto la retomamos.',
    ARRAY['firm_name'],
    'followup_24h',
    'draft'
  ),
  (
    'followup_inactive_24h_en',
    'Follow-up 24h - Pending Inquiry',
    'en',
    'utility',
    'Thank you for contacting {{1}}. Your inquiry is still pending. If you''d like to continue, reply to this message and we''ll be happy to help.',
    ARRAY['firm_name'],
    'followup_24h',
    'draft'
  ),
  (
    'appointment_confirmation',
    'Confirmación de Cita',
    'es',
    'utility',
    '{{1}}, tu cita con {{2}} está confirmada para el {{3}} a las {{4}}. Si necesitas reagendar, responde a este mensaje.',
    ARRAY['client_name', 'attorney_name', 'date', 'time'],
    'appointment_confirm',
    'draft'
  ),
  (
    'appointment_confirmation_en',
    'Appointment Confirmation',
    'en',
    'utility',
    '{{1}}, your appointment with {{2}} is confirmed for {{3}} at {{4}}. If you need to reschedule, reply to this message.',
    ARRAY['client_name', 'attorney_name', 'date', 'time'],
    'appointment_confirm',
    'draft'
  ),
  (
    'case_update',
    'Actualización de Caso',
    'es',
    'utility',
    '{{1}}, hay una actualización sobre tu caso. Por favor comunícate con nosotros al {{2}} o responde a este mensaje para más detalles.',
    ARRAY['client_name', 'office_phone'],
    'case_update',
    'draft'
  ),
  (
    'case_update_en',
    'Case Update',
    'en',
    'utility',
    '{{1}}, there is an update regarding your case. Please contact us at {{2}} or reply to this message for more details.',
    ARRAY['client_name', 'office_phone'],
    'case_update',
    'draft'
  )
ON CONFLICT (template_name) DO NOTHING;

-- ============================================================
-- DONE. Schema is ready.
-- ============================================================
