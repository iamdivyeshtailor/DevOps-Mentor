# 26 — Master Roadmap

**Document status:** Living document — update whenever scope changes  
**Last updated:** June 2026  
**Owner:** Project author  
**Supersedes:** `20_SPRINT_ROADMAP.md` (which remains as historical context)

---

## Purpose

This is the single source of truth for what gets built, in what order, and how to know when each phase is done. Every other planning document (`20_SPRINT_ROADMAP.md`, `21_PRODUCT_BACKLOG.md`) feeds into this one. When there is a conflict, this document wins.

The roadmap is organised into discrete sprints. Each sprint has a clear objective, concrete tasks, acceptance criteria, and an explicit exit gate before the next sprint begins. Work within a sprint can run in parallel; work across sprints runs in dependency order.

**How to use this document:**
- Before starting any engineering work, read the sprint's prerequisites and ensure they are met
- Use the acceptance criteria as a checklist before declaring the sprint done
- Update the change log at the bottom whenever scope changes materially
- Update sprint status when a sprint starts (`In Progress`) and when it ends (`Complete`)

---

## Sprint index

| Sprint | Title | Status | Complexity | Key dependency |
|--------|-------|--------|------------|----------------|
| Sprint 0 | Foundation | Complete | — | None |
| Sprint 1 | Content Foundation | Not started | Medium | Sprint 0 complete |
| Sprint 2 | Progression System | Not started | Medium | Sprint 1 complete |
| Sprint 3 | Authentication and Multi-user | Not started | High | Sprint 2 complete |
| Sprint 4 | AI Mentor | Not started | High | Sprint 3 complete |
| Sprint 5 | Testing and CI/CD | Not started | Medium | Sprint 4 complete |
| Sprint 6 | Polish and Public Beta | Not started | Medium | Sprint 5 complete |

---

## Sprint 0 — Foundation

**Status:** Complete  
**Completed:** June 2026

### Objective

Prove the architecture works end to end. Ship a live, navigable platform with enough content to demonstrate the learning experience.

### What was delivered

- pnpm monorepo with packages: `api-server`, `devops-forge`, `api-spec`, `db`, `api-client-react`, `api-zod`
- PostgreSQL database with Drizzle ORM: `modules`, `challenges`, `challenge_hints`, `progress`, `doc_topics` tables
- OpenAPI 3.1 spec covering all planned endpoints; Orval codegen producing React Query hooks and Zod validators
- Express API server with full route coverage: modules, challenges, progress, docs, healthz
- React frontend with seven pages: Dashboard, Modules, Module Detail, Challenges, Challenge Detail, Documentation, Doc Detail
- Dark terminal-inspired UI with sidebar navigation, XP level display, and module cards
- All 7 modules seeded; Docker and Docker Compose unlocked; remaining modules locked
- 10 challenges seeded with content and hints across all modules
- 7 documentation topics seeded (one per module)
- Challenge completion flow: mark complete, XP update, dashboard refresh via TanStack Query invalidation
- Production deployment on Replit
- Project handbook: `docs/` directory with 26 files

### Known gaps carried into Sprint 1

- 10 of ~53 planned challenges seeded
- Module unlock is hardcoded static flags; no dynamic progression
- Streak is hardcoded to 1; real calculation not implemented
- Challenge content and documentation rendered as plain text; no Markdown parser
- No formal seed script; content added via ad-hoc SQL
- No automated tests; no CI/CD pipeline

---

## Sprint 1 — Content Foundation

**Status:** Not started  
**Estimated effort:** 3–4 weeks  
**Complexity:** Medium (writing-heavy, moderate engineering)

### Objective

Grow the challenge library from 10 to at least 35 challenges. Every module has enough content to form a real learning sequence. Introduce Markdown rendering so content looks professional. Create a formal, repeatable seed process.

The rule for this sprint: content is the product. No new features ship until the content is solid enough that a learner could spend a meaningful session on the platform and come away having genuinely learned something.

---

### User stories

**US-1.1** As a learner, I can work through at least 8 Docker challenges from first container to multi-stage builds, so that I build real Docker competence in a single module.

**US-1.2** As a learner, I can complete at least 4 Docker Compose challenges that progress from a basic two-service setup to production patterns, so that I understand how Compose relates to real applications.

**US-1.3** As a learner, I can complete at least 3 challenges in GitHub Actions, GitLab CI, AWS, Terraform, and Kubernetes so that each module feels started rather than empty.

**US-1.4** As a learner, I can read challenge content and documentation that renders headers, code blocks, and lists correctly, so that instructions are easy to follow rather than walls of plain text.

**US-1.5** As a learner, I can see at least 3 documentation topics per module so that the reference material complements the challenges I am working through.

**US-1.6** As a contributor, I can run a single command to seed all platform content from scratch so that the database can be reproduced without manual SQL.

---

### Implementation tasks

#### I-1.1 — Formal seed script

- Create `scripts/src/seed.ts` as the single source of truth for all seeded data
- Implement a `clearAll()` function that truncates tables in dependency order before seeding
- Implement `seedModules()`, `seedChallenges()`, `seedHints()`, `seedDocTopics()` functions
- Add `"seed": "tsx src/seed.ts"` to `scripts/package.json`
- Verify the script is idempotent: running it twice produces the same state as running it once
- Document the command in `03_ENGINEERING_GUIDE.md` and `07_DEVELOPMENT_WORKFLOW.md`

#### I-1.2 — Markdown rendering

- Install `marked` in `artifacts/devops-forge` (`pnpm --filter @workspace/devops-forge add marked`)
- Create a `MarkdownRenderer` component that accepts a `content: string` prop and renders it as sanitised HTML
- Apply `MarkdownRenderer` to the challenge detail content field
- Apply `MarkdownRenderer` to the documentation topic content field
- Convert all seeded challenge content and documentation topics from plain-text format to valid Markdown (headings, fenced code blocks, bullet lists)
- Verify code blocks display in monospace with visible distinction from body text

#### I-1.3 — Docker module challenges (target: 10 total)

Write and seed the following challenges for the Docker module. Each challenge must include full instructional content written to the standards in `10_CHALLENGE_ENGINE.md` and `12_HINT_ENGINE.md`, with 2–3 hints per challenge.

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Run Your First Container | Beginner | 50 |
| 2 | Explore a Running Container | Beginner | 50 |
| 3 | Build Your First Docker Image | Beginner | 75 |
| 4 | Pass Environment Variables to a Container | Beginner | 75 |
| 5 | Mount a Volume to Persist Data | Intermediate | 100 |
| 6 | Connect Containers with a Network | Intermediate | 100 |
| 7 | Push an Image to Docker Hub | Intermediate | 100 |
| 8 | Inspect and Debug a Container | Intermediate | 100 |
| 9 | Build a Multi-stage Image | Advanced | 125 |
| 10 | Optimise an Image for Size | Advanced | 150 |

