-- Fix: rollup_daily_analytics — replace correlated subqueries with CTEs + JOINs
-- Paste this into Supabase SQL Editor and run it.

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
