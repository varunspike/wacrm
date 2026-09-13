# Cloudflare deployment preparation

Prepared on `cloudflare-deploy` from `98b5bd26e8feacacfd4b74ff58411acb8154d212`, matching upstream HEAD on 2026-09-13. No remote deployment or DNS changes were made.

## Commands

Use Node 24 LTS for this Workers toolchain. Existing Next.js scripts remain available.

```sh
npm ci
npx vinext check
npm run build:vinext
npx wrangler deploy --dry-run --config dist/server/wrangler.json
npm run start:vinext
node scripts/check-worker.mjs
```

Builds need the public Supabase configuration below. Validation used the dummy values from `.github/workflows/ci.yml`; the resulting local bundle must NOT be deployed. Rebuild with actual public configuration before any approved deployment.

`npm run build` regenerates Next.js route types. Run it before `npm run typecheck` when alternating between Next.js and vinext builds: vinext changes the generated `.next/types` files. Tests: `npm test`; lint: `npm run lint`.

After blockers are resolved and the user explicitly approves the target/account, rebuild, repeat the dry run, and use `npm run deploy:vinext`. Confirm preservation of dashboard variables with the installed deployment CLI before deployment. No custom domain or routes are configured.

## Enter configuration directly in dashboards

Never paste credentials into chat or commit them. `.env*` and `.dev.vars*` are ignored (example files excepted).

| Dashboard location | Configuration |
| --- | --- |
| Cloudflare build variables | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, optional `NEXT_PUBLIC_APP_LOCALE` |
| Cloudflare Worker settings, Variables and Secrets | Same public values; encrypted secrets `SUPABASE_SERVICE_ROLE_KEY`, `ENCRYPTION_KEY` (64 hex characters), `META_APP_SECRET`; `AUTOMATION_CRON_SECRET` if scheduling is enabled; optional `META_APP_ID` for image templates |
| Supabase | Verify repository migrations, RLS, storage and Realtime setup; configure Auth Site URL and redirect URLs for the approved deployment URL |
| Meta dashboard | Configure the approved HTTPS webhook URL `/api/whatsapp/webhook` and subscription; use the verification token configured in WaCRM WhatsApp settings |

Public build variables are intentionally visible in browser code. Never place service-role, encryption or Meta secrets in `NEXT_PUBLIC_*`. Preserve an existing encryption key; changing it invalidates stored credentials. Enter the WhatsApp access token directly in the application's Settings after deployment.

## Validation and remaining blockers

- Workers build and Wrangler dry run passed with dummy configuration. Bundle: 1,672.98 KiB gzip; no KV, Images, DNS or other resources provisioned.
- Original Next.js production build passed with CI dummy configuration; without it, `/forgot-password` fails with `@supabase/ssr: Your project's URL and API key are required to create a Supabase client!`.
- Existing tests: 80 files, 833 tests passed. Typecheck passed after regenerating Next.js types. Lint: zero errors, 37 existing warnings.
- Local built Worker: login 200, inbox redirects to login, protected WhatsApp API 401, encoder asset 200. Auth responses have `no-store`. No authenticated or real messaging operations were tested.
- Compatibility checker: initial 87%, final 92%; remaining CommonJS warning is in the static vendored Opus browser worker. It is loaded by URL, not imported into the Worker server bundle. Asset serving passed; microphone encoding still needs browser/device validation. Google fonts have partial support (CDN loading rather than Next.js self-hosting).
- **Background processing:** broadcast delivery and webhook automations use `after()`. Workers allows only 30 seconds after the response for `waitUntil()` work. Sequential broadcasts and AI/webhook chains can exceed this; route `maxDuration` does not extend that limit. Reliable long-running work requires a durable queue/consumer or a suitable Node host. This is a production blocker for those features, not a build failure. No queue rewrite was made within this minimal migration.
- **Scheduling:** `/api/automations/cron` and `/api/flows/cron` need an authenticated scheduler if delayed executions are used. None was configured; the generated Worker is an HTTP handler, with no scheduled handler.
- **Dependencies:** audit reported 12 findings: 1 critical, 4 high, 6 moderate, 1 low. The critical package is the existing Next.js 16.2.12 (`GHSA-p293-qw3h-jr36`, `GHSA-2xp9-vwfh-vxw4`); audit recommends 16.3.5. Exact applicability to the vinext runtime was not established. Resolve/review these before production. Broad dependency fixes were deliberately not applied.
- Real Supabase/Auth, Meta signatures and delivery, browser interaction, account access, and dashboard secrets remain unverified.

Sources: [Cloudflare Next.js/vinext guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/), [Worker background execution](https://developers.cloudflare.com/workers/runtime-apis/context/).

## Repository handoff

Changes are staged locally on cloudflare-deploy. Commit creation failed with: Author identity unknown; fatal: unable to auto-detect email address. No commit or push was made, and main remains at the base commit. Configure the intended Git author locally before committing. The accompanying patch can be applied to a checkout of the base commit.
