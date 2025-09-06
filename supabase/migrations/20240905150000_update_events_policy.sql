-- Drop the existing policy for events
DROP POLICY IF EXISTS "Enable all for users based on user_id" ON public.events;

-- Create a new policy that allows insert and update operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" 
ON public.events
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Ensure the events table has RLS enabled
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
