# Destiny Matrix Chat

A Next.js app where users chat with "Destiny" (GPT-4o) to generate their Destiny Matrix and receive personalized life guidance. After 10 free messages, users subscribe for $5/week and continue via WhatsApp/SMS.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   - Copy `env.example` to `.env.local` and fill in your keys.

3. **Supabase**
   - Create a project at [supabase.com](https://supabase.com).
   - Run the SQL in `supabase/migrations/20240311000001_initial_schema.sql` in the SQL Editor (or use `supabase db push` if using Supabase CLI).
   - In Authentication → Providers, enable **Email** and under Email enable **Confirm email** off if you want magic links without double-confirm. For magic link: use "Sign in with OTP" or send magic link via `signInWithOtp`.
   - Add your site URL and redirect URLs in Authentication → URL Configuration.

4. **Stripe**
   - Create a product with a $5/week recurring price and set `STRIPE_PRICE_ID`.
   - Use Stripe CLI to forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

5. **Twilio**
   - Configure WhatsApp (or SMS) and set the webhook URL to `https://your-domain.com/api/twilio/webhook` for incoming messages.

6. **Run the app**
   ```bash
   npm run dev
   ```

## Supabase Auth: Magic link

- Use `supabase.auth.signInWithOtp({ email })` to send a magic link.
- Redirect URL for the link should point to your app (e.g. `/auth/callback`) where you exchange the token and create the session.
