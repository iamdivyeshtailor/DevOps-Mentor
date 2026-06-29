# 03 — Engineering Guide

**Document status:** Complete  
**Last updated:** June 2026

---

## Who this is for

This guide is for anyone working on the DevOps Forge codebase — including the original author returning after time away, a collaborator, or an AI assistant picking up a task. It covers the principles, conventions, and workflows that keep the codebase coherent as it grows.

Read this alongside `04_SYSTEM_ARCHITECTURE.md` (for the technical picture) and `07_DEVELOPMENT_WORKFLOW.md` (for the exact commands). This document covers the why behind the decisions; those cover the how.

---

## Core engineering principles

### 1. The OpenAPI spec is the source of truth

Every API endpoint, request shape, and response shape is defined in `lib/api-spec/openapi.yaml` before it is implemented. This is not optional. The spec gates codegen, which produces the TypeScript types, React Query hooks, and Zod validators that the frontend and backend both depend on.

The workflow is:
1. Design the endpoint in the spec
2. Run codegen
3. Implement the route handler (using generated Zod schemas for validation)
4. Build the frontend component (using generated React Query hooks)

Doing it in any other order creates drift — the frontend and backend end up making different assumptions about the same data, and TypeScript will eventually catch it, but only after wasted effort.

### 2. Generated files are not edited

`lib/api-client-react/` and `lib/api-zod/` are produced by Orval from the OpenAPI spec. They are regenerated every time the spec changes. Any manual edits are overwritten on the next codegen run. If the generated output is wrong, the fix goes in the spec or in the Orval config — never in the generated file itself.

### 3. Content belongs in the database

Challenge instructions, hints, documentation topics — all of it lives in PostgreSQL. This is intentional. It means:
- Content can be updated without a code change or deployment
- Content can eventually be managed through an admin interface
- Content can eventually be generated or augmented by an AI system
- Non-technical contributors can update content without touching the codebase

If you find yourself hardcoding learning content into a React component or a TypeScript file, that content belongs in the database instead.

### 4. Errors are explicit and logged

The server uses structured JSON logging (pino). `console.log` is not used anywhere in server code — instead, `req.log` is used in route handlers and the `logger` singleton is used elsewhere. This keeps logs queryable and consistent.

All API error responses return a JSON object with an `error` field. Silent 200 responses that hide failures are not acceptable.

### 5. Type safety is non-negotiable

The codebase runs in TypeScript strict mode. `any` is not used. Type assertions (`as SomeType`) are avoided unless there is a documented reason. If the TypeScript compiler is unhappy, the code is fixed — not suppressed.

### 6. Validate at the boundary

API route handlers validate their inputs using generated Zod schemas before any business logic runs. Data that enters the system is checked. Data that reaches the database is trusted to be valid because it was validated at entry.

---

## Package structure

This is a pnpm monorepo. Understanding the distinction between the different package types matters.

### `artifacts/` — leaf applications

These are the deployable applications. They are not published to npm and do not emit TypeScript declarations. They are typechecked with `tsc --noEmit` and built for deployment.

- `artifacts/api-server` — the Express API
- `artifacts/devops-forge` — the React frontend

Artifacts may import from `lib/` packages. They must never import from each other.

### `lib/` — shared libraries

These are composite TypeScript packages that emit declarations. They are the building blocks shared across artifacts.

- `lib/api-spec` — OpenAPI spec and Orval codegen config
- `lib/api-client-react` — generated React Query hooks (do not edit)
- `lib/api-zod` — generated Zod validators (do not edit)
- `lib/db` — Drizzle ORM schema, database client, and migration config

When you add a new lib, add it to the `references` array in the root `tsconfig.json`.

### `scripts/` — utility scripts

One-off scripts that do not belong in any artifact or lib. Each script lives in `scripts/src/` with a matching npm script in `scripts/package.json`.

---

## Adding a new API endpoint

1. **Edit `lib/api-spec/openapi.yaml`** — add the path, operation, parameters, request body (if any), and response schemas. Define any new schemas in `components/schemas`.

2. **Run codegen:**
   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```

3. **Write the route handler** in `artifacts/api-server/src/routes/`. Import the generated Zod schema for input validation. Return structured JSON.

4. **Register the router** in `artifacts/api-server/src/routes/index.ts`.

5. **Use the generated hook** in the frontend. Import from `@workspace/api-client-react`. Do not write fetch calls by hand.

6. **Typecheck** before committing:
   ```bash
   pnpm run typecheck
   ```

---

## Adding a database table

1. **Create a schema file** in `lib/db/src/schema/`. Each table gets its own file. Export the table, the insert schema (from `drizzle-zod`), and the TypeScript types.

2. **Export from the schema index** in `lib/db/src/schema/index.ts`.

3. **Push the schema:**
   ```bash
   pnpm --filter @workspace/db run push
   ```

4. **Rebuild lib types:**
   ```bash
   pnpm run typecheck:libs
   ```

Do not write raw DDL SQL to create tables. Drizzle manages the schema. Running `push` compares the defined schema to the live database and applies the difference.

---

## Adding a new frontend page

1. **Create the page component** in `artifacts/devops-forge/src/pages/`. Name it after the route (e.g., `ModuleDetail.tsx` for `/modules/:id`).

2. **Add the route** in `App.tsx` using wouter's `<Route>` component.

3. **Use generated hooks** for data fetching. Pass `{ query: { enabled: !!param, queryKey: getXxxQueryKey(param) } }` as options where applicable.

4. **Handle loading and empty states** — every page that fetches data must render a loading skeleton while data is in flight and a clear empty state when there is no data.

5. **Add the page to the sidebar** if it is a top-level navigation destination.

---

## Commit conventions

Follow Conventional Commits:

```
feat: add module unlock logic
fix: prevent duplicate XP award on re-completion
docs: populate 03_ENGINEERING_GUIDE
chore: regenerate API client after spec update
refactor: extract XP calculator into shared utility
style: align sidebar icon spacing
test: add progress summary endpoint tests
```

The type prefix matters. It makes the git log scannable and will eventually feed into automated changelog generation.

---

## Code review checklist

Before merging any change, verify:

- [ ] `pnpm run typecheck` passes with no errors
- [ ] If the OpenAPI spec changed, `pnpm --filter @workspace/api-spec run codegen` was run and the generated files are committed
- [ ] If the DB schema changed, `pnpm --filter @workspace/db run push` was run in the target environment
- [ ] No `console.log` calls in server code
- [ ] No manual edits to generated files
- [ ] No hardcoded learning content in application code
- [ ] Error cases return structured JSON
- [ ] Loading and empty states are handled in any new UI
- [ ] This guide (and related docs) updated if architecture or workflow changed

---

## Gotchas

**Do not run `pnpm dev` at the workspace root.** There is no root `dev` script. Services are started via their own package scripts or via Replit workflows.

**Parameterised SQL queries require single statements.** When using `executeSql` with `params`, the query must be a single SQL statement. Multi-statement SQL goes in a single `executeSql` call without `params`.

**Trust `pnpm run typecheck` over the editor.** If the IDE and the CLI disagree on type errors, the CLI result is authoritative. The editor LSP can lag behind the latest lib declarations.

**After changing a lib, rebuild before checking artifacts.** Run `pnpm run typecheck:libs` first. Missing exports from `@workspace/db` usually mean stale lib declarations, not bad imports.
