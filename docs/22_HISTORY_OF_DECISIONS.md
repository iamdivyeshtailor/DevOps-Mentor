# 22 — History of Decisions

**Document status:** Complete  
**Last updated:** June 2026

---

## What this document is for

Architecture Decision Records (ADRs) capture significant decisions made about the design, technology, and direction of DevOps Forge. Each record explains the context, the options considered, the decision made, and the reasoning. This creates an auditable trail that helps future contributors understand *why* the system is the way it is — not just *what* it is.

Update this document when a significant decision is made. A decision is significant if:
- It would be surprising to a new contributor
- It involves a meaningful tradeoff
- It is the kind of thing someone might want to reverse later, in which case the reasoning should be recorded to help evaluate that reversal

---

## ADR-001 — Contract-first API with OpenAPI and Orval

**Date:** June 2026  
**Status:** Accepted

**Context:**  
The platform needs a well-defined API contract between the Express backend and the React frontend. Without a formal contract, the two sides can drift — the frontend assumes a field that the backend stopped returning, or the backend changes a response shape without updating the frontend.

**Options considered:**
1. Write TypeScript types manually, shared via a `lib/types` package
2. Use tRPC for end-to-end type safety without a separate spec
3. Define the contract in OpenAPI and generate types and hooks via Orval

**Decision:** Option 3 — OpenAPI spec + Orval codegen.

**Reasoning:**
- OpenAPI is a standard that tooling, documentation generators, and AI assistants all understand
- Orval generates both React Query hooks (for the frontend) and Zod validators (for the backend) from the same spec — one source of truth produces two sets of generated artifacts
- The spec is human-readable and serves as documentation independent of the code
- tRPC is excellent but tightly couples the server and client; OpenAPI allows the server and client to be deployed and scaled independently

**Consequences:**
- Any API change must start with the spec — this discipline must be maintained consistently
- Generated files must not be edited manually — this is enforced by convention, not tooling
- Codegen must be run after every spec change — this is a manual step that could be automated

---

## ADR-002 — Content stored in the database, not in static files

**Date:** June 2026  
**Status:** Accepted

**Context:**  
Challenge instructions, hints, and documentation need to live somewhere. The options are: static files (Markdown files in the repository), a CMS, or the application database.

**Options considered:**
1. Markdown files in the repository (`content/challenges/docker/01-first-container.md`)
2. A headless CMS (Contentful, Sanity, Notion as CMS)
3. PostgreSQL via the application database

**Decision:** Option 3 — PostgreSQL.

**Reasoning:**
- Content in the database can be updated without a code change or deployment — important for correcting errors quickly
- Content can be queried and joined with progress data — knowing which challenges a learner has completed is straightforward when challenges are database rows
- A CMS adds a third-party dependency, an API key, and a new failure mode; the complexity is not justified for a single-author project
- Markdown files in the repository would require a build step to parse and serve; they cannot be updated without a deployment

**Consequences:**
- Content must be inserted via SQL or a future admin UI — there is no convenient file-based editing workflow
- Content has no version history beyond the database's own state — git history does not capture content changes made after the initial seed
- A formal seed script should be created so content can be reproduced from scratch if needed (planned for v1.1)

---

## ADR-003 — Single-user model in v1 (no authentication)

**Date:** June 2026  
**Status:** Accepted (temporary)

**Context:**  
Building authentication and per-user progress isolation is significant work. The platform can deliver value to a single learner without it. The question is whether to build auth before shipping or add it later.

**Options considered:**
1. Build authentication from the start (Replit Auth or Clerk)
2. Ship without authentication; add it later
3. Ship with a simple passcode/PIN (fake auth)

**Decision:** Option 2 — no authentication in v1.

**Reasoning:**
- The platform is being built by and for one learner initially; multi-user is not an immediate need
- Shipping sooner lets the learning experience be validated before investing in auth infrastructure
- The schema is designed with the migration in mind — adding `user_id` to the progress table is a straightforward schema change
- Option 3 (fake auth) provides security theatre without real benefits and complicates the later migration to real auth

**Consequences:**
- The platform cannot be safely shared with multiple learners until auth is added (Sprint 3)
- The current `progress` table has a UNIQUE constraint on `challenge_id` alone — this must change to `(challenge_id, user_id)` when auth is added
- Any current progress data will be lost or migrated when multi-user is implemented

---

## ADR-004 — pnpm workspaces monorepo structure

**Date:** June 2026  
**Status:** Accepted

**Context:**  
The project has multiple deployable services (API server, frontend) and shared libraries (DB schema, API types). These could be managed as separate repositories or as a monorepo.

