-- Update storage policies to allow public uploads

-- Drop existing policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads for authenticated users" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes for file owners and admins" ON storage.objects;

-- Recreate storage policies
-- Allow public read access
CREATE POLICY "Public Read Access" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'event-photos');

-- Allow public uploads with some restrictions
CREATE POLICY "Allow public uploads with restrictions" 
ON storage.objects 
FOR INSERT
WITH CHECK (
  bucket_id = 'event-photos' AND
  storage.extension(name) IN ('jpg', 'jpeg', 'png', 'webp', 'gif') AND
  storage.foldername(name) IS NOT NULL AND
  array_length(storage.foldername(name), 1) = 1
);

-- Allow users to delete only their own files
CREATE POLICY "Allow deletes for file owners and admins" 
ON storage.objects 
FOR DELETE
USING (
  bucket_id = 'event-photos' AND (
    auth.role() = 'service_role' OR
    (auth.role() = 'authenticated' AND 
     auth.uid()::text = (storage.foldername(name))[1])
  )
);

-- Update the event_photos table policies to allow public inserts
DROP POLICY IF EXISTS "Public read access" ON public.event_photos;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.event_photos;
DROP POLICY IF EXISTS "Allow delete for uploaders and admins" ON public.event_photos;

-- Allow public read access
CREATE POLICY "Public read access" 
ON public.event_photos 
FOR SELECT 
USING (true);

-- Allow public inserts
CREATE POLICY "Allow public inserts" 
ON public.event_photos 
FOR INSERT
WITH CHECK (true);

-- Allow deletes only by admins or service role
CREATE POLICY "Allow delete for admins" 
ON public.event_photos 
FOR DELETE
USING (
  auth.role() = 'service_role' OR
  (auth.role() = 'authenticated' AND 
   EXISTS (
     SELECT 1 FROM auth.users
     WHERE id = auth.uid() AND 
     (raw_user_meta_data->>'role' = 'admin' OR is_super_admin = true)
   )
  )
);
