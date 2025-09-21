-- 1. Enable required extensions if not already enabled
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Create a function to set up storage configuration
-- This function should be called by a database admin or through the Supabase dashboard
create or replace function public.setup_storage_configuration()
returns json as $$
declare
  result json;
  bucket_exists boolean;
begin
  -- Check if the bucket exists using the storage API
  select exists (
    select 1 
    from storage.buckets 
    where id = 'event-photos'
  ) into bucket_exists;
  
  if not bucket_exists then
    -- Create the bucket using the storage API
    insert into storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types
    ) values (
      'event-photos',
      'event-photos',
      true,
      5242880, -- 5MB
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    );
    
    result := json_build_object('status', 'success', 'message', 'Bucket created successfully');
  else
    result := json_build_object('status', 'info', 'message', 'Bucket already exists');
  end if;
  
  -- Set up storage policies using dynamic SQL to avoid permission issues
  -- These statements will be executed with the permissions of the function owner
  execute 'drop policy if exists "Public Read Access" on storage.objects';
  execute 'create policy "Public Read Access" on storage.objects for select using (bucket_id = ''event-photos'')';
  
  execute 'drop policy if exists "Allow public uploads with restrictions" on storage.objects';
  execute 'create policy "Allow public uploads with restrictions" on storage.objects for insert with check (' ||
          'bucket_id = ''event-photos'' and ' ||
          'storage.extension(name) in (''jpg'', ''jpeg'', ''png'', ''webp'', ''gif'') and ' ||
          'storage.foldername(name) is not null and ' ||
          'array_length(storage.foldername(name), 1) = 1' ||
          ')';
  
  execute 'drop policy if exists "Allow deletes for file owners and admins" on storage.objects';
  execute 'create policy "Allow deletes for file owners and admins" on storage.objects for delete using (' ||
          'bucket_id = ''event-photos'' and (' ||
          '  auth.role() = ''service_role'' or ' ||
          '  (auth.role() = ''authenticated'' and ' ||
          '   auth.uid()::text = (storage.foldername(name))[1])' ||
          '))';
  
  -- Grant necessary permissions
  execute 'grant select on storage.objects to public';
  execute 'grant insert, update, delete on storage.objects to authenticated';
  execute 'grant usage on schema storage to public';
  
  return result;
end;
$$ language plpgsql security definer;

-- 3. Create a function to handle file cleanup on deletion
create or replace function public.handle_photo_delete()
returns trigger as $$
begin
  -- Delete the file from storage when a photo is deleted from the database
  -- This will be executed with the permissions of the function owner
  perform storage.delete_object('event-photos', old.storage_path);
  
  return old;
exception when others then
  raise warning 'Error deleting file from storage: %', sqlerrm;
  return old;
end;
$$ language plpgsql security definer;

-- 4. Create trigger for photo deletion
create or replace trigger on_photo_deleted
  after delete on public.event_photos
  for each row
  execute function public.handle_photo_delete();

-- Note: To complete the setup, a database admin should run:
-- select public.setup_storage_configuration();
