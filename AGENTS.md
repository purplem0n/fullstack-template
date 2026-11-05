# AGENTS.md

Fullstack TypeScript monorepo: React web, Expo mobile, and a Hono API on Cloudflare Workers with D1.
Bun is the package manager and script runner. Turborepo orchestrates tasks.

## Map

- `apps/api`: Hono on Cloudflare Workers. D1 binding `DB`, SQL migrations in `apps/api/migrations`. Exports `AppType` for the typed client.
- `apps/web`: Vite + React + Tailwind v4. Styling comes from `@repo/tokens/theme.css`.
- `apps/mobile`: Expo + Expo Router (routes in `src/app`). Styling uses the `@repo/tokens` TS object. Read `apps/mobile/AGENTS.md` before touching Expo APIs.
- `packages/shared`: Zod schemas and types shared by every app. No React, no platform code.
- `packages/api-client`: `createApiClient` (Hono RPC) plus TanStack Query hooks used by web and mobile.
- `packages/tokens`: design tokens. `src/index.ts` and `src/theme.css` must hold the same values.

## Commands (run from the repo root)

- `bun install`: install everything. Never use npm, yarn, or pnpm.
- `bun run dev:web` / `bun run dev:mobile` / `bun run dev`: start the API with the chosen client(s).
- `bun run lint`, `bun run format`, `bun run typecheck`, `bun run test`, `bun run build`.
- New Expo dependency: `cd apps/mobile && bunx expo install <pkg>`. Other packages: `bun add <pkg> --cwd <workspace>`.
- New DB change: add `apps/api/migrations/000N_name.sql`, then `bun run db:migrate`.
- After changing `wrangler.jsonc` bindings: `bun run --cwd apps/api cf-typegen`.

## Rules

- Every API request/response shape lives in `packages/shared` as a Zod schema. Never redefine it in an app.
- Add API routes by chaining on the Hono app in `apps/api/src/index.ts`, so `AppType` stays complete. Then add a hook in `packages/api-client`.
- Apps call the API only through `@repo/api-client`. No raw `fetch` to our API.
- No hardcoded colors, radii, or spacing in apps. Use tokens (Tailwind classes on web, `@repo/tokens` on mobile).
- UI is built per platform: web uses Tailwind (add shadcn/ui with `bunx shadcn@latest add` in `apps/web` when needed), mobile uses React Native primitives. Share logic, not components.
- For any new screen or visual change, follow the design skills in `.agents/skills` (taste-skill first for direction).
- Strict TypeScript. No `any`, no non-null assertions without a comment.

## First deploy (one-time setup)
Check these before any deploy. If one is not done, do it (or ask the user for the value) first.
1. Cloudflare login: `bunx wrangler login` (or `CLOUDFLARE_API_TOKEN` in CI).
2. D1 database: if `apps/api/wrangler.jsonc` still has `database_id` `00000000-0000-0000-0000-000000000000`, run `cd apps/api && bunx wrangler d1 create fullstack-template-db` and paste the returned id into `database_id`. Then run `bun run --cwd apps/api cf-typegen`.
3. Deploy the API: `bun run --cwd apps/api deploy` (applies remote migrations, then deploys). Note the Worker URL it prints.
4. Web: build with `VITE_API_URL=<worker url>` and deploy `apps/web/dist`.
5. EAS (mobile): if `apps/mobile/app.json` has no `expo.extra.eas.projectId`, run `cd apps/mobile && bunx eas-cli login && bunx eas-cli init` (adds the project id), then `bunx eas-cli build:configure` (creates `eas.json`). Set `EXPO_PUBLIC_API_URL=<worker url>` in `eas.json` build profiles, then `bunx eas-cli build`.
Never commit secrets. Login steps need the user, so stop and ask them when one is required.

## Definition of done

`bun run lint && bun run typecheck && bun run test && bun run build` pass from the root, and each new API route has a test in `apps/api/src`.
