-- Drop the existing insert-only policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.products;

-- Create a new policy that allows both insert and update operations
CREATE POLICY "Enable insert and update for authenticated users" 
ON public.products
FOR ALL
USING (true)
WITH CHECK (true);
