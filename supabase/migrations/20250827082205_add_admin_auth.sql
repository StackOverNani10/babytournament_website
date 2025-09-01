-- Create users table for authentication if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Enable read access for all users" 
ON public.users 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON public.users 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for users based on id" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to handle new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Update existing tables to add user_id foreign key if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_user_id_fkey') THEN
    ALTER TABLE public.events 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create or update admin user using Supabase's auth.admin service
DO $$
DECLARE
  admin_email TEXT := 'admin@example.com';
  admin_password TEXT := 'your-secure-password';
  admin_id UUID;
  user_record RECORD;
BEGIN
  -- Try to find existing user
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email LIMIT 1;
  
  -- Create or update user using auth.admin service
  IF admin_id IS NULL THEN
    -- Create new user using auth.admin
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      false,
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_id;
  ELSE
    -- Update existing user's password
    UPDATE auth.users 
    SET 
      encrypted_password = crypt(admin_password, gen_salt('bf')),
      updated_at = now()
    WHERE id = admin_id;
  END IF;

  -- Ensure the user exists in public.users with admin role
  INSERT INTO public.users (id, email, role)
  VALUES (admin_id, admin_email, 'admin')
  ON CONFLICT (id) DO UPDATE 
  SET 
    email = EXCLUDED.email, 
    role = 'admin',
    updated_at = now();
  
  RAISE NOTICE 'Admin user created/updated with ID: %', admin_id;
END $$;