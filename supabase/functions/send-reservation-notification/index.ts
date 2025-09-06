// @ts-ignore - Deno types not recognized in local environment
// @ts-nocheck

// Import the Web API fetch implementation
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// Import the Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
// Import CORS headers
import { corsHeaders } from '../_shared/cors.ts';

interface ReservationData {
  id: string;
  event_id: string;
  product_id: string;
  guest_name: string;
  guest_email: string;
  quantity: number;
  status: string;
  created_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    // Create a Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },
      }
    );

    // Get the reservation data from the request
    const reservation: ReservationData = await req.json();

    // Get additional data from the database
    const [
      { data: productData, error: productError },
      { data: storeData, error: storeError },
      { data: eventData, error: eventError },
    ] = await Promise.all([
      supabaseClient
        .from('products')
        .select('*')
        .eq('id', reservation.product_id)
        .single(),
      
      supabaseClient
        .from('products')
        .select('stores(*)')
        .eq('id', reservation.product_id)
        .single()
        .then(({ data }) => ({
          data: data?.stores,
          error: null
        })),
      
      supabaseClient
        .from('events')
        .select('*')
        .eq('id', reservation.event_id)
        .single(),
    ]);

    if (productError || storeError || eventError) {
      console.error('Error fetching data:', { productError, storeError, eventError });
      throw new Error('Failed to fetch reservation details');
    }

    const product = productData;
    const store = storeData;
    const event = eventData;

    // Prepare email content
    const emailSubject = `Nueva reserva de regalo: ${product.name}`;
    const totalPrice = (product.price * reservation.quantity).toFixed(2);
    
    const emailBody = `
      <h2>¡Nueva reserva de regalo!</h2>
      <p>Se ha realizado una nueva reserva con los siguientes detalles:</p>
      
      <h3>Detalles del producto</h3>
      <p><strong>Producto:</strong> ${product.name}</p>
      <p><strong>Cantidad:</strong> ${reservation.quantity}</p>
      <p><strong>Precio unitario:</strong> $${product.price.toFixed(2)}</p>
      <p><strong>Total:</strong> $${totalPrice}</p>
      
      <h3>Información de la tienda</h3>
      <p><strong>Tienda:</strong> ${store?.name || 'No especificada'}</p>
      ${product.product_url ? `<p><strong>URL del producto:</strong> <a href="${product.product_url}">Ver producto</a></p>` : ''}
      
      <h3>Detalles del evento</h3>
      <p><strong>Evento:</strong> ${event.title}</p>
      <p><strong>Fecha:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Ubicación:</strong> ${event.location || 'No especificada'}</p>
      
      <h3>Información del invitado</h3>
      <p><strong>Nombre:</strong> ${reservation.guest_name}</p>
      <p><strong>Email:</strong> ${reservation.guest_email}</p>
      
      <h3>Detalles de la reserva</h3>
      <p><strong>ID de reserva:</strong> ${reservation.id}</p>
      <p><strong>Fecha de reserva:</strong> ${new Date(reservation.created_at).toLocaleString()}</p>
      <p><strong>Estado:</strong> ${reservation.status}</p>
      
      <p>Por favor, inicia sesión en el panel de administración para ver más detalles.</p>
    `;

    // Send email using Supabase's built-in email service
    const { data: emailData, error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: Deno.env.get('ADMIN_EMAIL') || 'admin@example.com',
        subject: emailSubject,
        html: emailBody,
      },
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      throw new Error('Failed to send email notification');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email notification sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-reservation-notification function:', error);
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
