# 06 — Folder Structure

**Document status:** Complete  
**Last updated:** June 2026

---

## Root

```
/
├── artifacts/               Deployable applications
├── lib/                     Shared TypeScript libraries
├── scripts/                 Utility scripts
├── docs/                    Project handbook (this directory)
├── .agents/                 AI agent memory and skills (Replit-managed)
├── .local/                  Replit-local configuration and skills
├── pnpm-workspace.yaml      Workspace package discovery, catalog, overrides
├── tsconfig.base.json       Shared strict TypeScript defaults
├── tsconfig.json            Root solution file (libs only)
├── package.json             Root devDependencies and workspace-level scripts
├── README.md                Project living blueprint
└── replit.md                Replit-specific project overview and user preferences
```

---

## `artifacts/api-server/`

The Express API server. A leaf workspace package — it imports from libs, does not emit declarations.

```
artifacts/api-server/
├── src/
│   ├── index.ts             Server entry point — creates app, registers middleware, starts listening
│   └── routes/
│       ├── index.ts         Mounts all routers on the main Express Router
│       ├── health.ts        GET /healthz — liveness check
│       ├── modules.ts       GET /modules, GET /modules/:id
│       ├── challenges.ts    GET /challenges, GET /challenges/:id, POST /challenges/:id/complete
│       ├── progress.ts      GET /progress/summary, GET /progress/activity
│       └── docs.ts          GET /docs/topics, GET /docs/topics/:id
├── package.json
├── tsconfig.json            Extends tsconfig.base.json, noEmit, references libs
└── build.mjs                esbuild script — bundles to dist/index.mjs
```

**Conventions:**
- Each resource group gets its own router file
- Route handlers catch all exceptions and return structured JSON errors
- All database access uses `@workspace/db`
- All logging uses `req.log` (inside handlers) or the `logger` singleton (outside)

---

## `artifacts/devops-forge/`

The React frontend. A leaf workspace package built with Vite.

```
artifacts/devops-forge/
├── src/
│   ├── main.tsx             React entry point — mounts app, wraps with QueryClientProvider
│   ├── App.tsx              Root component — defines all routes with wouter
│   ├── index.css            Tailwind directives, custom CSS variables, global styles
│   ├── pages/
│   │   ├── Dashboard.tsx        / — XP, level, progress, recent activity
│   │   ├── ModulesList.tsx      /modules — all modules grid with search
│   │   ├── ModuleDetail.tsx     /modules/:id — module info + challenge list
│   │   ├── ChallengesList.tsx   /challenges — filterable challenge browser
│   │   ├── ChallengeDetail.tsx  /challenges/:id — full challenge + hints + complete
│   │   ├── DocsList.tsx         /docs — topic browser with module filter
│   │   └── DocDetail.tsx        /docs/:id — full documentation article
│   └── components/
│       └── layout/
│           ├── AppLayout.tsx    Outer shell — sidebar + main content area
│           └── AppSidebar.tsx   Navigation sidebar with module links
├── public/                  Static assets served by Vite
├── package.json
├── tsconfig.json
├── vite.config.ts           Vite configuration — host, port, base path
└── index.html               HTML entry point
```

**Conventions:**
- Pages live in `src/pages/` — one file per route
- Shared UI components live in `src/components/`
- All data fetching uses hooks from `@workspace/api-client-react`
- Every page that fetches data renders a loading skeleton and an empty state
- No inline styles — Tailwind utility classes only

---

## `lib/api-spec/`

The OpenAPI specification and codegen configuration.

```
lib/api-spec/
├── openapi.yaml             The API contract — single source of truth
├── orval.config.ts          Orval configuration — output paths, client type
├── package.json
└── tsconfig.json
```

**The only file you edit here is `openapi.yaml`.** The Orval config controls what gets generated and where. Run `pnpm --filter @workspace/api-spec run codegen` after any change to `openapi.yaml`.

---

## `lib/api-client-react/`

Generated React Query hooks. **Do not edit any file in this directory.**

```
lib/api-client-react/
├── src/
│   └── generated/
│       ├── api.ts           All hooks: useListModules, useGetChallenge, useCompleteChallenge, etc.
│       └── api.schemas.ts   TypeScript types for all request/response shapes
├── package.json
└── tsconfig.json
```

These files are regenerated from the OpenAPI spec every time `codegen` is run. Manual edits are lost on the next run. If the generated output is wrong, fix the spec or the Orval config.

---

## `lib/api-zod/`

Generated Zod validators. **Do not edit any file in this directory.**

```
lib/api-zod/
├── src/
│   └── generated/
│       └── api.ts           Zod schemas: ListModulesResponse, GetChallengeResponse, etc.
├── package.json
└── tsconfig.json
```

These schemas are used in API route handlers to validate inputs and can be used to validate response shapes in tests.

---

## `lib/db/`

Drizzle ORM schema, database client, and configuration.

```
lib/db/
├── src/
│   ├── index.ts             Exports: db client, all schema tables and types
│   └── schema/
│       ├── index.ts         Re-exports all schema files
│       ├── modules.ts       modulesTable, categoryEnum, insert schema, types
│       ├── challenges.ts    challengesTable, difficultyEnum, insert schema, types
│       ├── challenge_hints.ts  challengeHintsTable, insert schema, types
│       ├── progress.ts      progressTable, insert schema, types
│       └── doc_topics.ts    docTopicsTable, insert schema, types
├── drizzle.config.ts        Drizzle Kit configuration — connection, schema path, dialect
├── package.json
└── tsconfig.json
```

**Adding a table:** Create a new file in `src/schema/`, export from `src/schema/index.ts`, run `pnpm --filter @workspace/db run push`.

---

## `scripts/`

Utility scripts that do not belong in any artifact or lib.

```
scripts/
├── src/                     Script source files
├── package.json             npm scripts — one per script
└── tsconfig.json
```

Currently minimal. Future scripts will include content seeding, data export, and database maintenance utilities.

---

## `docs/`

The project handbook. See `docs/README.md` for the full index.

```
docs/
├── README.md                Documentation index
├── 00_PROJECT_HANDOFF.md    Project introduction — start here
├── 01_PROJECT_VISION.md     Vision and north star
...
└── 25_FUTURE_ROADMAP.md     Long-term plans
```

---

## `.agents/memory/`

Persistent memory for AI assistants working on this project. Contains `MEMORY.md` (an index) and topic files that capture non-obvious decisions and lessons. Managed by Replit Agent automatically — human contributors can read these files for context but should not need to edit them.

---

## Files to never edit manually

| Path | Reason |
|------|--------|
| `lib/api-client-react/src/generated/` | Generated by Orval — overwritten on codegen |
| `lib/api-zod/src/generated/` | Generated by Orval — overwritten on codegen |
| `.replit` | Managed by Replit platform |
| `artifact.toml` files | Managed by Replit artifact system |

---

## Where to add new things

| What | Where |
|------|-------|
| New API endpoint | `lib/api-spec/openapi.yaml` → codegen → `artifacts/api-server/src/routes/` |
| New database table | `lib/db/src/schema/` → export from index → `db push` |
| New frontend page | `artifacts/devops-forge/src/pages/` → register route in `App.tsx` |
| New shared UI component | `artifacts/devops-forge/src/components/` |
| New utility script | `scripts/src/` → add npm script to `scripts/package.json` |
| New handbook document | `docs/` → add to index in `docs/README.md` and table in root `README.md` |
