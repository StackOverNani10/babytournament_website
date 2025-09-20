-- Update storage policies for email-based folders

-- Remove existing upload policy
drop policy if exists "Allow uploads for authenticated users" on storage.objects;

-- Create new policy that allows uploads to email-based folders
create policy "Allow uploads to email folders" 
on storage.objects for insert
with check (
  bucket_id = 'event-photos' and 
  auth.role() = 'authenticated' and
  storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp', 'gif') and
  (storage.foldername(name))[1] ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$' -- Allow any valid email as folder name
);

drop policy if exists "Allow deletes for file owners and admins" on storage.objects;
-- Update delete policy to work with email-based folders
create policy "Allow deletes for file owners and admins" 
on storage.objects for delete
using (
  bucket_id = 'event-photos' and (
    -- Allow if the folder name matches the user's email
    (select email from auth.users where id = auth.uid()) = (storage.foldername(name))[1] or
    -- Or if user is admin/service_role
    auth.role() = 'service_role' or
    exists (
      select 1 from auth.users
      where id = auth.uid() and raw_user_meta_data->>'role' = 'admin'
    )
  )
);
