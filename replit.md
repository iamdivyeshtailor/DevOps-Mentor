# DevOps Forge

An AI-assisted DevOps learning platform that acts as a personal mentor for beginners, covering Docker, Docker Compose, GitHub Actions, GitLab CI, AWS, Terraform, and Kubernetes.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/devops-forge run dev` — run the React frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, wouter, TanStack Query, Framer Motion, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle ORM table definitions (modules, challenges, progress, challenge_hints, doc_topics)
- `artifacts/api-server/src/routes/` — Express route handlers (modules, challenges, progress, docs)
- `artifacts/devops-forge/src/` — React frontend (pages, components, layout)

## Architecture decisions

- Contract-first API: OpenAPI spec gates codegen, which generates both React Query hooks and Zod validators
- Single-user progress model: no auth in v1; all progress is global (one user assumed)
- XP level system: 7 levels from Apprentice → Master, driven by completed challenge XP sum
- Modules unlock sequentially: Docker and Docker Compose start unlocked; rest require progression
- Content stored in DB: challenge content and doc topics are in Postgres, making them easy to edit without deploys

## Product

- **Dashboard** — XP level, progress overview, activity feed
- **Modules** — 7 learning tracks (Docker, Docker Compose, GitHub Actions, GitLab CI, AWS, Terraform, Kubernetes)
- **Challenges** — hands-on exercises per module, filterable by difficulty (beginner/intermediate/advanced)
- **Documentation** — concept reference pages grouped by module
- **XP System** — earn XP by completing challenges, level up from Apprentice to Master

## User preferences

- Target audience: complete beginners with no coding knowledge
- Platform should feel like a mentor — patient, clear, and encouraging
- No emojis in the UI

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`
- Run `pnpm --filter @workspace/db run push` after editing schema files
- Parameterized SQL inserts (`params: [...]`) require single-statement queries
- Multi-statement SQL (e.g. multiple INSERTs) must go in one `executeSql` call without `params`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
