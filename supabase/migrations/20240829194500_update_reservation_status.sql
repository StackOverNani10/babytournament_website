-- First, drop the existing constraint if it exists
ALTER TABLE public.reservations 
DROP CONSTRAINT IF EXISTS reservations_status_check;

-- Then add the new constraint with allowed status values
ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

-- Update any existing 'reserved' status to 'confirmed'
UPDATE public.reservations 
SET status = 'confirmed' 
WHERE status = 'reserved';
