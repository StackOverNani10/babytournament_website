-- Drop existing policies
DROP POLICY IF EXISTS "Allow updates by admins" ON public.reservations;
DROP POLICY IF EXISTS "Allow updates by event owners or guests" ON public.reservations;

-- Ensure the reservations table has RLS enabled
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