#### I-1.4 — Docker Compose module challenges (target: 6 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Define a Two-service Application | Beginner | 75 |
| 2 | Use Environment Variables from a .env File | Beginner | 75 |
| 3 | Add a Redis Cache to a Compose Application | Intermediate | 100 |
| 4 | Implement a Health Check | Intermediate | 100 |
| 5 | Override Configuration for Different Environments | Advanced | 125 |
| 6 | Build and Push Images with Compose | Advanced | 125 |

#### I-1.5 — GitHub Actions module challenges (target: 4 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Run a Workflow on Push | Beginner | 75 |
| 2 | Run Tests Automatically in CI | Beginner | 75 |
| 3 | Use Secrets in a Workflow | Intermediate | 100 |
| 4 | Build and Push a Docker Image in CI | Advanced | 125 |

#### I-1.6 — GitLab CI module challenges (target: 3 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Write Your First GitLab Pipeline | Beginner | 75 |
| 2 | Run a Job in a Docker Container | Intermediate | 100 |
| 3 | Cache Dependencies Between Pipeline Runs | Intermediate | 100 |

#### I-1.7 — AWS module challenges (target: 3 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Launch an EC2 Instance | Beginner | 75 |
| 2 | Connect to EC2 via SSH | Beginner | 75 |
| 3 | Create and Configure an S3 Bucket | Intermediate | 100 |

#### I-1.8 — Terraform module challenges (target: 3 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Write Your First Terraform Configuration | Beginner | 75 |
| 2 | Use Variables and Outputs | Intermediate | 100 |
| 3 | Store State Remotely in S3 | Intermediate | 100 |

#### I-1.9 — Kubernetes module challenges (target: 3 total)

| # | Title | Difficulty | XP |
|---|-------|------------|-----|
| 1 | Deploy Your First Pod | Beginner | 75 |
| 2 | Create a Deployment and Scale It | Intermediate | 100 |
| 3 | Expose a Deployment with a Service | Intermediate | 100 |

#### I-1.10 — Documentation expansion (target: 3 topics per module, 21 total)

For each module, write and seed two additional documentation topics that complement the existing one. Topics should cover:
- Docker: image layers and caching; container networking fundamentals
- Docker Compose: the Compose file reference; service dependencies and startup order
- GitHub Actions: workflow syntax; understanding runners
- GitLab CI: pipeline stages and jobs; GitLab Runner types
- AWS: IAM fundamentals; VPC and networking basics
- Terraform: state management; providers and resources
- Kubernetes: the control plane; Pods, ReplicaSets, and Deployments

---

### Documentation tasks

**D-1.1** Update `08_DEVOPS_CURRICULUM.md` — mark challenges 4–10 in each module as seeded once they are in the database. Record the final XP value for each challenge.

**D-1.2** Update `00_PROJECT_HANDOFF.md` — update challenge count, documentation topic count, and mark Markdown rendering as implemented.

**D-1.3** Update `03_ENGINEERING_GUIDE.md` — add the `pnpm --filter @workspace/scripts run seed` command to the key commands section.

**D-1.4** Update `07_DEVELOPMENT_WORKFLOW.md` — add a "Seeding content" section explaining when and how to run the seed script, and what to do when adding new challenges (add to seed.ts, run seed).

**D-1.5** Update `06_FOLDER_STRUCTURE.md` — add `scripts/src/seed.ts` to the annotated file tree.

---

### Prerequisites

- Sprint 0 complete and live in production
- All API routes verified working (`GET /api/challenges`, `GET /api/challenges/:id`, `GET /api/docs/topics`, etc.)
- `pnpm run typecheck` passes cleanly

---

### Acceptance criteria

- [ ] Running `pnpm --filter @workspace/scripts run seed` from a clean database produces all modules, challenges, hints, and documentation topics with no errors
- [ ] Running the seed script twice produces the same state as running it once
- [ ] The challenges page shows at least 35 challenges across all modules
- [ ] Every module has at least 3 challenges
- [ ] The Docker module has all 10 planned challenges
- [ ] Every challenge has at least 2 hints
- [ ] Challenge content renders with correct Markdown formatting: headings are bold and larger, code blocks are monospace and visually distinct, bullet lists are indented
- [ ] Documentation topics render with the same Markdown formatting
- [ ] Every module has at least 3 documentation topics
- [ ] `pnpm run typecheck` passes with no errors
- [ ] The production deployment is live and the seed script has been run against production

---

### Deliverables

1. `scripts/src/seed.ts` — formal seed script
2. `artifacts/devops-forge/src/components/MarkdownRenderer.tsx` — Markdown rendering component
3. 35+ challenge rows in the database with full content and hints (in Markdown format)
4. 21+ documentation topic rows in the database (in Markdown format)
5. Updated docs: 00, 03, 06, 07, 08

---

### Exit criteria

Before Sprint 2 begins:

1. A real person (the author, or a willing tester) has completed at least 5 Docker challenges end to end without needing to leave the platform for help
2. The seed script runs cleanly against the production database
3. `pnpm run typecheck` passes
4. The handoff document (`00_PROJECT_HANDOFF.md`) accurately reflects the end-of-sprint state

---

## Sprint 2 — Progression System

**Status:** Not started  
**Estimated effort:** 2 weeks  
**Complexity:** Medium  
**Depends on:** Sprint 1 complete

### Objective

Make progression real. Replace the hardcoded module unlock flags with a dynamic system that responds to what the learner has actually accomplished. Add streak tracking, milestone badges, and an improved dashboard that surfaces progress meaningfully.

By the end of this sprint, the XP and level system is genuinely motivating: a learner who completes Docker challenges sees GitHub Actions become available, knows how far they are from the next unlock, and can build a streak.

---

### User stories

**US-2.1** As a learner, I can see which modules are locked and exactly what I need to do to unlock them, so that I always have a clear next step.

**US-2.2** As a learner, when I complete enough challenges in one module, the next module unlocks automatically without me having to do anything special.

**US-2.3** As a learner, I can see a progress indicator on locked module cards showing how close I am to the unlock threshold, so that I know how much effort remains.

**US-2.4** As a learner, I can see my current streak of consecutive days on the dashboard, so that I am motivated to return daily.

**US-2.5** As a learner, I earn a badge when I complete all challenges in a module, so that finishing a module feels like a meaningful accomplishment.

