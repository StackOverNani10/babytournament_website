-- Initial database schema for Detallazo
-- This creates all the core tables and sets up basic security

-- Enable necessary extensions
create extension if not exists "uuid-ossp" with schema extensions;
create extension if not exists "pgcrypto" with schema extensions;

-- Table for storing events
create table if not exists public.events (
  id text primary key default gen_random_uuid()::text,
  type text not null,
  title text not null,
  subtitle text,
  date text not null,
  time text,
  location text,
  description text,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  sections jsonb,
  user_id uuid references auth.users(id) on delete cascade
);

-- Table for categories
create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  icon text,
  "order" integer,
  event_type text[],
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table for stores
create table if not exists public.stores (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  website text,
  logo_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table for products
create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category_id text references public.categories(id) on delete set null,
  store_id text references public.stores(id) on delete set null,
  price decimal(10,2) not null,
  image_url text,
  description text,
  suggested_quantity integer,
  max_quantity integer,
  event_type text[],
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table for event sections
create table if not exists public.event_sections (
  id text primary key default gen_random_uuid()::text,
  event_id text not null references public.events(id) on delete cascade,
  section_id text not null,
  enabled boolean default true,
  title text,
  description text,
  "order" integer,
  config jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(event_id, section_id)
);

-- Table for guests
create table if not exists public.guests (
  id text primary key default gen_random_uuid()::text,
  event_id text not null references public.events(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(event_id, email)
);

-- Table for predictions
create table if not exists public.predictions (
  id text primary key default gen_random_uuid()::text,
  event_id text not null references public.events(id) on delete cascade,
  guest_id text not null references public.guests(id) on delete cascade,
  prediction text not null check (prediction in ('boy', 'girl')),
  name_suggestion text,
  created_at timestamptz default now(),
  unique(event_id, guest_id)
);

-- Table for reservations
create table if not exists public.reservations (
  id text primary key default gen_random_uuid()::text,
  guest_id text not null references public.guests(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for better performance
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_store_id on public.products(store_id);
create index if not exists idx_products_event_type on public.products using gin(event_type);
create index if not exists idx_event_sections_event_id on public.event_sections(event_id);
create index if not exists idx_guests_event_id on public.guests(event_id);
create index if not exists idx_predictions_event_id on public.predictions(event_id);
create index if not exists idx_predictions_guest_id on public.predictions(guest_id);
create index if not exists idx_reservations_guest_id on public.reservations(guest_id);
create index if not exists idx_reservations_product_id on public.reservations(product_id);

-- Enable RLS (Row Level Security) on all tables
alter table public.events enable row level security;
alter table public.categories enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.event_sections enable row level security;
alter table public.guests enable row level security;
alter table public.predictions enable row level security;
alter table public.reservations enable row level security;

-- Create policies for public read access
create policy "Enable read access for all users" on public.events for select using (true);
create policy "Enable read access for all users" on public.categories for select using (true);
create policy "Enable read access for all users" on public.stores for select using (true);
create policy "Enable read access for all users" on public.products for select using (true);
create policy "Enable read access for all users" on public.event_sections for select using (true);
create policy "Enable read access for all users" on public.guests for select using (true);
create policy "Enable read access for all users" on public.predictions for select using (true);
create policy "Enable read access for all users" on public.reservations for select using (true);

-- Create policies for authenticated users to manage their own data
create policy "Enable all for users based on user_id" 
on public.events
for all
using (auth.uid() = user_id);

create policy "Enable insert for authenticated users" 
on public.categories
for insert
with check (true);

create policy "Enable insert for authenticated users" 
on public.stores
for insert
with check (true);

create policy "Enable insert for authenticated users" 
on public.products
for insert
with check (true);

create policy "Enable all for users based on event ownership" 
on public.event_sections
for all
using (exists (
  select 1 from public.events
  where public.events.id = event_sections.event_id 
  and public.events.user_id = auth.uid()
));

create policy "Enable all for users based on event ownership" 
on public.guests
for all
using (exists (
  select 1 from public.events
  where public.events.id = guests.event_id 
  and public.events.user_id = auth.uid()
));

create policy "Enable all for users based on event ownership" 
on public.predictions
for all
using (exists (
  select 1 from public.guests
  join public.events on public.events.id = public.guests.event_id
  where public.guests.id = predictions.guest_id
  and public.events.user_id = auth.uid()
));

create policy "Enable all for users based on guest ownership" 
on public.reservations
for all
using (exists (
  select 1 from public.guests
  join public.events on public.events.id = public.guests.event_id
  where public.guests.id = reservations.guest_id
  and public.events.user_id = auth.uid()
));
