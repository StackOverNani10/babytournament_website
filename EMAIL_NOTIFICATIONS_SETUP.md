# Email Notifications Setup

This guide explains how to set up email notifications for new reservations in your application.

## Prerequisites

1. A Supabase project with the latest schema
2. A Resend.com account for sending emails
3. Supabase CLI installed and configured

## Setup Steps

### 1. Create a Resend API Key

1. Sign up at [Resend](https://resend.com) if you haven't already
2. Go to the API Keys section in your Resend dashboard
3. Create a new API key with full permissions
4. Copy the API key

### 2. Configure Environment Variables

1. In your Supabase project, go to the "Settings" > "API" section
2. Copy your "Project URL" and "service_role" key
3. Go to "Project Settings" > "Environment Variables"
4. Add the following environment variables:

```
RESEND_API_KEY=your_resend_api_key_here
ADMIN_EMAIL=admin@example.com  # Replace with your admin email
```

### 3. Deploy the Serverless Functions

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Replace `your-project-ref` with your Supabase project reference)

4. Deploy the functions:
   ```bash
   supabase functions deploy send-email --project-ref your-project-ref
   supabase functions deploy send-reservation-notification --project-ref your-project-ref
   ```

### 4. Update the Database Trigger

1. Open the migration file:
   `supabase/migrations/20240905120000_add_reservation_email_notification.sql`

2. Replace the following placeholders with your actual values:
   - `YOUR_SUPABASE_FUNCTION_URL`: Your Supabase project URL
   - `YOUR_SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. Run the migration:
   ```bash
   supabase db push
   ```

### 5. Test the Integration

1. Create a new reservation through your application
2. Check the Supabase logs for any errors
3. Verify that the admin email receives the notification

## Troubleshooting

### Emails not being sent

1. Check the Supabase function logs for errors
2. Verify that the Resend API key is correct and has the right permissions
3. Ensure the admin email address is verified in your Resend account

### Database trigger not working

1. Verify that the trigger is created in your database:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'send_reservation_notification_trigger';
   ```

2. Check the Supabase logs for any errors when a new reservation is created

## Security Considerations

1. Never commit your API keys or service role keys to version control
2. Use environment variables for all sensitive information
3. Regularly rotate your API keys
4. Limit the permissions of the service role key to only what's necessary