**US-2.6** As a learner, I see a notification when I level up, so that XP milestones feel rewarding.

**US-2.7** As a learner, when the activity feed is empty because I have not completed any challenges yet, I see an encouraging message rather than a blank area.

---

### Implementation tasks

#### I-2.1 — Dynamic module unlock logic

Define unlock rules for each module. Recommended rules based on curriculum design:

| Module | Unlock condition |
|--------|-----------------|
| Docker | Always unlocked |
| Docker Compose | Always unlocked |
| GitHub Actions | Complete 5 Docker challenges (≥ 300 XP) |
| GitLab CI | Complete GitHub Actions challenge 1 (≥ 400 XP) |
| AWS | Complete 3 GitHub Actions challenges (≥ 600 XP) |
| Terraform | Complete AWS challenge 1 (≥ 750 XP) |
| Kubernetes | Complete Docker Compose challenge 3 + Terraform challenge 1 (≥ 1000 XP) |

Implementation steps:
- Remove the static `is_unlocked` boolean from the `modules` table seed data (or keep it as a base value and override with computed logic)
- Add an `unlock_xp_threshold` integer column to the `modules` table (nullable; null = always unlocked)
- Add an `unlock_prerequisite_challenge_ids` integer array column (nullable; null = XP-only gate)
- In the `GET /api/modules` handler, compute `isUnlocked` dynamically:
  1. If both threshold fields are null, the module is always unlocked
  2. Otherwise, join with progress to check completed XP sum and prerequisite challenge completions
- Update the OpenAPI spec and run codegen after changing the response shape
- The frontend `isUnlocked` field on module cards is already consumed; no frontend data model changes needed

#### I-2.2 — Unlock progress indicator on module cards

- Add two new fields to the modules API response: `xpTowardUnlock` and `xpRequired`
- On the module detail page and module card for locked modules, show a progress bar with text: "350 / 600 XP — Complete 3 more GitHub Actions challenges to unlock AWS"
- The bar should be muted/greyed to distinguish it from the learner's level bar on the dashboard

#### I-2.3 — Streak tracking

- Implement the streak calculation in `artifacts/api-server/src/routes/progress.ts`
- Query distinct `DATE(completed_at)` values from the progress table, ordered descending
- Walk backward from today: if yesterday has a completion, increment; stop at the first gap
- A streak of 0 means no completions today or yesterday; a streak of 1 means at least one today
- Remove the hardcoded `streakDays: 1` from the progress summary response
- Handle timezone: use UTC dates consistently; document this decision

#### I-2.4 — Milestone badges

Define the initial badge set:

| Badge | Trigger |
|-------|---------|
| First Step | Complete the first challenge |
| Docker Graduate | Complete all Docker challenges |
| Compose Conductor | Complete all Docker Compose challenges |
| Pipeline Pioneer | Complete all GitHub Actions challenges |
| Week Streak | Maintain a 7-day streak |
| Level Up: Explorer | Reach Explorer level (200 XP) |
| Level Up: Practitioner | Reach Practitioner level (500 XP) |
| Level Up: Engineer | Reach Engineer level (1000 XP) |

Create a `badges` table:
```
badges
  id            serial PRIMARY KEY
  slug          text NOT NULL UNIQUE
  name          text NOT NULL
  description   text NOT NULL
  earned_at     timestamp
```

Compute earned badges in the `GET /api/progress/summary` response. Initially, compute them on the fly from progress data (same as XP). Add `badges` array to the OpenAPI spec and run codegen.

Display earned badges on the dashboard below the level bar. Each badge shows its name. Unearned badges are not displayed (not locked/greyed — simply absent until earned).

#### I-2.5 — Level-up notification

- Track the learner's level in localStorage (client-side)
- When the progress summary is fetched and the returned level is higher than the stored value, display a toast notification: "You reached [Level Name]"
- Update localStorage after showing the notification
- The toast uses the existing UI style (no emojis, monospace accent)
- This is client-side only; no server changes required

#### I-2.6 — Empty state for activity feed

- When `GET /api/progress/activity` returns an empty array, display an encouraging message in the activity feed section: "No activity yet. Complete your first challenge to get started."
- Style the empty state consistently with other empty states in the UI

---

### Documentation tasks

**D-2.1** Update `05_DATABASE_DESIGN.md` — add the `unlock_xp_threshold` and `unlock_prerequisite_challenge_ids` columns to the modules table definition. Add the `badges` table schema.

**D-2.2** Update `11_SCORING_ENGINE.md` — replace the "v1: hardcoded to 1" section under streak tracking with the implemented algorithm. Document the UTC timezone decision.

**D-2.3** Update `00_PROJECT_HANDOFF.md` — mark streak, dynamic unlock, badges, and level-up notification as implemented.

**D-2.4** Add an ADR to `22_HISTORY_OF_DECISIONS.md` — document the unlock rule design: XP threshold combined with prerequisite challenge IDs. Record the specific thresholds chosen and the reasoning.

---

### Prerequisites

- Sprint 1 complete: at least 35 challenges seeded across all modules
- The formal seed script (`scripts/src/seed.ts`) exists and works
- The modules table is fully seeded with all 7 modules
- `pnpm run typecheck` passes

---

### Acceptance criteria

- [ ] Completing enough Docker challenges causes GitHub Actions to transition from locked to unlocked without a page refresh
- [ ] Locked module cards show a progress bar and a specific unlock requirement message
- [ ] The dashboard streak shows 1 after completing a challenge today, 2 after completing challenges on two consecutive days
- [ ] The streak resets to 0 if a full calendar day passes with no completions
- [ ] Completing all challenges in the Docker module awards the "Docker Graduate" badge
- [ ] The badge appears on the dashboard after earning it without a page refresh
- [ ] Reaching Explorer level (200 XP) shows a level-up toast notification exactly once
- [ ] The activity feed shows an empty state message when no challenges have been completed
- [ ] The `modules` table has `unlock_xp_threshold` and `unlock_prerequisite_challenge_ids` columns
- [ ] The `badges` table exists in the schema
- [ ] `pnpm run typecheck` passes
- [ ] The seed script is updated to include badge seed data and the new module columns

---

### Deliverables

1. Updated `modules` schema with unlock threshold columns
2. `badges` table in schema
3. Dynamic unlock logic in `artifacts/api-server/src/routes/modules.ts`
4. Streak calculation in `artifacts/api-server/src/routes/progress.ts`
5. Badge computation in the progress summary endpoint
6. Unlock progress indicator on module cards
7. Level-up toast notification component
8. Activity feed empty state
9. Updated OpenAPI spec and regenerated client code
10. Updated docs: 00, 05, 11, 22

