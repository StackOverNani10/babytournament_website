-- Enable RLS on predictions table if not already enabled
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable public read access" ON public.predictions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.predictions;

-- Allow public read access to predictions
CREATE POLICY "Enable public read access"
ON public.predictions
FOR SELECT
USING (true);

-- Allow public inserts for predictions with validation
CREATE POLICY "Enable public inserts for predictions"
ON public.predictions
FOR INSERT
WITH CHECK (
  -- Ensure the event exists
  EXISTS (SELECT 1 FROM public.events WHERE id = event_id)
  AND
  -- Ensure the guest exists
  EXISTS (SELECT 1 FROM public.guests WHERE id = guest_id)
);

-- Allow update/delete for event owners or the user who made the prediction
CREATE POLICY "Enable update for event owners and prediction creators"
ON public.predictions
FOR ALL
USING (
  -- Allow if user is the event owner
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = predictions.event_id 
    AND public.events.user_id = auth.uid()
  )
  OR
  -- Or if user is an admin
  (auth.role() = 'service_role')
);
