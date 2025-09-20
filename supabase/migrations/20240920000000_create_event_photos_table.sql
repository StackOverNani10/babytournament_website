-- 0. Enable required extensions if not already enabled
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Create storage bucket with proper configuration
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-photos', 
  'event-photos', 
  true,
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) on conflict (id) do update set
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies if they exist
drop policy if exists "Public Read Access" on storage.objects;

-- 3. Create storage policies
-- Allow public read access
create policy "Public Read Access" 
on storage.objects 
for select 
using (bucket_id = 'event-photos');

-- Allow authenticated users to upload only image files
drop policy if exists "Allow uploads for authenticated users" on storage.objects;
create policy "Allow uploads for authenticated users" 
on storage.objects for insert
with check (
  bucket_id = 'event-photos' and 
  auth.role() = 'authenticated' and
  storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp', 'gif') and
  (storage.foldername(name))[1] = auth.uid()::text -- Users can only upload to their own folder
);

-- Allow users to delete only their own files
create policy "Allow deletes for file owners and admins" 
on storage.objects for delete
using (
  bucket_id = 'event-photos' and
  (
    auth.uid()::text = (storage.foldername(name))[1] or
    auth.role() = 'service_role' or
    exists (
      select 1 from auth.users
      where id = auth.uid() and raw_user_meta_data->>'role' = 'admin'
    )
  )
);

-- 4. Create event_photos table with additional constraints
create table if not exists public.event_photos (
  id uuid primary key default uuid_generate_v4(),
  event_id text not null references public.events(id) on delete cascade,  -- Changed from uuid to text
  storage_path text not null unique,
  url text not null,
  description text,
  file_name text not null,
  file_size bigint not null,
  mime_type text not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  
  constraint file_size_check check (file_size <= 5242880), -- 5MB
  constraint valid_mime_type check (
    mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/gif')
  )
);

-- 5. Enable RLS and create policies
alter table public.event_photos enable row level security;

-- Allow public read access
create policy "Public read access" 
on public.event_photos for select using (true);

-- Allow authenticated users to insert their own photos
create policy "Allow insert for authenticated users" 
on public.event_photos for insert
with check (auth.role() = 'authenticated');

-- Allow users to delete their own photos
-- Admins can delete any photo
create policy "Allow delete for uploaders and admins" 
on public.event_photos for delete
using (
  auth.uid() = uploaded_by or
  auth.role() = 'service_role' or
  exists (
    select 1 from auth.users
    where id = auth.uid() and raw_user_meta_data->>'role' = 'admin'
  )
);

-- 6. Create function to generate secure file paths
create function public.gen_photo_path(filename text)
returns text
language plpgsql
security definer
as $$
begin
  return auth.uid()::text || '/' || gen_random_uuid() || '.' || 
         (select split_part(filename, '.', 2));
end;
$$;

-- 7. The URL will be generated in the application code
-- This simplifies the database logic and avoids permission issues

-- 9. Create function to clean up storage when a photo is deleted
create function public.handle_photo_delete()
returns trigger
language plpgsql
as $$
begin
  -- Delete the file from storage
  delete from storage.objects
  where bucket_id = 'event-photos'
  and name = old.storage_path;
  
  return old;
end;
$$;

-- 10. Create trigger to handle file deletion
drop trigger if exists on_photo_deleted on public.event_photos;
create trigger on_photo_deleted
  before delete on public.event_photos
  for each row
  execute function public.handle_photo_delete();