---

### Exit criteria

Before Sprint 3 begins:

1. A complete walkthrough from 0 XP to 300 XP has been verified: Docker challenges 1–5 completed, GitHub Actions unlocked, dashboard shows correct XP and level
2. Streak shows correctly after two consecutive days of completions
3. At least one badge has been earned and is visible on the dashboard
4. `pnpm run typecheck` passes
5. Production deployment is live with all schema changes applied

---

## Sprint 3 — Authentication and Multi-user

**Status:** Not started  
**Estimated effort:** 3 weeks  
**Complexity:** High  
**Depends on:** Sprint 2 complete

### Objective

Allow multiple learners to use the platform simultaneously with fully separate progress records. Each learner logs in, has their own XP, their own completions, and their own streak. The platform operator has an admin role to manage content.

This sprint is the gate before the platform can be safely shared with anyone other than the author.

---

### User stories

**US-3.1** As a learner, I can sign in with my Replit account so that my progress is tied to my identity and persists across devices.

**US-3.2** As a learner, my progress, XP, and badges are mine alone — completing a challenge does not affect anyone else's progress.

**US-3.3** As a returning learner, my progress is still there when I log back in after days or weeks away.

**US-3.4** As a learner, I can log out and my progress is saved.

**US-3.5** As an administrator, I can create, edit, and delete challenges, hints, and documentation topics through a web interface so that I do not need to write SQL to manage content.

**US-3.6** As a learner who has not signed in, I can browse the module list and read about the curriculum, but I cannot mark challenges as complete or see progress.

---

### Implementation tasks

#### I-3.1 — Authentication provider integration

Use Replit Auth (OIDC with PKCE). Follow the `replit-auth` skill for the full integration steps.

Key steps:
- Install `openid-client` and `express-session` on the API server
- Add auth routes: `GET /api/auth/login`, `GET /api/auth/callback`, `POST /api/auth/logout`, `GET /api/auth/me`
- Implement `requireAuth` middleware that validates the session and sets `req.user = { id, role }`
- Store session in the database using `connect-pg-simple` (reuse the existing Postgres connection)

#### I-3.2 — Database schema: users table

```sql
CREATE TABLE users (
  id           serial PRIMARY KEY,
  provider_id  text NOT NULL UNIQUE,
  display_name text,
  email        text,
  role         text NOT NULL DEFAULT 'learner',
  created_at   timestamp NOT NULL DEFAULT NOW()
);
```

Add `user_id integer NOT NULL REFERENCES users(id)` to the `progress` table.
Change the progress unique constraint from `UNIQUE (challenge_id)` to `UNIQUE (challenge_id, user_id)`.

Run `pnpm --filter @workspace/db run push` after schema changes.

#### I-3.3 — Scope all progress endpoints to the authenticated user

- `POST /api/challenges/:id/complete` — use `req.user.id` as the `user_id` in the progress insert
- `GET /api/progress/summary` — filter progress by `user_id = req.user.id`
- `GET /api/progress/activity` — filter activity by `user_id = req.user.id`
- `GET /api/challenges` and `GET /api/modules` — the `isCompleted` join must filter by `user_id`
- All progress endpoints require `requireAuth` middleware

#### I-3.4 — Frontend authentication flow

- Add a `useAuth` hook that fetches `GET /api/auth/me` and returns the current user or `null`
- Wrap the app in an `AuthProvider` that supplies the user context
- Add a login page at `/login` with a "Sign in with Replit" button
- Redirect unauthenticated users who attempt to access `/challenges/:id/complete` to `/login`
- Display the learner's display name in the sidebar (replacing the static "Learner" label)
- Add a "Sign out" option to the sidebar

#### I-3.5 — Admin role and basic content management UI

The admin UI is a protected section of the existing frontend, not a separate application.

Routes:
- `/admin` — admin dashboard (list challenges with edit/delete buttons, list doc topics)
- `/admin/challenges/new` — form to create a new challenge
- `/admin/challenges/:id/edit` — form to edit an existing challenge and its hints
- `/admin/docs/new` — form to create a new documentation topic
- `/admin/docs/:id/edit` — form to edit an existing documentation topic

API routes (all require `requireAdmin` middleware):
- `POST /api/admin/challenges` — create challenge
- `PUT /api/admin/challenges/:id` — update challenge
- `DELETE /api/admin/challenges/:id` — delete challenge
- `POST /api/admin/challenges/:id/hints` — add hint
- `PUT /api/admin/hints/:id` — update hint
- `DELETE /api/admin/hints/:id` — delete hint
- `POST /api/admin/docs` — create doc topic
- `PUT /api/admin/docs/:id` — update doc topic
- `DELETE /api/admin/docs/:id` — delete doc topic

The admin role is assigned manually: set `role = 'admin'` in the `users` table for the platform operator's user row.

#### I-3.6 — Migrate existing progress data

When the `user_id` column is added and existing progress rows lack a `user_id`, those rows must be handled. Recommended approach: create an admin user row for the platform author in the users table and assign all existing progress to that user ID. Document this migration step.

---

### Documentation tasks

**D-3.1** Update `05_DATABASE_DESIGN.md` — add the `users` table schema. Document the updated `progress` table (with `user_id`). Record the unique constraint change.

**D-3.2** Update `13_USER_ROLES.md` — replace "Planned roles (v2+)" with "Implemented roles." Document the Replit Auth choice and the admin role assignment process.

**D-3.3** Update `14_SECURITY.md` — document the implemented auth token validation, session storage approach, and rate limiting plan.

**D-3.4** Add an ADR to `22_HISTORY_OF_DECISIONS.md` — document the choice of Replit Auth over Clerk, the session storage approach, and the admin UI architecture decision.

**D-3.5** Update `00_PROJECT_HANDOFF.md` — mark authentication, per-user progress, and admin UI as implemented.

**D-3.6** Update `03_ENGINEERING_GUIDE.md` — add the role-assignment procedure for creating an admin user.

---

### Prerequisites

- Sprint 2 complete: dynamic unlock, streak, badges all working
- The platform has enough content to be worth sharing (35+ challenges)
- `SESSION_SECRET` environment variable is confirmed set in Replit secrets for both development and production
- A decision has been made on whether to migrate existing progress data or discard it

---

### Acceptance criteria

