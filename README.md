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

- In VS Code, pick a config from the Run and Debug dropdown (Dev: all, Dev: api + web, Dev: api + mobile, Prod API: web/mobile, Prod: preview web build, Deploy: api). The same commands are under Terminal > Run Task.
- Local dev needs no URL config. On a physical phone on the same Wi-Fi as your Mac, Expo Go loads the app from the Mac's LAN IP and the app calls the API on that same IP at port 8787 (the API listens on all interfaces).
- Production URLs: set your Worker URL in `apps/web/.env.production` and `apps/mobile/.env.production`.
- Phone on a different network (cellular, other Wi-Fi): you still need a tunnel, e.g. `cloudflared tunnel --url http://localhost:8787`, then put that URL in `apps/mobile/.env.development.local` as `EXPO_PUBLIC_API_URL`, and start Expo with `--tunnel`.
