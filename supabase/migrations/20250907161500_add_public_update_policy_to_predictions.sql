-- Drop the existing restrictive update policy
DROP POLICY IF EXISTS "Enable update for event owners and prediction creators" ON public.predictions;

-- Create a new policy to allow public updates on the predictions table
CREATE POLICY "Enable public update access for predictions"
ON public.predictions
FOR UPDATE
USING (true)
WITH CHECK (true);
