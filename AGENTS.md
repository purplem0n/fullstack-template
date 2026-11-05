# AGENTS.md

Fullstack TypeScript monorepo: one Cloudflare Worker (React Router SSR web + Hono API under `/api`, D1), plus an Expo mobile app.
Bun is the package manager and script runner. Turborepo orchestrates tasks.

## Map

- `apps/api`: the Hono API as a library (no Worker of its own). SQL migrations in `apps/api/migrations`. Exports `AppType` for the typed client; tested with `app.request()`.
- `apps/web`: the deployed Worker. React Router framework mode with SSR (routes in `app/routes.ts`, pages in `app/routes`, layout in `app/root.tsx`), entry `workers/app.ts` mounts `apps/api` under `/api` and sends everything else to React Router. Config in `apps/web/wrangler.jsonc` (D1 binding `DB`). Tailwind v4 + shadcn/ui (components in `app/components/ui`, `cn` in `app/lib/utils.ts`). Worker env in loaders via `context.get(cloudflare).env` (`app/lib/cloudflare.ts`). Theme comes from `@repo/tokens/theme.css`.
- `apps/mobile`: Expo + Expo Router (routes in `src/app`) + NativeWind (Tailwind 3) + React Native Reusables (components in `src/components/ui`). Theme comes from `global.css`; JS-side colors (icons, navigation) from `THEME` in `src/lib/theme.ts`. Read `apps/mobile/AGENTS.md` before touching Expo APIs.
- `packages/shared`: Zod schemas and types shared by every app. No React, no platform code.
- `packages/api-client`: `createApiClient` (Hono RPC) plus TanStack Query hooks used by web and mobile.
- `packages/tokens`: the single source of design tokens (`src/index.ts`, shadcn variable names as HSL triples). `bun run tokens` generates `packages/tokens/src/theme.css` (web) and `apps/mobile/global.css` (mobile).

## Commands (run from the repo root)

- `bun install`: install everything. Never use npm, yarn, or pnpm.
- `bun run dev:web` (Worker with web + API on :5173) / `bun run dev:mobile` (Worker + Expo) / `bun run dev`.
- `bun run dev:mobile:prod-api`: run mobile against the deployed Worker. `bun run deploy`: build, apply remote migrations, deploy the Worker. `bun run preview:web` serves the production web build. VS Code run configs for all of these are in `.vscode/launch.json` and `.vscode/tasks.json`; keep them in sync when scripts change.
- `bun lint` (rules in `.oxlintrc.json`), `bun fmt` (Prettier style in `.prettierrc.json`), `bun run fix` (format + autofix), `bun run typecheck`, `bun run test`, `bun run build`, `bun run check:all` (everything CI runs).
- Never add `lint`, `fmt`, or `check` scripts to any package.json: `bun lint`/`bun fmt`/`bun check` run a same-named script if one exists, which recurses forever.
- New Expo dependency: `cd apps/mobile && bunx expo install <pkg>`. Other packages: `bun add <pkg> --cwd <workspace>`.
- New DB change: add `apps/api/migrations/000N_name.sql`, then `bun run db:migrate`.
- After changing `apps/web/wrangler.jsonc` bindings or routes: `bun run --cwd apps/web cf-typegen`.
- After changing tokens: `bun run tokens`.
- New web component: `cd apps/web && bunx shadcn@latest add <name>`.
- New mobile component: `cd apps/mobile && bunx @react-native-reusables/cli@latest add <name>`. Check setup with `bunx @react-native-reusables/cli@latest doctor`.

## Rules

- API URLs: web calls its own origin + `/api` (no config). Server-side loaders call the API in-process with `api.request(path, init, env)`, not over HTTP. Mobile in dev uses the Mac's LAN IP from Metro on port 5173 + `/api`; production is `apps/mobile/.env.production` (`EXPO_PUBLIC_API_URL`, Worker URL + `/api`). These are public and committed; secrets go only in ignored `.env*.local` files or Wrangler secrets.

