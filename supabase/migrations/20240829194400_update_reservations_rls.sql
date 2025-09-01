-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reservations;
DROP POLICY IF EXISTS "Allow public inserts for reservations" ON public.reservations;

-- Allow public read access to reservations
CREATE POLICY "Enable read access for all users" 
ON public.reservations 
FOR SELECT 
USING (true);

-- Allow public inserts for new reservations
CREATE POLICY "Allow public inserts for reservations"
ON public.reservations
FOR INSERT
TO public
WITH CHECK (true);

-- Allow updates by event owners or guest owners
CREATE POLICY "Allow updates by event owners or guests"
ON public.reservations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.guests
    JOIN public.events ON public.events.id = public.guests.event_id
    WHERE public.guests.id = reservations.guest_id
    AND (
      public.guests.email = auth.jwt() ->> 'email' 
      OR public.events.user_id = auth.uid()
    )
  )
);
