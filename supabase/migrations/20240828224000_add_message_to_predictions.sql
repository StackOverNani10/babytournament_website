-- Add message column to predictions table
alter table public.predictions 
add column if not exists message text;

-- Update the type for the predictions table to include the new column
drop type if exists public.prediction_type;
create type public.prediction_type as enum ('boy', 'girl');

drop view if exists public.predictions_view;
create or replace view public.predictions_view with (security_invoker = on) as
 SELECT 
    p.id,
    p.event_id,
    p.guest_id,
    p.prediction::prediction_type AS prediction,
    p.name_suggestion,
    p.message,
    p.created_at,
    g.name AS guest_name,
    g.email AS guest_email
  from public.predictions p
  join public.guests g on p.guest_id = g.id;
