-- Drop the trigger that's causing issues
drop trigger if exists on_photo_uploaded on public.event_photos;

-- Drop the function that's no longer needed
drop function if exists public.handle_photo_upload();

-- Update the event_photos table to handle URL generation in the application
comment on column public.event_photos.url is 'URL is now generated in the application code using VITE_SUPABASE_URL and storage_path';
