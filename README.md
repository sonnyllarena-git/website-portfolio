# Sonny — Portfolio

A single-page portfolio built with React 19, Vite, Tailwind CSS, Framer Motion, and React Icons. The contact form sends email through a Supabase Edge Function backed by SendGrid.

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```
src/
  components/   UI sections (Navbar, Hero, About, Skills, Projects, Learning, Contact, Footer)
  context/       ThemeContext (dark mode, persisted to localStorage)
  pages/         Home page composing all sections
  utils/         constants.js (content), supabaseClient.js, email.js
supabase/
  functions/send-email/   Edge Function that validates input, stores the message, and sends email via SendGrid
  migrations/              SQL migration creating the `messages` table
```

## Wiring up the contact form (Supabase + SendGrid)

The frontend is already wired to call a Supabase Edge Function named `send-email`. Until you complete the steps below, submitting the form will show a friendly "not configured yet" error instead of crashing.

1. **Create a Supabase project** at [supabase.com](https://supabase.com).
2. **Run the migration** in `supabase/migrations/20260810000000_create_messages_table.sql` (via the SQL editor, or `supabase db push` with the Supabase CLI) to create the `messages` table.
3. **Get a SendGrid API key** at [sendgrid.com](https://sendgrid.com) and verify a sender identity/domain you'll send from.
4. **Set Edge Function secrets** (Supabase CLI or dashboard → Project Settings → Edge Functions):
   ```bash
   supabase secrets set SENDGRID_API_KEY=your-sendgrid-key
   supabase secrets set NOTIFY_EMAIL=sonnyl@thecreditpros.com
   supabase secrets set SENDGRID_FROM_EMAIL=your-verified-sender@yourdomain.com
   ```
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically inside Edge Functions.
5. **Deploy the function**:
   ```bash
   supabase functions deploy send-email
   ```
6. **Add frontend env vars** — copy `.env.example` to `.env` and fill in your project's URL and anon key:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
7. Restart `npm run dev` so Vite picks up the new env vars.

## Content

All copy, skills, projects, and social links live in `src/utils/constants.js` — edit there rather than in components. Social URLs for LinkedIn, YouTube, Facebook, and TikTok are placeholders (`''`) until provided; the icons render but don't link anywhere yet.

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Add the same `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars in the Vercel project settings.
4. Deploy — Vercel auto-detects the Vite build (`npm run build`, output in `dist/`).
