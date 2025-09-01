-- Add quantity column to reservations table
ALTER TABLE public.reservations 
ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Update RLS policy to include quantity
DROP POLICY IF EXISTS "Enable read access for all users" ON public.reservations;
CREATE POLICY "Enable read access for all users" 
ON public.reservations 
FOR SELECT 
USING (true);
