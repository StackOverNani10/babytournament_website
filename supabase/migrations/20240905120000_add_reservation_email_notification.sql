-- Enable the HTTP extension if not already enabled
create extension if not exists http with schema extensions;

-- Create a function to call the serverless function
create or replace function public.notify_reservation_created()
returns trigger
language plpgsql
security definer
as $$
declare
  function_url text := 'https://ebrvujsvvuwhozmlnpgm.supabase.co/functions/v1/send-reservation-notification';
  service_role_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVicnZ1anN2dnV3aG96bWxucGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ2MTkxMSwiZXhwIjoyMDcxMDM3OTExfQ.OXt1KKI2igWRSSsthCSYeV_LMowcut61BpK-wO9FoHU';
  result jsonb;
  response_status integer;
  response_content text;
begin
  -- Call the serverless function
  select 
    status,
    content::text
  into 
    response_status,
    response_content
  from
    http(('POST', 
          function_url,
          ARRAY[
            http_header('Authorization', 'Bearer ' || service_role_key),
            http_header('Content-Type', 'application/json')
          ],
          'application/json',
          row_to_json(NEW)::text
         )::http_request);
  
  -- Log the result
  if response_status >= 200 and response_status < 300 then
    raise notice 'Notification sent successfully: %', response_content;
  else
    raise warning 'Failed to send notification. Status: %, Response: %', response_status, response_content;
  end if;
  
  return NEW;
exception when others then
  raise warning 'Error in notify_reservation_created: %', SQLERRM;
  return NEW;
end;
$$;

-- Create a trigger to call the function on new reservation
create or replace trigger send_reservation_notification_trigger
after insert on public.reservations
for each row
execute function public.notify_reservation_created();

-- Add comment for the function
comment on function public.notify_reservation_created is 'Calls a serverless function to send email notification when a new reservation is created';

-- Add comment for the trigger
comment on trigger send_reservation_notification_trigger on public.reservations is 'Triggers notification on new reservation insertion';
