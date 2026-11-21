# DoomsPlay

DoomsPlay is a Next.js App Router movie and TV discovery website. Its existing pages, navigation, account features, catalog, and watch experience remain in place. Streaming discovery is an additional modular layer that runs only registered, authorized provider integrations.

## Setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `TMDB_API_KEY` in `.env.local` for live catalog metadata. `TMDB_BASE_URL` defaults to `https://api.themoviedb.org/3`. Both are server-side values; never rename the key with a `NEXT_PUBLIC_` prefix. Without the key, existing local catalog fallback behavior remains available.

Other existing app features may need their own environment values. See [Cloudflare deployment](CLOUDFLARE_DEPLOY.md) and `.dev.vars.example` for those settings.

## Streaming architecture

The watch page sends its TMDB ID and, for TV, season and episode to `POST /api/streams`. `lib/streaming/types.ts` defines common source and provider contracts, including optional movie/series search, details, season, episode, and stream methods. `getProviderCapabilities()` reports which methods a provider implements. Add an independently implemented, authorized module to `lib/streaming/registry.ts`; enable it only after its API contract, content permissions, allowed hosts, and required configuration are established.

`lib/streaming/manager.ts` runs eligible providers concurrently with per-provider time limits and isolates failures. `lib/streaming/resolver.ts` accepts only HTTPS source URLs declared in the provider's host allowlist, follows a bounded chain of allowlisted redirects, and checks media MIME type. Duplicate URLs are collapsed. The viewer chooses among returned sources in the existing watch page; the player supports HLS, DASH, MP4, WebM, subtitles, and provider-owned iframes explicitly declared by an integration.

The runtime registry is intentionally empty. The APK's domain strings and undocumented service calls are evidence for the report, not authorization or a playback contract. No movie or episode playback source is configured until an authorized provider is supplied. `APK_REVERSE_ENGINEERING_REPORT.md` documents the static inspection limits and findings; `STREAMING_PROVIDERS.md` describes the implementation and inventory.

## Validation

```powershell
npx tsc --noEmit
npm test
npm run lint
npm run build
npx opennextjs-cloudflare build
```

The streaming tests cover provider selection, movie/TV request flow, timeout and error handling, URL and MIME validation, redirects, duplicates, and player binding. They use isolated fixtures; they do not establish real provider playback. No authorized sample media was supplied, so end-to-end decoding remains unverified.

## Cloudflare

The project uses OpenNext for Cloudflare Workers. Configure secrets and build variables as documented in [CLOUDFLARE_DEPLOY.md](CLOUDFLARE_DEPLOY.md), then use `npm run preview:cloudflare` before deploying with `npm run deploy:cloudflare`. Keep `.env.local`, `.dev.vars`, and all credentials out of archives and source control.