- [ ] A new user can sign in with Replit Auth, complete a challenge, sign out, and sign in again to see their progress preserved
- [ ] Two different users can use the platform simultaneously and their progress is fully independent
- [ ] An unauthenticated visitor cannot mark challenges as complete (receives 401 from API)
- [ ] The sidebar displays the logged-in user's display name
- [ ] The admin user can create a new challenge via the admin UI, and it immediately appears on the challenges page
- [ ] The admin user can edit an existing challenge's content via the admin UI
- [ ] The admin user can add a hint to an existing challenge via the admin UI
- [ ] Non-admin users receive 403 when attempting to access `/api/admin/*` routes
- [ ] Sessions persist across browser refreshes
- [ ] The `users` table exists with the correct schema
- [ ] The `progress` table has `user_id` with the correct foreign key
- [ ] `pnpm run typecheck` passes

---

### Deliverables

1. Replit Auth integration (login, callback, logout, session middleware)
2. `users` table in schema
3. Updated `progress` table schema (`user_id` column, updated unique constraint)
4. `requireAuth` and `requireAdmin` middleware
5. All progress API endpoints scoped to the authenticated user
6. Login page and sign-out UI
7. `useAuth` hook and `AuthProvider`
8. Admin section: dashboard, challenge form, doc topic form
9. Admin API routes for CRUD on challenges, hints, and doc topics
10. Updated OpenAPI spec and regenerated client code
11. Updated docs: 00, 03, 05, 13, 14, 22

---

### Exit criteria

Before Sprint 4 begins:

1. The platform has been shared with at least one person who is not the author, and they were able to sign in, complete challenges, and have independent progress
2. The admin UI has been used to create at least one challenge without touching SQL
3. No progress from user A is visible to user B
4. `pnpm run typecheck` passes
5. Production deployment is live with schema changes and auth enabled

---

## Sprint 4 — AI Mentor

**Status:** Not started  
**Estimated effort:** 3 weeks  
**Complexity:** High  
**Depends on:** Sprint 3 complete

### Objective

Add the AI mentor: a conversational panel on the challenge detail page that answers questions in natural language, is aware of the current challenge and what the learner has already completed, and guides rather than gives away answers.

The mentor is the feature that distinguishes DevOps Forge from a static tutorial. When it works well, a learner who is stuck can get unstuck without leaving the platform.

---

### User stories

**US-4.1** As a learner who is stuck on a challenge, I can type a question about what I am struggling with and receive a helpful, specific response that guides me without giving me the answer.

**US-4.2** As a learner, the mentor's response feels relevant to the challenge I am currently on — it does not give generic advice that could apply to any problem.

**US-4.3** As a learner, I can ask the mentor to explain a concept I read in the documentation, and it explains it in terms of what I already know.

**US-4.4** As a learner, if I ask the mentor to just give me the answer, it explains why it will not do that and redirects me toward a more useful question.

**US-4.5** As a learner, I can see the mentor's response appear progressively as it is generated, rather than waiting for the full response before seeing anything.

**US-4.6** As a learner, my conversation with the mentor within a session is preserved as I scroll through it, so I do not lose context.

---

### Implementation tasks

#### I-4.1 — Context assembly endpoint

Add a new route `POST /api/mentor/ask` to the API server.

Request body:
```json
{
  "question": "string",
  "challengeId": "number | null",
  "docTopicId": "number | null"
}
```

The handler:
1. Validates the request body with Zod
2. Fetches the challenge or doc topic by ID (if provided)
3. Fetches the authenticated user's completed challenge IDs from the progress table
4. Assembles a context object: challenge content, hint list, completed challenge titles, module name
5. Calls the LLM with the assembled context and the learner's question
6. Streams the response back to the client

Add the endpoint to `openapi.yaml` and run codegen.

#### I-4.2 — LLM integration via Replit AI proxy

Follow the `ai-integrations-anthropic` or `ai-integrations-gemini` skill (choose based on available Replit integration). Use the streaming API.

Implement a `callMentor(context, question)` function in `artifacts/api-server/src/mentor/llm.ts`:
- Constructs the system prompt from the mentor persona (see `09_AI_MENTOR_DESIGN.md`)
- Constructs the user message from the context object
- Calls the LLM API with streaming enabled
- Returns a readable stream that the route handler pipes to the HTTP response

The model should be configurable via an environment variable (`MENTOR_MODEL`). Default: Claude 3.5 Haiku or Gemini Flash (fast, low cost, good instruction-following).

#### I-4.3 — Streaming response from API to frontend

The `POST /api/mentor/ask` route uses `Transfer-Encoding: chunked` to stream the LLM response. The frontend uses the Fetch API `ReadableStream` to consume it.

Do not use SSE (Server-Sent Events) or WebSockets — chunked HTTP is sufficient and simpler for this use case.

#### I-4.4 — System prompt implementing the mentor persona

The system prompt is stored in `artifacts/api-server/src/mentor/persona.ts` as a function that accepts the context object and returns the full prompt string.

The prompt must include (per `09_AI_MENTOR_DESIGN.md`):
- Identity and tone instructions
- The current challenge title, module, and content
- The list of challenges the learner has completed (titles only, not full content)
- The stored hints for the current challenge
- An explicit instruction: never paste a complete working solution; guide instead
- An explicit instruction: if asked for the answer directly, decline and redirect

#### I-4.5 — Rate limiting on the mentor endpoint

Install `express-rate-limit` on the API server.

Apply a rate limiter to `POST /api/mentor/ask`:
- 20 requests per minute per authenticated user
- When the limit is exceeded, return 429 with `{ "error": "Too many requests. Please wait a moment before asking again." }`

Apply a broader rate limiter to all API routes:
- 300 requests per minute per IP
- Returns 429 on breach

#### I-4.6 — Mentor panel UI on the challenge detail page

Add a collapsible mentor panel to the challenge detail page (`ChallengeDetail.tsx`).

Panel structure:
- A header bar with the label "Ask your mentor" and a collapse/expand toggle
- A scrollable conversation area showing the session's message history
- A text input with a submit button (also submits on Enter)
- The mentor's response streams in character by character as it arrives

State management:
- Conversation history is stored in component state (`useState`)
- History is session-local: it resets when the user navigates away
- The input is disabled while a response is streaming

Design: the panel sits below the challenge content and hints on the challenge detail page. It does not replace or obscure the challenge content. On smaller viewports it collapses by default.

---

### Documentation tasks

**D-4.1** Update `09_AI_MENTOR_DESIGN.md` — replace "Implementation plan" with "Implementation record." Note which LLM was chosen, why, and any prompt engineering decisions made during implementation.

**D-4.2** Update `04_SYSTEM_ARCHITECTURE.md` — add the mentor endpoint and LLM integration to the architecture diagram.

