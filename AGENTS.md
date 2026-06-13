# Treinos API — AGENTS.md

## Quick start

```bash
pnpm install              # install deps
pnpm db:generate          # generate Prisma client (needed after clone/install)
pnpm db:migrate           # apply migrations
pnpm dev                  # tsx watch on src/index.ts
```

Prisma client is output to `src/generated/prisma/` (gitignored). Always run `db:generate` after install or schema change.

## Available commands

| Command | Description |
|---|---|
| `pnpm dev` | `tsx --watch src/index.ts` (hot-reload) |
| `pnpm build` | `prisma generate && tsc && tsc-alias` |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:push` | Push schema without migration |
| `pnpm db:push:reset` | `prisma db push --force-reset` |
| `pnpm exec eslint .` | Lint (no dedicated script, run via `exec`) |

No test or typecheck scripts exist.

## Architecture

```
src/
  index.ts          — entrypoint: app.listen()
  app.ts            — Fastify setup: plugins, CORS, swagger, rate-limit, routes
  env/index.ts      — env validation with Zod (dotenv loaded before anything)
  errors/index.ts   — 3 custom errors: NotFoundError, WorkoutPlanNotActiveError, SessionAlreadyStartedError
  lib/
    auth.ts         — Better-Auth with email + Google OAuth
    db.ts           — PrismaClient with PrismaPg adapter
  routes/           — 6 modules, each a FastifyPluginAsyncZod
  use-cases/        — Classes with execute(dto): InputDto → OutputDto pattern
  schemas/index.ts  — All Zod schemas shared between routes and docs
```

## Key patterns

- **ESM**: All imports use `.js` extension (e.g. `import "./handler.js"`). This is required by Node ESM with tsx.
- **Path alias**: `@/` maps to `./src/` via `tsconfig.json` paths. Resolved at build by `tsc-alias`; tsx handles it natively in dev.
- **Auth**: Every route extracts session with `auth.api.getSession({ headers: fromNodeHeaders(request.headers) })`. Returns 401 if falsy.
- **Error mapping**: Routes catch custom errors and map to HTTP status. `NotFoundError` → 404, `SessionAlreadyStartedError` → 409, `WorkoutPlanNotActiveError` → 422. Unknown errors → 500.
- **Use cases**: Instantiated per request (`new UseCase().execute(dto)`). They define `InputDto`/`OutputDto` interfaces and import `prisma` directly.
- **Prisma adapter**: Uses `@prisma/adapter-pg` (not the default driver). Keep this pattern if adding new connections.
- **Rate limiting**: `@fastify/rate-limit` with route-specific overrides via `config.rateLimit`.
- **Swagger/Docs**: OpenAPI auto-generated via `@fastify/swagger`. UI at `/docs` (Scalar). JSON at `/swagger.json`. Auth API schema at `/api/auth/open-api/generate-schema`.

## AI route specifics (`src/routes/ai.ts`)

- Model: `google("gemini-2.5-flash")` via Vercel AI SDK
- Streaming response with 4 tools: `getUserTrainData`, `updateUserTrainData`, `getWorkoutPlans`, `createWorkoutPlan`
- System prompt in Portuguese. If editing, keep the tool descriptions and rules in PT-BR.
- Rate limit: 20 req / 10 min

## Prisma

- Schema: `prisma/schema.prisma`
- Generator: `prisma-client` output to `src/generated/prisma`
- Models: `User`, `WorkoutPlan`, `WorkoutDay`, `WorkoutExercise`, `WorkoutSession`, `Session`, `Account`, `Verification`
- Enum: `WeekDay` (MONDAY–SUNDAY)
- Better-Auth tables (`Session`, `Account`, `Verification`) are managed by the auth library. Renaming them via `@@map` is possible but verify compatibility.
- Migrations dir: `prisma/migrations/`

## Environment

Required vars (validated by Zod on startup):
`DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_GENERATIVE_AI_API_KEY`.
Optional: `FRONTEND_URL` (default `http://localhost:3000`), `API_URL` (default `http://localhost:3333`), `PORT` (default `3333`), `NODE_ENV` (default `development`).

## Infrastructure

- Docker Compose: PostgreSQL 16 (`docker-compose up -d`)
- Dockerfile: multi-stage build (base → deps → build → production)
- `.nvmrc`: Node 24.14.0
- `.npmrc`: `engine-strict=true`, `save-exact=true` (pnpm requires Node 24.x, saves exact versions)
- Override-based vuln fixes in `pnpm-workspace.yaml`

## Commit conventions

- Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- Commit messages in English
