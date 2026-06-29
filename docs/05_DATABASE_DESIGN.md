# 05 — Database Design

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

DevOps Forge uses a single PostgreSQL database managed by Replit. The schema is defined in TypeScript using Drizzle ORM and synchronised to the database with `drizzle-kit push`. There is no separate migration file system in v1 — schema state is managed by Drizzle.

All schema files live in `lib/db/src/schema/`. Each table has its own file. The index at `lib/db/src/schema/index.ts` exports everything.

---

## Tables

### `modules`

Stores the seven learning modules. This table is relatively static — rows are seeded at setup and updated when curriculum changes are made.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Auto-incrementing integer ID |
| `slug` | text | NOT NULL, UNIQUE | URL-safe identifier (e.g., `docker`, `kubernetes`) |
| `title` | text | NOT NULL | Display name (e.g., "Docker") |
| `description` | text | NOT NULL | One-paragraph description of the module |
| `icon` | text | NOT NULL | Icon identifier (maps to a lucide-react icon name) |
| `category` | enum | NOT NULL | One of: `containers`, `ci_cd`, `cloud`, `infrastructure`, `orchestration` |
| `estimated_hours` | integer | NOT NULL, DEFAULT 0 | Rough learning time estimate |
| `is_unlocked` | boolean | NOT NULL, DEFAULT false | Whether the module is accessible to the learner |
| `sort_order` | integer | NOT NULL, DEFAULT 0 | Display order in the module list |

**Seeded data:** All seven modules are seeded at project setup. Docker and Docker Compose have `is_unlocked = true`. All others are `false` and will be unlocked by the progression system.

**Enum: `category`**
- `containers` — Docker, Docker Compose
- `ci_cd` — GitHub Actions, GitLab CI
- `cloud` — AWS
- `infrastructure` — Terraform
- `orchestration` — Kubernetes

---

### `challenges`

Stores individual learning exercises. Each challenge belongs to one module. This table grows as new curriculum content is authored.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Auto-incrementing integer ID |
| `module_id` | integer | NOT NULL, FK → modules.id | Parent module |
| `title` | text | NOT NULL | Challenge title (action-oriented, e.g., "Run Your First Container") |
| `description` | text | NOT NULL | One-sentence objective |
| `difficulty` | enum | NOT NULL | One of: `beginner`, `intermediate`, `advanced` |
| `xp_reward` | integer | NOT NULL, DEFAULT 50 | XP awarded on completion |
| `content` | text | NOT NULL, DEFAULT '' | Full instructional content (Markdown-compatible) |
| `tags` | text[] | NOT NULL, DEFAULT [] | Searchable keywords |
| `sort_order` | integer | NOT NULL, DEFAULT 0 | Recommended completion order within the module |

**XP reward conventions:**
- Beginner challenges: 50 XP
- Intermediate challenges: 75–100 XP
- Advanced challenges: 100–150 XP

**Content format:** Free text with code indented by spaces (not fenced with backticks, since the frontend renders it as pre-formatted text). Sections are separated by blank lines. A future version will support Markdown rendering.

**Enum: `difficulty`**
- `beginner` — no prior knowledge of the technology required
- `intermediate` — requires completing at least one beginner challenge in the module
- `advanced` — requires solid understanding of the module fundamentals

---

### `challenge_hints`

Stores progressive hints for each challenge. Multiple hints per challenge, ordered by `sort_order`. Hints are designed to narrow the search space rather than give away the answer.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Auto-incrementing integer ID |
| `challenge_id` | integer | NOT NULL, FK → challenges.id | Parent challenge |
| `hint` | text | NOT NULL | The hint text (one to three sentences) |
| `sort_order` | integer | NOT NULL, DEFAULT 0 | Order of reveal (1 = first hint shown) |

**Hint design:** Each challenge should have 2–3 hints. The first narrows the problem. The second points toward the solution. The third (if present) provides enough information that only the final step remains to the learner. Hints never directly paste the answer.

---

### `progress`

Tracks challenge completion for the learner. In v1, this is a single global record per challenge (no user segmentation). The unique constraint on `challenge_id` ensures one completion record per challenge.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Auto-incrementing integer ID |
| `challenge_id` | integer | NOT NULL, UNIQUE, FK → challenges.id | The completed challenge |
| `is_completed` | boolean | NOT NULL, DEFAULT false | Completion flag |
| `completed_at` | timestamp | nullable | When the challenge was marked complete |

