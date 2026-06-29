# 04 — System Architecture

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

DevOps Forge is a monorepo web application consisting of a React frontend, an Express API server, and a PostgreSQL database. The two services run as separate processes and communicate over HTTP. A shared reverse proxy routes traffic by path, so the browser sees a single origin.

```
                          ┌─────────────────────┐
                          │      Browser         │
                          └────────┬────────────┘
                                   │  HTTPS
                          ┌────────▼────────────┐
                          │   Reverse Proxy      │  (Replit shared proxy)
                          │  routes by path      │
                          └──┬──────────────┬───┘
                             │              │
                   path: /   │              │  path: /api
                             │              │
              ┌──────────────▼───┐   ┌──────▼────────────────┐
              │  React Frontend  │   │    Express API Server  │
              │  Vite dev server │   │    Node.js / TS        │
              │  port: dynamic   │   │    port: 8080          │
              └──────────────────┘   └──────────┬────────────┘
                                                │
                                     ┌──────────▼────────────┐
                                     │     PostgreSQL         │
                                     │   Drizzle ORM          │
                                     │   Replit-managed DB    │
                                     └───────────────────────┘
```

---

## Monorepo structure

The project uses pnpm workspaces. Packages are split into two categories:

**Artifacts** — deployable leaf applications. They import from libs but never from each other.

**Libraries** — shared TypeScript packages that emit declarations and can be imported by artifacts.

```
pnpm-workspace
├── artifacts/
│   ├── api-server          Express API (leaf, no emit)
│   └── devops-forge        React + Vite (leaf, no emit)
└── lib/
    ├── api-spec            OpenAPI spec + Orval config (composite)
    ├── api-client-react    Generated hooks (composite, do not edit)
    ├── api-zod             Generated validators (composite, do not edit)
    └── db                  Drizzle schema + client (composite)
```

TypeScript is configured with project references. The root `tsconfig.json` references the libs. Artifacts use `tsc --noEmit` for typechecking. Libs use `tsc --build` and emit declarations.

---

## API layer

### Contract-first design

The API is defined in `lib/api-spec/openapi.yaml` before any implementation. This OpenAPI 3.1 spec is the contract between the frontend and backend.

Orval reads the spec and generates two outputs:
- `lib/api-client-react/` — React Query hooks typed to the exact response shapes defined in the spec
- `lib/api-zod/` — Zod schemas for validating API inputs and outputs in route handlers

This means the frontend and backend share a type system derived from a single source of truth. A mismatch between what the server returns and what the frontend expects is a compile-time error, not a runtime surprise.

### Request lifecycle

```
Browser
  → React Query hook (generated)
    → fetch() to /api/...
      → Reverse proxy
        → Express router
          → Route handler
            → Zod validation (generated schema)
              → Drizzle query
                → PostgreSQL
              ← Result
            ← Validated + shaped response
          ← JSON response
        ← (proxy pass-through)
      ← Response
    ← Cached in TanStack Query
  ← Rendered in component
```

### API conventions

- All routes are prefixed with `/api`
- Responses are always JSON
- Error responses always have shape `{ error: string }`
- HTTP status codes are used semantically: 200 OK, 404 Not Found, 500 Internal Server Error
- Route handlers catch all exceptions and return 500 with a logged error
- Input validation uses generated Zod schemas — not manual checks

### Current endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/healthz | Health check |
| GET | /api/modules | List all modules with progress counts |
| GET | /api/modules/:id | Get module with its challenges |
| GET | /api/challenges | List challenges (filterable by moduleId, difficulty) |
| GET | /api/challenges/:id | Get challenge detail with hints |
| POST | /api/challenges/:id/complete | Mark challenge complete, award XP |
| GET | /api/progress/summary | Dashboard summary (XP, level, counts) |
| GET | /api/progress/activity | Recent activity feed |
| GET | /api/docs/topics | List documentation topics (filterable by moduleId) |
| GET | /api/docs/topics/:id | Get documentation topic detail |

---

## Frontend

### Technology choices

| Choice | Rationale |
|--------|-----------|
| React 18 | Industry standard, large ecosystem, good TypeScript support |
| Vite | Fast dev server and build tool with excellent HMR |
| wouter | Lightweight client-side router; no overhead of React Router for this scale |
| TanStack Query | Excellent data-fetching layer; pairs naturally with generated React Query hooks |
| Tailwind CSS | Utility-first; fast to iterate without context-switching to CSS files |
| Framer Motion | Smooth, declarative animations without complex imperative code |

