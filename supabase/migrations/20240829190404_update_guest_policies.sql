-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.guests;
DROP POLICY IF EXISTS "Allow public inserts for guest reservations" ON public.guests;
DROP POLICY IF EXISTS "Allow updates by guests" ON public.guests;
DROP POLICY IF EXISTS "Allow deletes by event owners" ON public.guests;

-- Allow public inserts to guests table for new reservations
CREATE POLICY "Allow public inserts for guest reservations"
ON public.guests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow read access for all users
CREATE POLICY "Enable read access for all users" 
ON public.guests 
FOR SELECT 
USING (true);

-- Allow updates by guests or event owners
CREATE POLICY "Allow updates by guests"
ON public.guests
FOR UPDATE
USING (
  email = auth.jwt() ->> 'email' 
  OR EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = guests.event_id 
    AND public.events.user_id = auth.uid()
  )
);

-- Allow deletes only by event owners
CREATE POLICY "Allow deletes by event owners"
ON public.guests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = guests.event_id 
    AND public.events.user_id = auth.uid()
  )
);
