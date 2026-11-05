# Fullstack Template

Turborepo + Bun monorepo: one Cloudflare Worker serving a server-rendered React Router web app and a Hono API under `/api` (D1), plus an Expo mobile app.
It ships with two example features wired end to end: a hello world endpoint and a D1-backed counter.

## Quick start

Needs Bun canary (`bun upgrade --canary`) for `bun lint`, `bun fmt`, and `bun check`.

```bash
bun install
bun run --cwd apps/web cf-typegen   # generate Cloudflare + route types
bun run dev:web                     # Worker (SSR web + /api) on :5173
bun run dev:mobile                  # Worker + Expo (press i / a, or scan the QR in Expo Go)
```

The web dev script applies D1 migrations locally before it starts.

## Deploy

- Worker (web + API): `cd apps/web && bunx wrangler d1 create fullstack-template-db`, paste the id into `apps/web/wrangler.jsonc`, then `bun run deploy`.
- Mobile: set `EXPO_PUBLIC_API_URL`, then `bunx eas-cli build` or build locally with `bunx expo run:ios|android`.

## Bun and Expo

Bun installs and runs everything. Expo's Metro bundler still runs on Node under the hood, so keep Node installed.

## Using this as a template

```bash
curl -fsSL https://raw.githubusercontent.com/purplem0n/fullstack-template/main/clone.sh | bash
# or with the folder name: ... | bash -s my-app
```

It asks for the folder, project name, display name, iOS bundle id, Android package and your workers.dev subdomain, then renames the packages, Worker, D1 database, Expo app (`app.json`) and page titles, runs `bun install`, and makes a first commit. There are no `android/` or `ios/` folders: Expo generates them from `app.json` (`bunx expo prebuild`, or EAS Build does it). Delete the counter/hello examples once you have your own features.

## UI and design tokens

- Web uses shadcn/ui (`cd apps/web && bunx shadcn@latest add <name>`).
- Mobile uses NativeWind + React Native Reusables (`cd apps/mobile && bunx @react-native-reusables/cli@latest add <name>`).
- Both read one token source, `packages/tokens/src/index.ts`. Edit it, then run `bun run tokens` to regenerate the web and mobile CSS.

## Running and API URLs

- In VS Code, pick a config from the Run and Debug dropdown (Dev: all, Dev: web + api, Dev: mobile + api, Prod API: mobile, Prod: preview web build, Deploy). The same commands are under Terminal > Run Task.
- Local dev needs no URL config. On a physical phone on the same Wi-Fi as your Mac, Expo Go loads the app from the Mac's LAN IP and the app calls the Worker on that same IP at port 5173 under `/api` (the dev server listens on all interfaces).
- Production: web uses its own origin; set the Worker URL + `/api` in `apps/mobile/.env.production`.
- Phone on a different network (cellular, other Wi-Fi): you still need a tunnel, e.g. `cloudflared tunnel --url http://localhost:5173`, then put that URL + `/api` in `apps/mobile/.env.development.local` as `EXPO_PUBLIC_API_URL`, and start Expo with `--tunnel`.