- Every API request/response shape lives in `packages/shared` as a Zod schema. Never redefine it in an app.
- API structure (Hono "larger applications" pattern). `apps/api/src/index.ts` only composes: middleware plus `.route('/feature', feature)` chained calls, so `AppType` stays complete. Never put feature logic there; the inline counter/hello routes are template examples only.
  - `src/routes/<feature>.ts`: one `new Hono<Env>()` sub-app per feature with chained handlers (keep chaining for RPC types). Handlers stay thin: validate input (`@hono/zod-validator` with schemas from `packages/shared`), call a service, return `c.json(...)`.
  - `src/services/<feature>.ts`: business logic as plain functions taking `db`/deps and typed input, returning data. No Hono `c` here, so they unit-test without HTTP.
  - `src/db/` for queries/helpers, `src/middleware/` for auth etc., `src/types.ts` for the shared `Env` bindings type.
  - Tests next to the code (`*.test.ts`): services directly, routes via `app.request()`.
  - Then add a hook in `packages/api-client`.
- Apps call the API only through `@repo/api-client`. No raw `fetch` to our API.
- Design system: shadcn/ui on web, React Native Reusables on mobile. Both use the same token names (`bg-primary`, `text-muted-foreground`, `rounded-lg`, ...), so the same class names mean the same thing on both platforms.
- Never hardcode colors, radii, or fonts in components (no hex, no `bg-[#...]`, no raw `hsl(...)`). Use token classes, or `THEME` on mobile when a prop needs a raw color.
- To change the look, edit `packages/tokens/src/index.ts` and run `bun run tokens`. Never edit the generated `theme.css` or `apps/mobile/global.css` by hand.
- Check `app/components/ui` (web) / `src/components/ui` (mobile) before building a control; add the shadcn/Reusables component if it is missing. Restyle through variants (cva) and tokens, not one-off overrides. Share logic, not components, across web and mobile.
- Design skills (taste-skill first, then web-design-guidelines and the Vercel/Expo skills in `.agents/skills`) set direction for new screens. Their palette, radius, and font choices go into the tokens, not into components.
- Strict TypeScript. No `any`, no non-null assertions without a comment.

## Secrets

- Real secrets live only in the Worker. Local: `apps/web/.dev.vars` (gitignored, created from `.dev.vars.example`). Production: `cd apps/web && bunx wrangler secret put NAME`. Read as `c.env.NAME` (API) or `context.get(cloudflare).env.NAME` (loaders), then run `bun run --cwd apps/web cf-typegen`. Never read secrets in components; loader return values reach the browser.
- When adding a secret, add a commented placeholder to `apps/web/.dev.vars.example` too. Never commit real values.
- Anything prefixed `VITE_` or `EXPO_PUBLIC_` is bundled into the client and public. Only put public values there (`.env.development`/`.env.production`, overrides in `.env*.local`; EAS via `eas env:create`).
- CI secrets (`CLOUDFLARE_API_TOKEN`, `EXPO_TOKEN`) go in GitHub repo secrets.

## First deploy (one-time setup)

Check these before any deploy. If one is not done, do it (or ask the user for the value) first.

1. Cloudflare login: `bunx wrangler login` (or `CLOUDFLARE_API_TOKEN` in CI).
2. D1 database: if `apps/web/wrangler.jsonc` still has `database_id` `00000000-0000-0000-0000-000000000000`, run `cd apps/web && bunx wrangler d1 create fullstack-template-db` and paste the returned id into `database_id`. Then run `bun run --cwd apps/web cf-typegen`.
3. Deploy: `bun run deploy` (builds, applies remote migrations, deploys web + API as one Worker). Note the Worker URL it prints.
4. If the URL differs, update `apps/mobile/.env.production` (Worker URL + `/api`). Web needs no URL config.
5. EAS (mobile): if `apps/mobile/app.json` has no `expo.extra.eas.projectId`, run `cd apps/mobile && bunx eas-cli login && bunx eas-cli init` (adds the project id), then `bunx eas-cli build:configure` (creates `eas.json`). EAS reads `apps/mobile/.env.production`; then run `bunx eas-cli build`.
   Never commit secrets. Login steps need the user, so stop and ask them when one is required.

## Definition of done

`bun run check:all` passes from the root, and each new API route has a test in `apps/api/src`.

## Tooling

Requires Bun canary (`bun upgrade --canary`): `bun lint`, `bun fmt`, and `bun check` are not in stable Bun yet. Bun is the whole toolchain: `bun lint` (linter), `bun fmt` (formatter), `bun check` (type checker, used by every `typecheck` script), `bun test`. Do not add ESLint, Prettier, Biome, or tsc-based scripts.
