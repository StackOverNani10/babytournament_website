-- Check if user_id column exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_schema = 'public' 
                  AND table_name = 'guests' 
                  AND column_name = 'user_id') THEN
        ALTER TABLE public.guests 
        ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all for users based on event ownership" ON public.guests;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.guests;
DROP POLICY IF EXISTS "Enable insert for public predictions" ON public.guests;

-- Create or replace policies
CREATE POLICY "Enable read access for all users" 
ON public.guests
FOR SELECT
USING (true);

CREATE POLICY "Enable insert for public predictions"
ON public.guests
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable all for users based on event ownership"
ON public.guests
FOR ALL
USING (
  (EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = guests.event_id 
    AND public.events.user_id = auth.uid()
  ))
  OR
  (user_id = auth.uid())
  OR
  (auth.uid() IS NULL AND current_setting('request.jwt.claim.role', true) = 'service_role')
);
