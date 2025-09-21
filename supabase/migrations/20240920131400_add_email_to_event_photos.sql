-- Add email column to event_photos table
ALTER TABLE public.event_photos 
ADD COLUMN IF NOT EXISTS email text;

-- Update the table to make uploaded_by nullable since we're allowing public uploads
ALTER TABLE public.event_photos 
ALTER COLUMN uploaded_by DROP NOT NULL;

-- Update existing rows with a default email if needed
UPDATE public.event_photos 
SET email = 'unknown@example.com' 
WHERE email IS NULL;

-- Add a check constraint for email format
ALTER TABLE public.event_photos
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Update the trigger function if it references the columns we're modifying
CREATE OR REPLACE FUNCTION public.handle_photo_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete the file from storage when a photo is deleted
  DELETE FROM storage.objects 
  WHERE bucket_id = 'event-photos' 
  AND name = OLD.storage_path;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql security definer;
