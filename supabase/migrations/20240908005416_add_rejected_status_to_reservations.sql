-- Add 'rejected' to the allowed status values in the reservations table
ALTER TABLE public.reservations 
DROP CONSTRAINT IF EXISTS reservations_status_check;

ALTER TABLE public.reservations 
ADD CONSTRAINT reservations_status_check 
CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rejected'));