**Notes:**
- The UNIQUE constraint on `challenge_id` means there is at most one progress record per challenge. This is intentional for v1 and will change when user accounts are added.
- `is_completed` is stored explicitly rather than relying on the presence of a row, in case future designs need to store progress state other than binary completion (e.g., "in progress").
- XP is not stored here — it is derived from `challenges.xp_reward` at query time for any row where `is_completed = true`.

**Multi-user migration path:** When authentication is added, a `user_id` column will be added to this table and the UNIQUE constraint will change from `(challenge_id)` to `(challenge_id, user_id)`.

---

### `doc_topics`

Stores documentation reference articles associated with modules. Each topic is a self-contained concept explanation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | serial | PRIMARY KEY | Auto-incrementing integer ID |
| `module_id` | integer | NOT NULL, FK → modules.id | Parent module |
| `title` | text | NOT NULL | Topic title (e.g., "What is a Container?") |
| `summary` | text | NOT NULL | One-sentence description for the topic list |
| `content` | text | NOT NULL, DEFAULT '' | Full article content |
| `reading_minutes` | integer | NOT NULL, DEFAULT 5 | Estimated reading time |
| `tags` | text[] | NOT NULL, DEFAULT [] | Searchable keywords |
| `sort_order` | integer | NOT NULL, DEFAULT 0 | Display order within the module |

**Content format:** Same as challenges — free text with indented code blocks. Markdown rendering is planned.

---

## Relationships

```
modules (1) ──────────────── (many) challenges
                                        │
                                        ├── (many) challenge_hints
                                        │
                                        └── (many) progress

modules (1) ──────────────── (many) doc_topics
```

- A module has many challenges
- A challenge has many hints
- A challenge has at most one progress record (v1)
- A module has many documentation topics

---

## Computed values

Several values used in the API are computed at query time rather than stored:

| Value | Computation |
|-------|-------------|
| `totalChallenges` per module | `COUNT(*)` on challenges where `module_id = ?` |
| `completedChallenges` per module | `COUNT(*)` on challenges joined with progress where `is_completed = true` |
| `totalXp` | `SUM(challenges.xp_reward)` filtered to completed challenges |
| `level` | Derived from `totalXp` by the `xpToLevel()` function in the progress route |
| `modulesStarted` | Count of modules with at least one completed challenge |
| `modulesCompleted` | Count of modules where all challenges are completed |

These are intentionally not materialised as columns — they would require updates whenever progress changes, adding write complexity. At the current data scale, computing them on read is fast enough.

---

## Schema file locations

| Table | Schema file |
|-------|-------------|
| `modules` | `lib/db/src/schema/modules.ts` |
| `challenges` | `lib/db/src/schema/challenges.ts` |
| `challenge_hints` | `lib/db/src/schema/challenge_hints.ts` |
| `progress` | `lib/db/src/schema/progress.ts` |
| `doc_topics` | `lib/db/src/schema/doc_topics.ts` |

---

## Working with the schema

### Adding a column

1. Add the column definition to the relevant schema file in `lib/db/src/schema/`
2. Run `pnpm --filter @workspace/db run push`
3. Run `pnpm run typecheck:libs` to rebuild declarations
4. Update any route handlers or response shapes as needed
5. If the API response shape changes, update `lib/api-spec/openapi.yaml` and rerun codegen

### Adding a table

1. Create a new file in `lib/db/src/schema/`
2. Define the table, insert schema, and TypeScript types
3. Export from `lib/db/src/schema/index.ts`
4. Run `pnpm --filter @workspace/db run push`
5. Run `pnpm run typecheck:libs`

### Inspecting the live database

In development, connect to the database using the `DATABASE_URL` environment variable. Any PostgreSQL client (psql, TablePlus, DBeaver) works. The database name and credentials are available via the `PG*` environment variables in the Replit secrets system.

---

## Data seeding

All learning content is seeded into the database rather than loaded from files. The seed data includes:
- All 7 modules
- 10 challenges across the modules (with content and hints)
- 7 documentation topics (one per module)

Seed inserts use `ON CONFLICT DO NOTHING` to make them safe to run multiple times. Additional content can be seeded by adding new parameterised inserts.

Seed scripts are run via `executeSql` calls in the Replit code execution sandbox during initial setup. A formal seed script in `scripts/` is planned for v1.1.