### Component structure

```
artifacts/devops-forge/src/
├── App.tsx                  Root component, routing configuration
├── main.tsx                 React entry point, TanStack Query provider
├── index.css                Tailwind configuration, custom CSS variables
├── pages/
│   ├── Dashboard.tsx        XP overview, activity feed, module cards
│   ├── ModulesList.tsx      All modules grid
│   ├── ModuleDetail.tsx     Module + challenge list
│   ├── ChallengesList.tsx   Filterable challenge browser
│   ├── ChallengeDetail.tsx  Full challenge + hints + complete button
│   ├── DocsList.tsx         Documentation topic browser
│   └── DocDetail.tsx        Individual documentation page
└── components/
    └── layout/
        ├── AppLayout.tsx    Outer shell: sidebar + content area
        └── AppSidebar.tsx   Navigation sidebar
```

### Data fetching pattern

All data fetching uses generated hooks from `@workspace/api-client-react`. The pattern for hooks with parameters:

```typescript
// Correct
const { data } = useGetModule(id, {
  query: {
    enabled: !!id,
    queryKey: getGetModuleQueryKey(id),
  },
});

// Mutation
const mutation = useCompleteChallenge();
mutation.mutate({ params: { id } });
```

Hooks return data directly — not wrapped in a `{ data }` object. This is generated by Orval from the spec.

---

## Database

### Technology

PostgreSQL managed by Replit, accessed via Drizzle ORM. Drizzle provides:
- Type-safe query building
- Schema definition in TypeScript
- `drizzle-kit push` for schema synchronisation in development
- `drizzle-zod` for generating Zod insert schemas from table definitions

### Schema overview

```
modules
  id, slug, title, description, icon, category,
  estimated_hours, is_unlocked, sort_order

challenges
  id, module_id → modules.id,
  title, description, difficulty, xp_reward,
  content, tags[], sort_order

challenge_hints
  id, challenge_id → challenges.id,
  hint, sort_order

progress
  id, challenge_id → challenges.id (unique),
  is_completed, completed_at

doc_topics
  id, module_id → modules.id,
  title, summary, content, reading_minutes, tags[], sort_order
```

See `05_DATABASE_DESIGN.md` for the full schema design with column-level documentation.

### Data access pattern

All database access goes through the Drizzle client exported from `@workspace/db`. Raw SQL is not used in route handlers. Query results are shaped into response objects inside route handlers — the raw database row shape is never returned directly to the client.

---

## Routing and proxying

Replit's shared reverse proxy routes requests by path prefix to the correct service:

| Path | Service |
|------|---------|
| `/api` | API server (port 8080) |
| `/` | Frontend (dynamic port) |

Paths are not rewritten. The API server handles the full `/api` prefix on every route. The frontend uses relative URLs in `fetch` calls — no hardcoded hosts.

In production, both services are behind the same Replit-managed HTTPS domain. In development, the proxy runs locally on port 80.

---

## Logging

The API server uses pino for structured JSON logging. Every route handler has access to `req.log` (a pino child logger scoped to the request). Non-request code uses the `logger` singleton imported from the server module.

Log levels:
- `info` — normal operation (server start, request completed)
- `warn` — unexpected but recoverable situations
- `error` — route handler exceptions, database errors

`console.log` and `console.error` are not used in server code.

---

## Environment and secrets

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | (Reserved for future auth) |
| `PORT` | Port the API server binds to (set by Replit workflow) |
| `NODE_ENV` | `development` or `production` |

Secrets are managed through Replit's secrets system. They are never committed to source control. The application fails explicitly if a required environment variable is missing.

---

## Future architectural considerations

### Authentication

The current single-user model will need to be replaced with per-user progress records. The most likely approach is Replit Auth (OIDC with PKCE) or Clerk. This will require:
- Adding a `users` table to the schema
- Adding `user_id` foreign keys to the `progress` table
- Adding auth middleware to the Express server
- Adding auth state management to the frontend

### AI mentor

The AI mentor will be integrated as additional API endpoints that proxy requests to an LLM (via Replit's AI integration layer). The mentor will receive the current challenge context and respond in the style of a patient, knowledgeable guide. The frontend will expose this as a chat-like interface within the challenge detail page.

### Content management

As the content library grows, a lightweight admin interface will be needed to manage challenges, hints, and documentation without SQL. This will be a separate authenticated section of the frontend backed by admin-only API routes.
