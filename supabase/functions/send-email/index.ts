import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Method not allowed.' }, 405);
  }

  let payload: { name?: string; email?: string; subject?: string; message?: string };
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ success: false, message: 'Invalid JSON body.' }, 400);
  }

  const name = (payload.name ?? '').trim();
  const email = (payload.email ?? '').trim();
  const subject = (payload.subject ?? '').trim();
  const message = (payload.message ?? '').trim();

  if (name.length < 2) {
    return jsonResponse(
      { success: false, message: 'Name must be at least 2 characters.' },
      400
    );
  }
  if (!isValidEmail(email)) {
    return jsonResponse(
      { success: false, message: 'A valid email address is required.' },
      400
    );
  }
  if (subject.length < 3) {
    return jsonResponse(
      { success: false, message: 'Subject must be at least 3 characters.' },
      400
    );
  }
  if (message.length < 10) {
    return jsonResponse(
      { success: false, message: 'Message must be at least 10 characters.' },
      400
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
  const notifyEmail = Deno.env.get('NOTIFY_EMAIL') ?? 'sonnyl@thecreditpros.com';
  const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') ?? notifyEmail;

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      { success: false, message: 'Server is not configured correctly.' },
      500
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: row, error: insertError } = await supabase
    .from('messages')
    .insert({ name, email, subject, message, status: 'pending' })
    .select('id')
    .single();

  if (insertError) {
    return jsonResponse(
      { success: false, message: 'Could not save your message. Please try again.' },
      500
    );
  }

  if (!sendgridApiKey) {
    return jsonResponse(
      {
        success: false,
        message: 'Message saved, but email delivery is not configured yet.',
      },
      500
    );
  }

  const sendgridRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: notifyEmail }] }],
      from: { email: fromEmail, name: 'Portfolio Contact Form' },
      reply_to: { email, name },
      subject: `[Portfolio] ${subject}`,
      content: [
        {
          type: 'text/plain',
          value: `From: ${name} <${email}>\n\n${message}`,
        },
      ],
    }),
  });

  if (!sendgridRes.ok) {
    await supabase.from('messages').update({ status: 'failed' }).eq('id', row.id);
    return jsonResponse(
      { success: false, message: 'Could not send your message right now.' },
      502
    );
  }

  await supabase.from('messages').update({ status: 'sent' }).eq('id', row.id);

  return jsonResponse({
    success: true,
    message: "Message sent! I'll get back to you soon.",
  });
});
