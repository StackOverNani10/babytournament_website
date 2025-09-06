// @ts-ignore - Deno types not recognized in local environment
// @ts-nocheck

// Import the Web API fetch implementation directly from URL
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// Import the Supabase client directly from URL
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
// Import CORS headers
import { corsHeaders } from '../_shared/cors.ts';

// Type definitions for Deno environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the API key from environment variables
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }

    // Parse the request body
    const { to, subject, html, from = 'notifications@resend.dev' } = await req.json();

    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, or html');
    }

    // Send email using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      throw new Error(data.message || 'Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-email function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.status || 500,
      }
    );
  }
});
