# 00 — Project Handoff

**Document status:** Complete  
**Last updated:** June 2026  
**Audience:** Anyone picking up this project for the first time — a new developer, a collaborator, or the original author returning after a break.

---

## What is DevOps Forge?

DevOps Forge is a self-hosted, AI-assisted learning platform designed to teach DevOps from scratch to people who have never worked in software infrastructure. It acts as a personal mentor — guiding learners through Docker, Docker Compose, GitHub Actions, GitLab CI, AWS, Terraform, and Kubernetes using structured challenges, curated documentation, and an XP-based progression system.

The platform is built for one specific type of person: someone who wants to break into DevOps but does not know where to start and cannot afford to take a wrong turn. Every design decision — from the language used in challenges to the order in which modules unlock — is made with that person in mind.

---

## Why this project exists

Most DevOps learning resources fall into one of two traps:

1. **Too shallow** — YouTube tutorials that show you commands without explaining why they work, leaving you unable to adapt when something breaks.
2. **Too broad** — certification courses that cover everything but guide you toward nothing practical.

DevOps Forge sits in the middle. It is opinionated about what matters, sequenced so that each concept builds on the last, and written in plain language that assumes no prior knowledge. The goal is not to make someone pass an exam — it is to make someone capable of doing real work.

---

## Project goals

**Primary goal:** Give a complete beginner a clear, structured path from zero to job-ready DevOps practitioner.

**Secondary goals:**

- Build every lesson around hands-on challenges, not passive reading
- Make progress feel rewarding through XP, levels, and visible momentum
- Keep the content easy to update without touching application code (all content lives in the database)
- Provide enough documentation depth that a learner can go deep on any topic they find interesting
- Establish a foundation that can grow into an AI-powered mentor (contextual hints, adaptive challenges, natural language Q&A)

**Non-goals (for v1):**

- Multi-user accounts or social features
- Real-time terminal emulation or sandboxed environments
- Mobile-native experience
- Monetisation

---

## Current state of the product

The platform is live with the following features fully operational:

### Learning modules
Seven modules are defined, each representing a distinct technology area:

| Order | Module | Status |
|-------|--------|--------|
| 1 | Docker | Unlocked — learner can start immediately |
| 2 | Docker Compose | Unlocked — available from day one |
| 3 | GitHub Actions | Locked — unlocks through progression |
| 4 | GitLab CI | Locked |
| 5 | AWS | Locked |
| 6 | Terraform | Locked |
| 7 | Kubernetes | Locked |

Docker and Docker Compose are unlocked by default because containerisation is the logical entry point into modern DevOps. All other modules unlock as the learner progresses.

### Challenges
Ten challenges are seeded across all seven modules. Each challenge contains:
- A clear objective written for a beginner
- Step-by-step content with exact commands
- Two to three progressive hints that guide without giving the answer away
- An XP reward (50–100 XP depending on difficulty)

### XP and level system
Completing challenges earns XP. XP accumulates toward seven levels:

| Level | Name | XP required |
|-------|------|-------------|
| 1 | Apprentice | 0 |
| 2 | Explorer | 200 |
| 3 | Practitioner | 500 |
| 4 | Engineer | 1,000 |
| 5 | Architect | 2,000 |
| 6 | Expert | 3,500 |
| 7 | Master | 5,500 |

### Documentation library
Seven concept documents are written and stored in the database, one per module, covering the foundational theory behind each technology. These are readable independently of challenges.

### Dashboard
The learner's home screen shows their current XP, level, progress bar toward the next level, total challenges completed, streak, and recent activity. Module cards display completion progress and lock state at a glance.

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion, wouter (routing), TanStack Query |
| Backend | Node.js 24, Express 5, TypeScript 5.9 |
| Database | PostgreSQL (Replit-managed), Drizzle ORM |
| API contract | OpenAPI 3.1 spec → Orval codegen (React Query hooks + Zod validators) |
| Monorepo | pnpm workspaces |
| Hosting | Replit (development + production) |

The architecture is contract-first: the OpenAPI spec in `lib/api-spec/openapi.yaml` is the single source of truth for all API shapes. Changing the API means changing the spec first, then running codegen.

---

## Repository structure