**D-4.3** Update `14_SECURITY.md` — document what is sent to the LLM (challenge content, completion history, the learner's question), what is never sent, and how LLM request logs are handled.

**D-4.4** Add an ADR to `22_HISTORY_OF_DECISIONS.md` — document the LLM model choice, the streaming approach (chunked HTTP vs SSE), and the rate limiting design.

**D-4.5** Update `00_PROJECT_HANDOFF.md` — mark the AI mentor as implemented.

---

### Prerequisites

- Sprint 3 complete: authentication is working; the `req.user.id` is available in all route handlers
- A Replit AI integration (Anthropic or Gemini) is connected in the Replit integrations panel
- `MENTOR_MODEL` environment variable is set in Replit secrets
- The mentor persona has been reviewed and approved before code is written (avoids prompt engineering rework)

---

### Acceptance criteria

- [ ] A learner on the challenge detail page can type a question and receive a streamed response within 5 seconds of submitting
- [ ] The mentor's response references the specific challenge the learner is on (not generic advice)
- [ ] When asked "just give me the answer," the mentor declines and redirects
- [ ] The conversation history is preserved within a session as the learner scrolls
- [ ] A learner who submits 21 questions in one minute receives a clear rate limit message on the 21st
- [ ] The mentor panel collapses and expands cleanly
- [ ] No PII or user ID is included in the LLM request (only completion history and challenge content)
- [ ] `pnpm run typecheck` passes
- [ ] The mentor endpoint is in `openapi.yaml` and codegen has been run

---

### Deliverables

1. `POST /api/mentor/ask` route with context assembly and LLM streaming
2. `artifacts/api-server/src/mentor/llm.ts` — LLM integration module
3. `artifacts/api-server/src/mentor/persona.ts` — system prompt builder
4. Rate limiting middleware (mentor endpoint + global)
5. `MentorPanel` component in the frontend
6. Updated OpenAPI spec and regenerated client code
7. Updated docs: 00, 04, 09, 14, 22

---

### Exit criteria

Before Sprint 5 begins:

1. Five sample mentor conversations have been manually reviewed and confirmed to: give useful guidance, never paste a full solution, and respond in the mentor's voice
2. The rate limiter has been tested: 21 requests in a minute returns 429
3. A learner who was blocked on a challenge used the mentor to get unstuck without receiving the answer
4. `pnpm run typecheck` passes
5. Production deployment is live with the mentor feature enabled

---

## Sprint 5 — Testing and CI/CD

**Status:** Not started  
**Estimated effort:** 2 weeks  
**Complexity:** Medium  
**Depends on:** Sprint 4 complete

### Objective

Stop relying on manual testing and the TypeScript compiler as the only quality gates. Add an automated test suite that covers all API endpoints and a CI pipeline that prevents broken code from reaching production. Make the platform dogfood the practices it teaches.

---

### User stories

**US-5.1** As a contributor, when I push code to the repository, I receive automated confirmation within 5 minutes that the TypeScript compiles, the linter passes, and all tests pass.

**US-5.2** As a contributor, I cannot merge code to the main branch if the CI checks are failing.

**US-5.3** As a contributor, when I introduce a bug in an API route, a failing test tells me exactly which endpoint and which case is broken.

**US-5.4** As the platform operator, I can verify that any code running in production passed the full CI suite before it was deployed.

---

### Implementation tasks

#### I-5.1 — ESLint configuration

- Create a root `.eslintrc.json` that extends `eslint:recommended` and `@typescript-eslint/recommended`
- Key rules: `no-console: error` for server code, `@typescript-eslint/no-explicit-any: error`, `@typescript-eslint/no-unused-vars: error`
- Add `"lint": "eslint . --ext .ts,.tsx"` to the root `package.json`
- Fix all existing lint errors before enabling CI enforcement

#### I-5.2 — Prettier configuration

- Create a root `.prettierrc` with: 2-space indent, single quotes, trailing commas, 100-character line width
- Add `"format:check": "prettier --check ."` to root `package.json`
- Run `prettier --write .` to format the entire codebase
- Commit the formatted codebase as a single chore commit before the CI check is added

#### I-5.3 — Vitest unit tests

Install Vitest in `artifacts/api-server`.

Write unit tests for pure functions:

`progress.test.ts`:
- `xpToLevel(0)` → `{ level: 1, levelName: "Apprentice", currentLevelXp: 0, nextLevelXp: 200 }`
- `xpToLevel(200)` → level 2, Explorer
- `xpToLevel(199)` → still level 1
- `xpToLevel(5500)` → level 7, Master
- `xpToLevel(9999)` → still level 7 (cap), `nextLevelXp === currentLevelXp`
- Progress bar calculation at 0%, 50%, 100%, and above max level

`streak.test.ts`:
- Empty completions → streak 0
- One completion today → streak 1
- Completions on two consecutive days → streak 2
- Gap yesterday → streak is only today's count

#### I-5.4 — Vitest integration tests

Integration tests make real HTTP requests against the Express server using a test PostgreSQL database.

Test database setup:
- Add a `TEST_DATABASE_URL` environment variable pointing to a separate test database
- In the test setup file (`src/__tests__/setup.ts`), run schema push and seed known test data before the suite
- Tear down (truncate tables) after each test to prevent state bleed

Coverage targets per `18_TESTING_STRATEGY.md`:

| Endpoint | Test cases |
|----------|-----------|
| `GET /api/healthz` | Returns 200 with `{ status: "ok" }` |
| `GET /api/modules` | Returns all 7 modules; each has `challengeCount`; locked modules have `isUnlocked: false` |
| `GET /api/modules/:id` | Returns module with challenges; 404 for non-existent ID |
| `GET /api/challenges` | Returns all; filters by `moduleId`; filters by `difficulty`; `isCompleted` is false before completion |
| `GET /api/challenges/:id` | Returns full content and hints array; 404 for non-existent ID |
| `POST /api/challenges/:id/complete` | Marks complete; `isCompleted` becomes true on subsequent fetch; XP increases; idempotent on re-call; 401 without auth |
| `GET /api/progress/summary` | Zero XP at start; correct XP after completions; correct level computation |
| `GET /api/progress/activity` | Returns completions in reverse chronological order; empty array before any completions |
| `GET /api/docs/topics` | Returns all; filters by `moduleId` |
| `GET /api/docs/topics/:id` | Returns content; 404 for non-existent |
| `POST /api/mentor/ask` | Returns a streamed response; 401 without auth; 429 after rate limit |

#### I-5.5 — GitHub Actions CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest

    services:
      db:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: devops_forge_test
          POSTGRES_USER: forge
          POSTGRES_PASSWORD: testpassword
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5

    env:
      TEST_DATABASE_URL: postgresql://forge:testpassword@localhost:5432/devops_forge_test
      SESSION_SECRET: ci-test-secret-not-used-in-production

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @workspace/api-spec run codegen
      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm run format:check
      - run: pnpm --filter @workspace/db run push
        env:
          DATABASE_URL: ${{ env.TEST_DATABASE_URL }}
      - run: pnpm run test
```

#### I-5.6 — Staging environment

- Create a second Replit deployment (or a separate Replit project named "devops-forge-staging")
- The staging deployment has its own `DATABASE_URL` pointing to a separate database
- Staging is deployed manually after each sprint, before production deployment
- Document the staging URL and the deployment procedure in `19_DEPLOYMENT_STRATEGY.md`

---

### Documentation tasks

**D-5.1** Update `15_CI_CD.md` — replace "Planned pipeline design" with "Implemented pipeline." Record the actual GitHub Actions workflow file path and the decisions made (e.g., Postgres service container configuration).

**D-5.2** Update `18_TESTING_STRATEGY.md` — mark unit tests and integration tests as implemented (v1.1). Record which test files exist and what they cover.

**D-5.3** Update `19_DEPLOYMENT_STRATEGY.md` — add the staging environment URL and the staging deployment procedure.

**D-5.4** Update `00_PROJECT_HANDOFF.md` — mark CI/CD pipeline, test suite, ESLint, Prettier, and staging environment as implemented.

---

### Prerequisites

- Sprint 4 complete
- The project is connected to a GitHub repository (not just Replit checkpoints)
- The GitHub repository has branch protection on `main` enabled
- A `TEST_DATABASE_URL` environment variable is provisioned in Replit secrets and GitHub repository secrets

---

### Acceptance criteria

- [ ] Pushing to any branch triggers the CI workflow and completes within 10 minutes
- [ ] A commit that breaks a TypeScript type causes the CI workflow to fail at the typecheck step
- [ ] A commit that violates an ESLint rule causes the CI workflow to fail at the lint step
- [ ] A commit that introduces an unformatted file causes the CI workflow to fail at the format check step
- [ ] A commit that breaks an API integration test causes the CI workflow to fail at the test step
- [ ] All unit tests for `xpToLevel` pass and cover all level boundaries
- [ ] All integration tests for all API endpoints pass
- [ ] The staging environment is live and accessible
- [ ] The staging environment has been verified by completing a challenge end-to-end

---

### Deliverables

1. `.eslintrc.json` at the repository root
2. `.prettierrc` at the repository root
3. `artifacts/api-server/src/__tests__/` — unit and integration test files
4. `artifacts/api-server/src/__tests__/setup.ts` — test database setup
5. `.github/workflows/ci.yml`
6. Staging Replit deployment
7. Updated docs: 00, 15, 18, 19

---

### Exit criteria

Before Sprint 6 begins:

1. The CI workflow has run successfully at least 3 times on merged PRs
2. The CI workflow has caught and blocked at least one real bug before it reached production
3. All integration tests pass on the CI database
4. The staging environment has been used to validate a production deployment
5. `pnpm run typecheck && pnpm run lint && pnpm run test` all pass locally

---

## Sprint 6 — Polish and Public Beta

**Status:** Not started  
**Estimated effort:** 3–4 weeks  
**Complexity:** Medium  
**Depends on:** Sprint 5 complete

### Objective

Close the remaining gaps in the learning experience and prepare the platform for a broader audience. The platform goes from "functional" to "finished." Content reaches the volume required for a complete learning journey. The UI has no rough edges. The platform can be publicly announced.

---

### User stories

**US-6.1** As a learner on a laptop or desktop, every page looks intentional — no broken layouts, no unstyled elements, no overlapping text.

**US-6.2** As a learner on a phone or tablet, I can navigate the platform and read challenge content comfortably.

**US-6.3** As a learner who prefers keyboard navigation, I can use the platform entirely without a mouse.

**US-6.4** As a learner, when the application encounters an error, I see a clear, helpful message instead of a blank page or a browser error.

**US-6.5** As a learner, I can complete the full Docker curriculum (all 10 challenges) and the Docker Compose curriculum (all 6 challenges) from beginner to advanced without gaps.

**US-6.6** As a learner, every module has enough challenges and documentation topics to form a meaningful self-contained learning sequence.

**US-6.7** As a learner, I can navigate to the platform's public URL and begin learning without being invited.

---

### Implementation tasks

#### I-6.1 — Content completion audit

Before UI work begins, audit the current challenge and documentation counts. For any module below the target:

| Module | Challenge target | Doc topic target |
|--------|-----------------|-----------------|
| Docker | 10 | 5 |
| Docker Compose | 6 | 5 |
| GitHub Actions | 7 | 5 |
| GitLab CI | 5 | 4 |
| AWS | 8 | 5 |
| Terraform | 6 | 5 |
| Kubernetes | 10 | 5 |

Write and seed all missing challenges. Run the seed script. Verify all targets are met before proceeding to UI tasks.

#### I-6.2 — Mobile-responsive layout

- Audit every page on a 390px-wide viewport (iPhone 14 equivalent)
- The sidebar must collapse to a hamburger menu on mobile; content takes full width
- Module cards and challenge cards must wrap correctly on small screens
- The challenge detail page must be readable on mobile (code blocks must not cause horizontal scroll)
- The mentor panel must stack below the challenge content on mobile rather than beside it
- Test on Chrome DevTools device emulation at 390px, 768px, and 1280px widths

#### I-6.3 — Keyboard navigation

- All interactive elements (links, buttons, inputs, accordions) must be reachable and operable via keyboard (Tab, Enter, Space, Escape)
- Focus indicators must be visible — do not use `outline: none` without an alternative focus style
- The sidebar navigation must be keyboard-traversable
- The hint accordion must be expandable via keyboard
- The mentor panel input must be focusable and submittable via Enter

#### I-6.4 — React error boundaries

- Create an `ErrorBoundary` component that catches unhandled React rendering errors
- Wrap the entire app in `ErrorBoundary`
- When an error is caught, display: a clear message ("Something went wrong"), a button to reload the page, and (in development only) the error stack trace
- Wrap individual page components in their own `ErrorBoundary` so a single page error does not crash the whole app
- Log caught errors to the server via a `POST /api/errors` endpoint (best-effort, not blocking)

#### I-6.5 — Loading skeleton improvements

- Audit all loading states across the app
- Replace any `null` or blank renders during loading with skeleton components that match the shape of the loaded content
- Minimum: Dashboard, Modules list, Module detail, Challenge detail, Documentation list

#### I-6.6 — "Continue where you left off" on the dashboard

- Query the most recently accessed challenge from the activity feed
- Display a "Continue learning" card on the dashboard: module name, challenge title, a "Resume" link to the challenge detail page
- If no activity exists, show the first unlocked challenge instead with the label "Start here"

#### I-6.7 — Challenge completion animation

- When a learner clicks "Mark as Complete" and the server responds successfully, show a brief completion animation: the button text changes to "Completed", a subtle highlight sweeps across the challenge card, the XP earned is displayed momentarily
- No emojis; use colour and motion only
- Animation completes within 1.5 seconds and does not block navigation

#### I-6.8 — Custom domain (if applicable)

- Configure a custom domain in Replit's deployment settings if one has been acquired
- Update internal documentation with the public URL

#### I-6.9 — Public announcement preparation

- Review all user-facing text for clarity, spelling, and tone consistency
- Verify the homepage (Dashboard) is welcoming to a first-time visitor who has not completed any challenges
- Ensure the "About this platform" information is accessible (can be in a footer link or an onboarding modal)
- Confirm the content on all 7 modules meets the quality standard in `12_HINT_ENGINE.md` and `10_CHALLENGE_ENGINE.md`

---

### Documentation tasks

**D-6.1** Update `08_DEVOPS_CURRICULUM.md` — mark all challenges as seeded. Record final challenge counts and XP totals per module.

**D-6.2** Update `00_PROJECT_HANDOFF.md` — this document is now the public beta release state. Update all counts, mark all Sprint 6 items as implemented, and record the public URL.

**D-6.3** Update `25_FUTURE_ROADMAP.md` — Phase 1 is complete. Update Phase 2 to reflect that auth and AI mentor are already built (from Sprints 3 and 4). Adjust Phase 2 to focus on sandboxed terminals, automated verification, and certificates of completion.

**D-6.4** Update `20_SPRINT_ROADMAP.md` — mark all sprints as complete.

**D-6.5** Update this document (`26_MASTER_ROADMAP.md`) — mark Sprint 6 as complete in the sprint index. Add any future sprints if the scope has expanded.

---

### Prerequisites

- Sprint 5 complete: CI passes, tests green, staging environment live
- Content audit completed: know exactly how many challenges remain to be written before targets are met
- All known bugs from `21_PRODUCT_BACKLOG.md` triaged: P1 bugs fixed, P2+ bugs accepted or deferred

---

### Acceptance criteria

- [ ] All 7 modules meet the challenge count targets in I-6.1
- [ ] All 7 modules meet the documentation topic count targets in I-6.1
- [ ] Every page is usable on a 390px-wide mobile viewport (no horizontal scrollbar, no overlapping elements)
- [ ] Every interactive element is reachable and operable by keyboard
- [ ] An unhandled error in a page component shows the error boundary UI rather than crashing the app
- [ ] All loading states use skeleton components
- [ ] The dashboard shows a "Continue learning" or "Start here" card for every logged-in user
- [ ] Challenge completion triggers the completion animation
- [ ] The CI suite passes on the final commit before public announcement
- [ ] `pnpm run typecheck && pnpm run lint && pnpm run test` all pass locally
- [ ] A complete stranger (not the author, not a tester) has used the platform, completed challenges, and found it usable without guidance

---

### Deliverables

1. Complete challenge library: targets met for all 7 modules
2. Complete documentation library: targets met for all 7 modules
3. Mobile-responsive layouts for all pages
4. Keyboard-navigable UI
5. `ErrorBoundary` component and integration
6. Improved loading skeleton components
7. "Continue learning" dashboard card
8. Challenge completion animation
9. Updated docs: 00, 08, 20, 25, 26

---

### Exit criteria (production-ready gate)

Before the platform is publicly announced:

1. A stranger (not the author) has completed the Docker beginner challenges without needing to ask for help outside the platform
2. The platform is usable on a phone (tested on a real device, not just DevTools emulation)
3. The CI suite passes on the production build
4. The staging deployment has been verified within 24 hours of the production deployment
5. All P1 bugs from `21_PRODUCT_BACKLOG.md` are resolved
6. `00_PROJECT_HANDOFF.md` accurately reflects the production state

---

## Definition of done (applies to every sprint)

A sprint is done when all of the following are true:

1. All acceptance criteria are checked off
2. `pnpm run typecheck` passes with zero errors
3. `pnpm run lint` passes (from Sprint 5 onward)
4. `pnpm run test` passes (from Sprint 5 onward)
5. The production deployment is live and smoke-tested
6. `00_PROJECT_HANDOFF.md` is updated to reflect the new state
7. This document (`26_MASTER_ROADMAP.md`) has the sprint status updated to `Complete`
8. Any documentation tasks listed in the sprint are complete

---

## Dependency graph

```
Sprint 0 (Complete)
    │
Sprint 1 — Content Foundation
(content volume, Markdown, seed script)
    │
Sprint 2 — Progression System
(dynamic unlock, streak, badges)
    │
Sprint 3 — Authentication and Multi-user
(Replit Auth, users table, admin UI)
    │
Sprint 4 — AI Mentor
(LLM integration, mentor panel, streaming)
    │
Sprint 5 — Testing and CI/CD
(Vitest, GitHub Actions, staging)
    │
Sprint 6 — Polish and Public Beta
(mobile, keyboard, content completion, public launch)
```

All sprints are strictly ordered. Parallel work within a sprint is encouraged where tasks do not depend on each other.

---

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Sprint 1 content writing takes longer than estimated | High | Medium | Start with Docker (highest priority) and time-box other modules. Defer lower-priority modules to Sprint 6 content audit. |
| Replit Auth integration is more complex than expected | Medium | High | The `replit-auth` skill provides a complete implementation guide. Budget extra time for session handling edge cases. |
| LLM API latency makes the mentor feel slow | Medium | High | Choose a fast model (Haiku or Flash). Streaming mitigates perceived latency. Set a 30-second timeout and show a user-friendly message if exceeded. |
| CI pipeline fails to connect to test database | Low | Medium | Test the workflow against a branch before enforcing it on main. |
| Markdown rendering breaks existing content | Low | Low | All content is migrated in I-1.2 before going to production. Run the seed script on staging first. |

---

## Change log

All material changes to this document are recorded here.

| Date | Change | Reason |
|------|--------|--------|
| June 2026 | Document created | Initial master roadmap compiled from full review of all 26 handbook documents |
