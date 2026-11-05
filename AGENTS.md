# AGENTS.md

Fullstack TypeScript monorepo: React web, Expo mobile, and a Hono API on Cloudflare Workers with D1.
Bun is the package manager and script runner. Turborepo orchestrates tasks.

## Map

- `apps/api`: Hono on Cloudflare Workers. D1 binding `DB`, SQL migrations in `apps/api/migrations`. Exports `AppType` for the typed client.
- `apps/web`: Vite + React + Tailwind v4 + shadcn/ui (components in `src/components/ui`, `cn` in `src/lib/utils.ts`). Theme comes from `@repo/tokens/theme.css`.
- `apps/mobile`: Expo + Expo Router (routes in `src/app`) + NativeWind (Tailwind 3) + React Native Reusables (components in `src/components/ui`). Theme comes from `global.css`; JS-side colors (icons, navigation) from `THEME` in `src/lib/theme.ts`. Read `apps/mobile/AGENTS.md` before touching Expo APIs.
- `packages/shared`: Zod schemas and types shared by every app. No React, no platform code.
- `packages/api-client`: `createApiClient` (Hono RPC) plus TanStack Query hooks used by web and mobile.
- `packages/tokens`: the single source of design tokens (`src/index.ts`, shadcn variable names as HSL triples). `bun run tokens` generates `packages/tokens/src/theme.css` (web) and `apps/mobile/global.css` (mobile).

## Commands (run from the repo root)

- `bun install`: install everything. Never use npm, yarn, or pnpm.
- `bun run dev:web` / `bun run dev:mobile` / `bun run dev`: start the API with the chosen client(s).
- `bun run lint`, `bun run format`, `bun run typecheck`, `bun run test`, `bun run build`.
- New Expo dependency: `cd apps/mobile && bunx expo install <pkg>`. Other packages: `bun add <pkg> --cwd <workspace>`.
- New DB change: add `apps/api/migrations/000N_name.sql`, then `bun run db:migrate`.
- After changing `wrangler.jsonc` bindings: `bun run --cwd apps/api cf-typegen`.
- After changing tokens: `bun run tokens`.
- New web component: `cd apps/web && bunx shadcn@latest add <name>`.
- New mobile component: `cd apps/mobile && bunx @react-native-reusables/cli@latest add <name>`. Check setup with `bunx @react-native-reusables/cli@latest doctor`.

## Rules

- Every API request/response shape lives in `packages/shared` as a Zod schema. Never redefine it in an app.
- Add API routes by chaining on the Hono app in `apps/api/src/index.ts`, so `AppType` stays complete. Then add a hook in `packages/api-client`.
- Apps call the API only through `@repo/api-client`. No raw `fetch` to our API.
- Design system: shadcn/ui on web, React Native Reusables on mobile. Both use the same token names (`bg-primary`, `text-muted-foreground`, `rounded-lg`, ...), so the same class names mean the same thing on both platforms.
- Never hardcode colors, radii, or fonts in components (no hex, no `bg-[#...]`, no raw `hsl(...)`). Use token classes, or `THEME` on mobile when a prop needs a raw color.
- To change the look, edit `packages/tokens/src/index.ts` and run `bun run tokens`. Never edit the generated `theme.css` or `apps/mobile/global.css` by hand.
- Check `src/components/ui` before building a control; add the shadcn/Reusables component if it is missing. Restyle through variants (cva) and tokens, not one-off overrides. Share logic, not components, across web and mobile.
- Design skills (taste-skill first, then web-design-guidelines and the Vercel/Expo skills in `.agents/skills`) set direction for new screens. Their palette, radius, and font choices go into the tokens, not into components.
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
