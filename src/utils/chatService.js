import { supabase, isSupabaseConfigured } from './supabaseClient';

export async function saveChatHistory({
  guestName,
  guestEmail,
  messages,
  startedAt,
  endedAt,
  humanFollowUp,
}) {
  if (!isSupabaseConfigured) return null;

  const totalMessages = messages.length;
  const botResponses = messages.filter((m) => m.role === 'bot').length;
  const conversationDuration = Math.max(
    0,
    Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
  );

  const { data, error } = await supabase
    .from('chat_histories')
    .insert({
      guest_name: guestName || null,
      guest_email: guestEmail || null,
      messages,
      conversation_duration: conversationDuration,
      created_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      total_messages: totalMessages,
      bot_responses: botResponses,
      human_follow_up: Boolean(humanFollowUp),
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to save chat history:', error.message);
    return null;
  }

  return data?.id ?? null;
}

export async function saveUnansweredQuestions(chatHistoryId, questions, guestEmail) {
  if (!isSupabaseConfigured || !questions.length) return;

  const rows = questions.map((question) => ({
    question,
    guest_email: guestEmail || null,
    chat_history_id: chatHistoryId || null,
    status: 'pending',
  }));

  const { error } = await supabase.from('unanswered_chats').insert(rows);

  if (error) {
    console.error('Failed to save unanswered questions:', error.message);
  }
}

export async function sendChatTranscript({
  messages,
  guestName,
  guestEmail,
  startedAt,
  endedAt,
  unansweredQuestions,
  sendCopyToGuest,
}) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Email is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }

  const { data, error } = await supabase.functions.invoke('send-chat-transcript', {
    body: {
      messages,
      guestName,
      guestEmail,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      unansweredQuestions,
      sendCopyToGuest,
    },
  });

  if (error) {
    throw new Error(error.message || 'Could not send the chat transcript.');
  }

  if (data && data.success === false) {
    throw new Error(data.message || 'Could not send the chat transcript.');
  }

  return data;
}
