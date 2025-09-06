-- Disable RLS temporarily to allow policy changes
ALTER TABLE public.reservations DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for testing only)
CREATE POLICY "Allow all operations"
ON public.reservations
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable RLS
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