**Options considered:**
1. Separate repositories for each service
2. A single repository with packages managed by pnpm workspaces

**Decision:** Option 2 — pnpm monorepo.

**Reasoning:**
- The API spec, client hooks, and Zod validators are tightly coupled — they must be kept in sync. A monorepo makes this explicit and automatic
- Running codegen, typechecks, and builds across all packages from a single root command is more convenient than coordinating across repositories
- A monorepo simplifies onboarding — one clone, one `pnpm install`, and everything is ready

**Consequences:**
- Packages must declare their own dependencies explicitly; dependencies are not shared implicitly
- Artifacts must never import from each other (only from libs)
- Root `tsconfig.json` is a solution file for libs only — artifacts are not included

---

## ADR-005 — Dark terminal-inspired UI aesthetic

**Date:** June 2026  
**Status:** Accepted

**Context:**  
The platform needs a visual design that communicates professionalism and is comfortable for extended study sessions. The target audience is aspiring DevOps engineers — people who work in terminals and want to be taken seriously as practitioners.

**Options considered:**
1. Light, academic aesthetic (whitespace, serif fonts, Notion-like)
2. Dark, terminal-inspired aesthetic (dark background, monospace accents, cyan/blue palette)
3. Neutral/minimal with light mode default and optional dark mode

**Decision:** Option 2 — dark terminal-inspired.

**Reasoning:**
- The aesthetic matches the domain — learners are working with CLIs, terminal output, and code. A dark interface signals "you belong here"
- Dark interfaces reduce eye strain during extended use — important for a learning platform used for hours at a time
- The aesthetic is memorable and distinctive — it helps the platform have an identity

**Consequences:**
- No emojis anywhere in the UI — the professional tone is incompatible with decorative emoji use
- Accessibility considerations: ensure sufficient contrast ratios in all text/background combinations
- Light mode is not planned for v1 — this is a deliberate constraint, not an oversight

---

## ADR-006 — wouter over React Router for client-side routing

**Date:** June 2026  
**Status:** Accepted

**Context:**  
The frontend needs client-side routing. The standard choice in the React ecosystem is React Router; an alternative is wouter.

**Options considered:**
1. React Router v6/v7
2. wouter

**Decision:** wouter.

**Reasoning:**
- wouter is significantly smaller (under 2KB gzipped vs React Router's ~25KB)
- The platform's routing needs are straightforward — no nested routes with complex loaders, no framework-level data fetching
- wouter's API is simpler and easier to understand for future contributors
- React Router v7's new features (full-stack framework mode) are unnecessary complexity for this use case

**Consequences:**
- Some React Router patterns (nested layouts via Outlet, data loaders) are not available; layouts are implemented as wrapper components instead
- If routing needs grow complex, migrating to React Router is straightforward

---

## ADR-007 — esbuild for API server bundling

**Date:** June 2026  
**Status:** Accepted

**Context:**  
The API server needs to be bundled for production deployment. Options include `tsc` (TypeScript compiler output), esbuild, and `tsx` (runtime TypeScript).

**Options considered:**
1. `tsc` — compile TypeScript to JavaScript, run with Node.js
2. esbuild — fast bundler that compiles TypeScript to a single file
3. `tsx` — run TypeScript directly without compilation

**Decision:** esbuild.

**Reasoning:**
- esbuild produces a single bundled file (`dist/index.mjs`) that includes all dependencies — no `node_modules` needed at runtime in production
- Build times are under 500ms for this codebase — fast enough for the dev workflow (build-on-restart pattern)
- `tsc` output requires `node_modules` to be present and does not bundle dependencies
- `tsx` (runtime compilation) adds startup overhead and is not suitable for production

**Consequences:**
- The production image does not need `node_modules` — the bundle is self-contained (simplifies the Docker image)
- Source maps are generated for production (`--enable-source-maps` in the start command) so stack traces are readable
- The build step adds ~500ms to each server restart in development — acceptable but noted

---

## Template for future ADRs

```markdown
## ADR-XXX — <Title>

**Date:** <date>
**Status:** Accepted / Superseded by ADR-YYY / Reverted

**Context:**
<What problem were we solving? What was the situation that forced a decision?>

**Options considered:**
1. <Option A>
2. <Option B>
3. <Option C>

**Decision:** <Which option was chosen>

**Reasoning:**
<Why was this option chosen over the alternatives? Be specific.>

**Consequences:**
<What are the implications of this decision? What does it make easier? What does it make harder?>
```