```
/
├── artifacts/
│   ├── api-server/        Express API — routes, middleware, build config
│   └── devops-forge/      React frontend — pages, components, layout
├── lib/
│   ├── api-spec/          OpenAPI spec + Orval config
│   ├── api-client-react/  Generated React Query hooks (do not edit manually)
│   ├── api-zod/           Generated Zod validators (do not edit manually)
│   └── db/                Drizzle schema, migrations, DB client
├── docs/                  This handbook
└── scripts/               Utility scripts
```

The generated files under `lib/api-client-react/` and `lib/api-zod/` are produced by running:

```bash
pnpm --filter @workspace/api-spec run codegen
```

Never edit them by hand. They will be overwritten on the next codegen run.

---

## How to run the project locally

**Prerequisites:** Node.js 24, pnpm, a running PostgreSQL database (or use the Replit environment which provides one automatically via `DATABASE_URL`).

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start the API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start the frontend (separate terminal)
pnpm --filter @workspace/devops-forge run dev
```

The frontend proxies through Replit's reverse proxy. In development, both services run behind a shared proxy at `localhost:80`. The API is available at `/api` and the frontend at `/`.

---

## Key architectural decisions

### 1. Contract-first API
The OpenAPI spec was written before any route handlers. This discipline ensures the frontend and backend never diverge silently — the generated types catch mismatches at compile time.

### 2. Content in the database, not in code
Challenge content, hints, and documentation are stored in PostgreSQL rather than hardcoded in the application. This means a non-technical editor can update learning content without a code deployment. It also makes content easier to iterate on, translate, or generate with AI in a future version.

### 3. Single-user model
There is no authentication in v1. All progress is stored globally — one learner, one set of records. This was a deliberate simplification to ship faster and validate the learning experience before building multi-user infrastructure. Authentication will be added in a future sprint.

### 4. Modules unlock sequentially
The unlock system is enforced at the data layer (`is_unlocked` on the modules table). Docker and Docker Compose are seeded as unlocked. Others are unlocked through a progression system that will be implemented as challenge completion milestones are defined.

### 5. No terminal emulation in v1
The platform teaches through reading and guided command execution on the learner's own machine. This avoids the significant infrastructure cost of running sandboxed terminals while still producing real hands-on learning. A sandboxed environment is on the future roadmap.

---

## Roles and ownership

This project was built as a personal learning platform by a single owner who is learning DevOps themselves. There is currently one role:

**Owner / Product Lead / Learner**
- Defines which content to add next
- Decides which features to build
- Is also the primary user of the platform

If contributors join in the future, engineering roles and code review processes will be defined in `03_ENGINEERING_GUIDE.md`.

---

## Current decisions that should not be changed without thought

| Decision | Reason |
|----------|--------|
| All API changes go through the OpenAPI spec first | Prevents frontend/backend drift and keeps generated types accurate |
| Generated files in `lib/api-client-react` and `lib/api-zod` are never edited manually | They are overwritten by codegen |
| Challenge content is stored in the `content` column of the `challenges` table, not in files | Makes it editable without deployment |
| `pnpm --filter @workspace/db run push` is the only way to apply schema changes in development | Drizzle handles migration state; do not run raw SQL DDL unless you know exactly what you are doing |
| No `console.log` in server code | Use `req.log` in route handlers and the `logger` singleton elsewhere — this is enforced by convention |

---

## What to work on next

The following items are the highest priority for the next development sessions, in order:

1. **Expand challenge content** — each module currently has only one to three challenges. A full curriculum needs eight to fifteen per module.
2. **Module unlock logic** — implement automatic unlocking based on XP thresholds or challenge completion milestones.
3. **Authentication** — add Replit Auth or Clerk so multiple learners can have separate progress records.
4. **AI mentor integration** — connect an LLM (via Replit's AI integrations) to provide contextual help inside challenge detail pages.
5. **Progress persistence improvements** — add streak tracking, badges, and milestone notifications.
6. **More documentation topics** — each module currently has one concept doc. A complete library needs five to ten per module.

---

## How this document should be maintained

Update this document whenever a major architectural decision is made, a significant feature ships, or the project changes hands. It is the first thing anyone should read before touching the codebase.

The rest of the handbook (`01_PROJECT_VISION.md` through `25_FUTURE_ROADMAP.md`) covers each topic in depth. This document is the entry point — it should always give an accurate picture of where the project stands today.
