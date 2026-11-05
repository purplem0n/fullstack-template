# Fullstack Template

Turborepo + Bun monorepo with a React web app, an Expo mobile app, and a Hono API on Cloudflare Workers with D1.
It ships with two example features wired end to end: a hello world endpoint and a D1-backed counter.

## Quick start

```bash
bun install
bun run --cwd apps/api cf-typegen   # generate Cloudflare types
bun run dev:web                     # API on :8787 + web on :5173
bun run dev:mobile                  # API + Expo (press i / a, or scan the QR in Expo Go)
```
The API dev script applies D1 migrations locally before it starts.

## Deploy

- API: `bunx wrangler d1 create fullstack-template-db`, paste the id into `apps/api/wrangler.jsonc`, then `bun run --cwd apps/api deploy`.
- Web: build with `VITE_API_URL=https://<your-api> bun run build --filter=@repo/web`, then deploy `apps/web/dist` (for example Cloudflare Workers static assets or Pages).
- Mobile: set `EXPO_PUBLIC_API_URL`, then `bunx eas-cli build` or build locally with `bunx expo run:ios|android`.

## Bun and Expo

Bun installs and runs everything. Expo's Metro bundler still runs on Node under the hood, so keep Node installed.

## Using this as a template

Rename `fullstack-template` in `package.json`, `apps/api/wrangler.jsonc`, and `apps/mobile/app.json`, then delete the counter/hello examples once you have your own features.

Agent rules live in `AGENTS.md`. Agent skills live in `.agents/skills`.
