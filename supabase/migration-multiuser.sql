-- ============================================================
-- Migration: Multi-User System with Round Robin & Lead Lifecycle
-- Run in Supabase SQL Editor after schema.sql
-- Idempotent: safe to run multiple times
-- ============================================================

-- 1. Add round robin columns to team_members
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS can_receive_assignments BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_assigned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_closed_won INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_closed_lost INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_team_members_round_robin
  ON public.team_members (last_assigned_at ASC NULLS FIRST)
  WHERE is_available = true
    AND is_active = true
    AND can_receive_assignments = true;

-- 2. Update lead status constraint with full lifecycle
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check
  CHECK (status IN (
    'new',
    'ai_qualified',
    'assigned',
    'contacted',
    'consultation',
    'proposal_sent',
    'negotiation',
    'contracted',
    'in_process',
    'completed',
    'closed_lost',
    'closed_no_response',
    'spam',
    'archived'
  ));

-- 3. Round Robin assignment function
CREATE OR REPLACE FUNCTION public.round_robin_assign(p_lead_id UUID)
RETURNS UUID AS $$
DECLARE
  v_assignee_id UUID;
BEGIN
  SELECT id INTO v_assignee_id
  FROM public.team_members
  WHERE is_available = true
    AND is_active = true
    AND can_receive_assignments = true
    AND role IN ('attorney', 'paralegal', 'intake')
    AND current_chat_count < max_concurrent_chats
  ORDER BY
    last_assigned_at ASC NULLS FIRST,
    total_assigned ASC,
    random()
  LIMIT 1;

  IF v_assignee_id IS NOT NULL THEN
    UPDATE public.leads
    SET
      assigned_to = v_assignee_id,
      status = CASE
        WHEN status IN ('new', 'ai_qualified') THEN 'assigned'
        ELSE status
      END,
      updated_at = NOW()
    WHERE id = p_lead_id;

    UPDATE public.team_members
    SET
      last_assigned_at = NOW(),
      total_assigned = total_assigned + 1,
      current_chat_count = current_chat_count + 1
    WHERE id = v_assignee_id;

    INSERT INTO public.conversation_events (lead_id, event_type, triggered_by, event_data)
    VALUES (
      p_lead_id,
      'assigned',
      'system',
      jsonb_build_object('assigned_to', v_assignee_id, 'method', 'round_robin')
    );
  END IF;

  RETURN v_assignee_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Auto-link team member on signup
CREATE OR REPLACE FUNCTION public.auto_link_team_member()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.team_members
  SET user_id = NEW.id
  WHERE email = NEW.email
    AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_link_team_member ON auth.users;
CREATE TRIGGER trg_auto_link_team_member
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_link_team_member();

-- 5. Track status changes for win/loss counts
CREATE OR REPLACE FUNCTION public.track_lead_outcome()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment closed_won when lead reaches contracted or completed
  IF NEW.status IN ('contracted', 'completed') AND OLD.status NOT IN ('contracted', 'completed') THEN
    IF NEW.assigned_to IS NOT NULL THEN
      UPDATE public.team_members
      SET total_closed_won = total_closed_won + 1
      WHERE id = NEW.assigned_to;
    END IF;
  END IF;

  -- Increment closed_lost
  IF NEW.status IN ('closed_lost', 'closed_no_response') AND OLD.status NOT IN ('closed_lost', 'closed_no_response') THEN
    IF NEW.assigned_to IS NOT NULL THEN
      UPDATE public.team_members
      SET total_closed_lost = total_closed_lost + 1
      WHERE id = NEW.assigned_to;
    END IF;
  END IF;

  -- Log status change
  IF NEW.status != OLD.status THEN
    INSERT INTO public.conversation_events (lead_id, event_type, triggered_by, event_data)
    VALUES (
      NEW.id,
      'status_changed',
      'human',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_track_lead_outcome ON public.leads;
CREATE TRIGGER trg_track_lead_outcome
  AFTER UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.track_lead_outcome();

-- 6. Updated RLS policies
DROP POLICY IF EXISTS "leads_select" ON public.leads;
CREATE POLICY "leads_select" ON public.leads
  FOR SELECT TO authenticated
  USING (
    public.is_admin()
    OR assigned_to = public.current_team_member_id()
    OR (assigned_to IS NULL AND status IN ('new', 'ai_qualified'))
  );

DROP POLICY IF EXISTS "leads_update" ON public.leads;
CREATE POLICY "leads_update" ON public.leads
  FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR assigned_to = public.current_team_member_id()
  );

DROP POLICY IF EXISTS "team_members_update" ON public.team_members;
CREATE POLICY "team_members_update" ON public.team_members
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR id = public.current_team_member_id());

-- ============================================================
-- DONE. Run this after schema.sql.
-- ============================================================
