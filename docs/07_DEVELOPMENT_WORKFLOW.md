# 07 — Development Workflow

**Document status:** Complete  
**Last updated:** June 2026

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 24 | Required. Use the version pinned in the workspace. |
| pnpm | Latest | Package manager. Installed globally. |
| PostgreSQL | Any recent | Provided automatically in Replit via `DATABASE_URL`. For local dev outside Replit, provision your own and set `DATABASE_URL`. |

---

## First-time setup

```bash
# Install all workspace dependencies
pnpm install

# Push the database schema to your PostgreSQL instance
pnpm --filter @workspace/db run push

# Regenerate API client (safe to run on a fresh clone)
pnpm --filter @workspace/api-spec run codegen
```

After these three commands, the database has all tables and the generated client is in sync with the spec.

---

## Running the application

DevOps Forge consists of two processes. In Replit they run automatically via configured workflows. Outside Replit, run them in separate terminals.

**Terminal 1 — API server:**
```bash
pnpm --filter @workspace/api-server run dev
```
Starts the Express server on port 8080. Runs `build` (esbuild) then `start` (node). The server must be restarted manually after code changes — there is no hot reload on the server side.

**Terminal 2 — Frontend:**
```bash
pnpm --filter @workspace/devops-forge run dev
```
Starts the Vite dev server. Hot module replacement (HMR) is active — the browser updates instantly on file save.

**Accessing the application:**
- In Replit: use the preview pane (routed through the Replit proxy)
- Outside Replit: `http://localhost:80` (proxy) or `http://localhost:23362` (Vite direct)
- API directly: `http://localhost:80/api/healthz`

Do not call the API server on port 8080 directly from application code. Always use the proxy path `/api`.

---

## The API change workflow

Every API change follows this sequence. Do not skip steps.

```
1. Edit lib/api-spec/openapi.yaml
        ↓
2. pnpm --filter @workspace/api-spec run codegen
        ↓
3. Implement or update the route handler in artifacts/api-server/src/routes/
        ↓
4. Register the router in artifacts/api-server/src/routes/index.ts (if new)
        ↓
5. Use the generated hook in the frontend (import from @workspace/api-client-react)
        ↓
6. pnpm run typecheck
```

If step 2 is skipped, the generated types will not reflect the spec change, and the TypeScript compiler will not catch mismatches until the code is already wrong in two places.

---

## The database change workflow

```
1. Edit lib/db/src/schema/<table>.ts
        ↓
2. Export from lib/db/src/schema/index.ts (if new file)
        ↓
3. pnpm --filter @workspace/db run push
        ↓
4. pnpm run typecheck:libs
        ↓
5. Update route handlers and API spec if response shapes change
```

`drizzle-kit push` compares the TypeScript schema definition to the live database and applies the difference. It will ask for confirmation before destructive changes (column drops, type changes).

---

## Typechecking

```bash
# Full check — typecheck all libs then all artifacts
pnpm run typecheck

# Check only shared libs (faster during lib development)
pnpm run typecheck:libs

# Check a specific package
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/devops-forge run typecheck
```

The CLI result is authoritative. If the IDE and the CLI disagree, trust the CLI.

---

## Restarting the API server

After changes to the API server code:

```bash
# In Replit — use the workflow restart
# (Replit Agent: use restart_workflow "artifacts/api-server: API Server")

# Outside Replit — stop and re-run
pnpm --filter @workspace/api-server run dev
```

The frontend dev server does not need restarting — Vite's HMR handles it.

---

## Adding learning content

Challenge content, hints, and documentation topics live in the database. To add new content:

**Option 1 — Direct SQL (quickest for development):**
Use parameterised inserts:
```sql
INSERT INTO challenges (module_id, title, description, difficulty, xp_reward, content, tags, sort_order)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
```

**Option 2 — Via the future admin interface:**
Not yet built. Planned for v2.

**Guidelines for content:**
- `title` — action-oriented (e.g., "Build Your First Docker Image", not "Docker Images")
- `description` — one sentence stating the objective
- `content` — step-by-step instructions written for a complete beginner; indent code by two spaces
- `difficulty` — `beginner` for first exposure, `intermediate` for combining concepts, `advanced` for production-relevant complexity
- `xp_reward` — 50 for beginner, 75–100 for intermediate, 100–150 for advanced
- `sort_order` — determines recommended completion order within the module; start at 1

---

## Environment variables

All secrets are managed through Replit's secrets system. They are available as environment variables at runtime.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Reserved | Will be required when auth is added |
| `PORT` | Set by workflow | Port the API server binds to (default: 8080) |
| `NODE_ENV` | Set by workflow | `development` or `production` |

To add or change a secret in Replit: use the Secrets tab in the sidebar. Never put secrets in `.env` files in the repository.

---

## Common tasks reference

| Task | Command |
|------|---------|
| Install dependencies | `pnpm install` |
| Push DB schema | `pnpm --filter @workspace/db run push` |
| Run codegen | `pnpm --filter @workspace/api-spec run codegen` |
| Full typecheck | `pnpm run typecheck` |
| Start API server | `pnpm --filter @workspace/api-server run dev` |
| Start frontend | `pnpm --filter @workspace/devops-forge run dev` |
| Build API server | `pnpm --filter @workspace/api-server run build` |
| Build frontend | `pnpm --filter @workspace/devops-forge run build` |
| Check a single package | `pnpm --filter @workspace/<name> run typecheck` |

---

## Commit workflow

```bash
# Stage all changes
git add -A

# Commit with a Conventional Commit message
git commit -m "feat: add module unlock logic"

# Push to remote
git push origin main
```

Commit message format:
```
<type>: <short description>

Types: feat, fix, docs, chore, refactor, style, test
```

Examples:
```
feat: add hint reveal accordion to challenge detail
fix: prevent double XP award when completing same challenge twice
docs: populate 07_DEVELOPMENT_WORKFLOW
chore: regenerate API client after adding activity feed endpoint
refactor: move XP calculation to shared utility function
```

---

## Debugging

**API errors:** Check the workflow console in Replit. All server errors are logged as structured JSON with the error message and stack trace. Look for `"level":50` (error level in pino).

**Frontend data issues:** Open browser DevTools → Network tab → find the failing API call → check the response body. All API errors return `{ "error": "..." }`.

**Type errors:** Run `pnpm run typecheck` and read the output carefully. The most common causes are:
- Forgetting to run codegen after changing the spec
- Forgetting to run `typecheck:libs` after changing a lib
- Importing from a generated file that was recently regenerated (editor cache issue)

**Database issues:** Connect to the database using the `DATABASE_URL` environment variable with any PostgreSQL client. Run `SELECT * FROM modules LIMIT 5` to verify the schema is in place.

---

## What not to do

- Do not run `pnpm dev` or `pnpm run dev` at the workspace root — there is no such script
- Do not edit files in `lib/api-client-react/` or `lib/api-zod/` — they will be overwritten
- Do not write `console.log` in server code — use `req.log` or the `logger` singleton
- Do not call the API server on port 8080 directly from frontend code — use `/api` paths
- Do not write raw DDL SQL to create or alter tables — use Drizzle schema files and `db push`
- Do not commit `DATABASE_URL` or any secret to the repository
