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

type ChatMessage = { role: 'guest' | 'bot'; content: string; timestamp: string };

type Payload = {
  messages?: ChatMessage[];
  guestName?: string;
  guestEmail?: string;
  startedAt?: string;
  endedAt?: string;
  unansweredQuestions?: string[];
  notifyOwner?: boolean;
  sendCopyToGuest?: boolean;
};

function formatTranscript(
  messages: ChatMessage[],
  guestName: string,
  guestEmail: string,
  startedAt: string,
  endedAt: string,
  unansweredQuestions: string[]
) {
  const start = new Date(startedAt);
  const end = new Date(endedAt);
  const durationMinutes = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 60000)
  );

  const conversation = messages
    .map((m) => {
      const who = m.role === 'guest' ? 'Guest' : 'Bot';
      const time = new Date(m.timestamp).toLocaleTimeString();
      return `[${time}] ${who}: ${m.content}`;
    })
    .join('\n');

  const unanswered = unansweredQuestions.length
    ? unansweredQuestions.map((q) => `- ${q}`).join('\n')
    : 'None';

  return `From: ${guestName || 'Guest'} (${guestEmail || 'no email provided'})
Chat Duration: ${durationMinutes} minute(s)
Date: ${end.toLocaleString()}

---CONVERSATION---
${conversation}
---END---

Unanswered Questions:
${unanswered}

---
This is an automated transcript from the portfolio chatbot.
To continue, please use the contact form or reply directly to this email.`;
}

async function sendViaSendGrid(
  apiKey: string,
  to: string,
  fromEmail: string,
  fromName: string,
  subject: string,
  body: string
) {
  return fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [{ type: 'text/plain', value: body }],
    }),
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Method not allowed.' }, 405);
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ success: false, message: 'Invalid JSON body.' }, 400);
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  const guestName = (payload.guestName ?? '').trim();
  const guestEmail = (payload.guestEmail ?? '').trim();
  const startedAt = payload.startedAt ?? new Date().toISOString();
  const endedAt = payload.endedAt ?? new Date().toISOString();
  const unansweredQuestions = Array.isArray(payload.unansweredQuestions)
    ? payload.unansweredQuestions
    : [];
  const notifyOwner = payload.notifyOwner !== false;
  const sendCopyToGuest = Boolean(payload.sendCopyToGuest);

  if (messages.length === 0) {
    return jsonResponse(
      { success: false, message: 'No conversation to send.' },
      400
    );
  }

  if (!notifyOwner && !sendCopyToGuest) {
    return jsonResponse(
      { success: false, message: 'Nothing to send.' },
      400
    );
  }

  if (sendCopyToGuest && !isValidEmail(guestEmail)) {
    return jsonResponse(
      { success: false, message: 'A valid email address is required.' },
      400
    );
  }

  const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');
  const notifyEmail =
    Deno.env.get('CHAT_NOTIFY_EMAIL') ?? 'llarenasonny@yahoo.com';
  const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL') ?? notifyEmail;

  if (!sendgridApiKey) {
    return jsonResponse(
      { success: false, message: 'Email delivery is not configured yet.' },
      500
    );
  }

  const transcript = formatTranscript(
    messages,
    guestName,
    guestEmail,
    startedAt,
    endedAt,
    unansweredQuestions
  );

  if (notifyOwner) {
    const ownerRes = await sendViaSendGrid(
      sendgridApiKey,
      notifyEmail,
      fromEmail,
      'Portfolio Chatbot',
      `Chat Conversation Transcript - ${new Date(endedAt).toLocaleString()}`,
      transcript
    );

    if (!ownerRes.ok) {
      return jsonResponse(
        { success: false, message: 'Could not send the chat transcript.' },
        502
      );
    }
  }

  if (sendCopyToGuest) {
    const guestRes = await sendViaSendGrid(
      sendgridApiKey,
      guestEmail,
      fromEmail,
      'Sonny - Portfolio Assistant',
      'Your chat transcript',
      `Hi ${guestName || 'there'},\n\nHere's a copy of your conversation with Sonny's portfolio assistant:\n\n${transcript}`
    );

    if (!guestRes.ok) {
      return jsonResponse({
        success: true,
        message: 'Transcript sent, but the copy to your email failed.',
      });
    }
  }

  return jsonResponse({ success: true, message: 'Transcript sent.' });
});
