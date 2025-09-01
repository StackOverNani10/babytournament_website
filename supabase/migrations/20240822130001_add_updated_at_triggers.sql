-- Migration to add updated_at triggers to all tables
-- This replaces the old 20240822130000_add_rls_and_triggers.sql

-- Create function to update updated_at timestamps
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers for all tables with updated_at
create or replace trigger update_events_updated_at
  before update on public.events
  for each row execute function public.update_updated_at_column();

create or replace trigger update_guests_updated_at
  before update on public.guests
  for each row execute function public.update_updated_at_column();

create or replace trigger update_products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at_column();

create or replace trigger update_categories_updated_at
  before update on public.categories
  for each row execute function public.update_updated_at_column();

create or replace trigger update_stores_updated_at
  before update on public.stores
  for each row execute function public.update_updated_at_column();

create or replace trigger update_event_sections_updated_at
  before update on public.event_sections
  for each row execute function public.update_updated_at_column();

create or replace trigger update_reservations_updated_at
  before update on public.reservations
  for each row execute function public.update_updated_at_column();
