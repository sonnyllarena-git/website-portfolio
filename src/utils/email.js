import { supabase, isSupabaseConfigured } from './supabaseClient';

export async function sendContactMessage({ name, email, subject, message }) {
  if (!isSupabaseConfigured) {
    throw new Error(
      'Email is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }

  const { data, error } = await supabase.functions.invoke('send-email', {
    body: { name, email, subject, message },
  });

  if (error) {
    throw new Error(error.message || 'Something went wrong sending your message.');
  }

  if (data && data.success === false) {
    throw new Error(data.message || 'Something went wrong sending your message.');
  }

  return data;
}
