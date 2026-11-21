# Doomsplay — Cloudflare Workers deployment

This package keeps the existing application components, pages, styles, and player logic unchanged. The Cloudflare-specific additions are the OpenNext adapter, Wrangler configuration, cache bindings, and Cloudflare deployment scripts.

## Before the first deploy

1. Install Node.js 20 or newer.
2. In this folder run `npm install`. This adds the Cloudflare adapter and Wrangler and synchronizes the existing `package-lock.json` with the updated `package.json`. Commit the refreshed lockfile before connecting the repository to Cloudflare.
3. Log in to Cloudflare: `npx wrangler login`.
4. Create the R2 cache bucket (one-time):

   `npx wrangler r2 bucket create doomsplay-next-cache`

   The bucket is used only for Next.js fetch/ISR cache data; it is not your movie/video storage.

5. Add the existing environment values as Worker secrets. Run each command and paste the value when prompted:

   - `npx wrangler secret put TMDB_API_KEY`
   - `npx wrangler secret put TELEGRAM_BOT_TOKEN`
   - `npx wrangler secret put TELEGRAM_CHANNEL_ID`
   - `npx wrangler secret put LIVE_TV_API_URL`

   Add only variables your existing app actually uses. `LIVE_TV_API_URL` can also be configured as a plain Worker variable if you prefer.

6. Test in the Cloudflare Workers runtime locally:

   `npm run preview:cloudflare`

7. Deploy:

   `npm run deploy:cloudflare`

## Important notes

## Supabase authentication setup

1. Apply `supabase/migrations/20261119000000_profiles.sql` to the Supabase project. It creates `public.profiles` only if absent, enables RLS, and adds an auth-user trigger. The remote database schema was not available to this workspace; if a `public.profiles` table already exists, inspect and reconcile it before applying the migration.
2. In Supabase **Authentication → URL Configuration**, set the production site URL and allow the production origin plus the local development origin (for example `http://localhost:3000`). Auth links and OAuth use the current browser origin; there is no hardcoded callback domain in the app.
3. In **Authentication → Providers**, enable Google and provide the OAuth client credentials. Add the Supabase callback URI shown in that provider's settings to the Google OAuth client's authorized redirect URIs. The user-facing redirect returns to the Doomsplay origin.
4. Provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the Next.js build environment. Locally these are read from `.env.local`. In Cloudflare Workers Builds, add them as build variables/secrets for the deployment environment before `opennextjs-cloudflare build`. They are browser configuration (the anon/publishable key is public); never configure a service-role key in browser or `NEXT_PUBLIC_*` variables. `.env.local` is not available to production builds.
5. In Supabase **Authentication → Email**, configure the verification and password reset email templates. Their generated links should use the project's configured site URL and the origin passed by Doomsplay.

### Authentication verification checklist

- Sign up with a valid name/email/password; confirm that the verification email arrives, then verify through its link.
- Sign in with the verified account. Confirm a wrong password shows an error and the profile icon changes to the account menu.
- Sign out and test Google sign-in after enabling the provider and registering its callback URI.
- Refresh after sign-in to verify session restoration; use Forgot password, open the email link, and submit a new password.
- Check account name/email/date, name update, My Watchlist link, and logout from desktop and a narrow mobile viewport.
- Run `npm run preview:cloudflare` with the two public Supabase build variables configured, then repeat the redirect flows on the production domain after deployment.

- `npm run dev`, `npm run build`, and the original Next.js app code are retained. The new Cloudflare commands are separate.
- `next.config.ts` only receives `images.unoptimized: true` so the existing `<Image>` elements keep their original source URLs without requiring the separately billed Cloudflare Images product. This does not change the image layout, but Cloudflare will not resize/convert those images.
- The R2 bucket and Durable Object queue preserve the existing `fetch(..., { next: { revalidate: 3600 } })` caching behavior. No D1 tag-cache binding is added because the source code does not call `revalidateTag` or `revalidatePath`.
- The uploaded archive contained `.env.local`; it is intentionally excluded from this ZIP. Set credentials through Wrangler secrets instead. If that file contained real keys, rotate them before deploying because the archive was shared in this chat.
- Cloudflare's Free Workers plan has a compressed Worker-size limit. The actual bundle size can only be confirmed after `npm install` and `npm run preview:cloudflare` on your machine. If Wrangler reports that the Worker exceeds the Free limit, a Workers Paid plan or a smaller server bundle will be required.
- No deployment can be guaranteed error-free without building and testing against your Cloudflare account and secrets. Use the preview step before production deployment.

## Vercel

The original Vercel scripts and app code are retained. The Cloudflare deployment commands are additive; do not change your Vercel project settings unless you intentionally switch hosting.
