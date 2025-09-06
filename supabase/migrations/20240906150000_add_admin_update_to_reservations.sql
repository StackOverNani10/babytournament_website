-- Allow updates by admins
CREATE OR REPLACE POLICY "Allow updates by admins"
ON public.reservations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- Drop the old update policy to avoid conflicts
DROP POLICY IF EXISTS "Allow updates by event owners or guests" ON public.reservations;

-- Recreate the update policy with the original conditions plus admin access
CREATE POLICY "Allow updates by event owners, guests, or admins"
ON public.reservations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.guests
    JOIN public.events ON public.events.id = public.guests.event_id
    WHERE public.guests.id = reservations.guest_id
    AND (
      public.guests.email = auth.jwt() ->> 'email' 
      OR public.events.user_id = auth.uid()
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.guests
    JOIN public.events ON public.events.id = public.guests.event_id
    WHERE public.guests.id = reservations.guest_id
    AND (
      public.guests.email = auth.jwt() ->> 'email' 
      OR public.events.user_id = auth.uid()
    )
  )
);
