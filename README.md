# DevOps Forge

> A structured, AI-assisted learning platform that acts as a personal mentor for people learning DevOps from scratch.

---

## Table of Contents

1. [Vision](#vision)
2. [Purpose](#purpose)
3. [Target Audience](#target-audience)
4. [Learning Philosophy](#learning-philosophy)
5. [Platform Overview](#platform-overview)
6. [Planned Modules](#planned-modules)
7. [High-Level Architecture](#high-level-architecture)
8. [Repository Structure](#repository-structure)
9. [Documentation Index](#documentation-index)
10. [Development Workflow](#development-workflow)
11. [Coding Principles](#coding-principles)
12. [Roadmap](#roadmap)
13. [Contribution Workflow](#contribution-workflow)
14. [How This README Should Evolve](#how-this-readme-should-evolve)

---

## Vision

DevOps Forge exists to give anyone — regardless of background — a clear, honest, and practical path into DevOps engineering.

The platform is not a course catalogue. It is not a reference manual. It is a mentor: something that knows where you are, knows where you need to go, and gives you the next right thing to do. It speaks plainly. It does not assume prior knowledge. It does not leave you alone with a wall of documentation and hope for the best.

The long-term vision is a platform where a learner can arrive with no knowledge of infrastructure and leave with the practical skills and confidence to contribute to a real engineering team — having built things, broken things, fixed things, and understood why each step matters.

---

## Purpose

Most DevOps learning resources have one of two problems:

- **Too shallow:** tutorials that show commands without explaining the reasoning, leaving learners unable to adapt when something goes wrong.
- **Too broad:** certification prep courses that cover everything in a field without building genuine capability in anything.

DevOps Forge is opinionated. It makes choices about what to teach, in what order, and at what depth. The curriculum is sequenced so that each concept provides the foundation for the next. The content is written in plain language that does not demand a computer science degree to parse.

The purpose is not to help someone pass an exam. The purpose is to help someone become capable of doing real work.

---

## Target Audience

**Primary:** Complete beginners — people who want to work in DevOps or cloud infrastructure but have no prior experience with containers, CI/CD pipelines, cloud platforms, or infrastructure tooling.

**Secondary:** Developers who write application code and want to understand the infrastructure layer their code runs on.

**Not the primary audience:** Experienced DevOps engineers seeking advanced reference material. This platform builds from zero; it does not optimise for speed-running for those who already know the fundamentals.

Every word of content — challenges, hints, documentation, error messages, UI copy — is written with the primary audience in mind. Jargon is introduced slowly, defined clearly, and always anchored to something concrete.

---

## Learning Philosophy

### 1. Doing before reading
Every module leads with a challenge. Learners encounter the technology by using it before they read a full explanation of how it works. This mirrors how experienced engineers actually learn — by attempting something, getting stuck, and then seeking understanding.

### 2. Progressive hints, not answers
Hints guide without giving the answer away. The first hint narrows the search space. The second hint points more directly. Only if a learner is genuinely blocked does the content provide enough to proceed. Struggle is part of learning; the platform does not short-circuit it.

### 3. Concepts follow practice
Documentation pages exist to explain the theory behind what a learner just did in a challenge. Reading a concept doc about Docker layers is more meaningful after you have already built your first image than before.

### 4. Visible progress matters
The XP and level system is not decoration. Seeing that you have moved from Apprentice to Explorer, or that you are 70% through completing a module, provides the psychological momentum that keeps learners engaged over weeks rather than days.

### 5. One path, clearly signed
The platform does not present ten ways to do the same thing and ask the learner to choose. It presents the right way for a beginner, explains it thoroughly, and mentions alternatives only once the foundation is solid.

---

## Platform Overview

DevOps Forge is a web application with five core sections:

| Section | Purpose |
|---------|---------|
| **Dashboard** | Shows overall XP, current level, progress toward the next level, active modules, and recent activity |
| **Modules** | Lists all seven learning tracks with progress, estimated hours, and lock state |
| **Challenges** | Hands-on exercises within each module; filterable by difficulty and module |
| **Documentation** | Concept reference pages grouped by module; readable independently of challenges |
| **Challenge Detail** | Full challenge content with step-by-step instructions, hints, and a completion button |

### XP and Level System

Learners earn XP by completing challenges. XP accumulates across all modules and determines the learner's level.

| Level | Name | XP Required |
|-------|------|-------------|
| 1 | Apprentice | 0 |
| 2 | Explorer | 200 |
| 3 | Practitioner | 500 |
| 4 | Engineer | 1,000 |
| 5 | Architect | 2,000 |
| 6 | Expert | 3,500 |
| 7 | Master | 5,500 |

### Module Unlock System

Modules unlock sequentially as learners progress. Docker and Docker Compose are available immediately. Later modules unlock through XP milestones and challenge completion, enforcing a logical learning order.

---

## Planned Modules

| # | Module | Category | Estimated Hours | Status |
|---|--------|----------|-----------------|--------|
| 1 | Docker | Containers | 8h | Active — challenges seeded |
| 2 | Docker Compose | Containers | 6h | Active — challenges seeded |
| 3 | GitHub Actions | CI/CD | 10h | Defined — challenges to be written |
| 4 | GitLab CI | CI/CD | 8h | Defined — challenges to be written |
| 5 | AWS | Cloud | 16h | Defined — challenges to be written |
| 6 | Terraform | Infrastructure | 12h | Defined — challenges to be written |
| 7 | Kubernetes | Orchestration | 20h | Defined — challenges to be written |

Each module will eventually contain 8–15 challenges spanning beginner, intermediate, and advanced difficulty, plus 5–10 documentation topics covering the theory behind the practice.

---

## High-Level Architecture

```
Browser
  │
  └── React Frontend (Vite)
        │   wouter routing, TanStack Query, Framer Motion
        │   Generated React Query hooks (from OpenAPI)
        │
        └── /api  ──►  Express API Server (Node.js)
                          │   Route handlers validate with Zod
                          │   Generated Zod schemas (from OpenAPI)
                          │
                          └── PostgreSQL (Drizzle ORM)
                                Tables: modules, challenges, progress,
                                        challenge_hints, doc_topics
```

### Contract-first API

The OpenAPI spec at `lib/api-spec/openapi.yaml` is the single source of truth for all API contracts. No route, hook, or type is defined manually — they are generated from the spec using Orval. This means:

- The frontend and backend cannot diverge silently
- TypeScript catches shape mismatches at compile time
- Changing the API always starts with changing the spec

**To regenerate after editing the spec:**

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Content in the database

All learning content — challenge instructions, hints, documentation text — lives in PostgreSQL, not in application code. This means content can be updated, expanded, or corrected without a code deployment. It also positions the platform to support AI-generated or AI-curated content in a future version.

### Single-user model (v1)

There is no authentication in v1. All progress is stored globally for one learner. Multi-user support with authentication is planned for a future sprint and is documented in the roadmap.

---

## Repository Structure

```
/
├── artifacts/
│   ├── api-server/              Express API application
│   │   └── src/
│   │       ├── routes/          Route handlers (modules, challenges, progress, docs)
│   │       └── index.ts         Server entry point, middleware
│   └── devops-forge/            React frontend application
│       └── src/
│           ├── pages/           Page components (Dashboard, Modules, Challenges, Docs)
│           ├── components/      Shared UI components and layout
│           └── App.tsx          Root component, routing
│
├── lib/
│   ├── api-spec/
│   │   └── openapi.yaml         Source of truth for all API contracts
│   ├── api-client-react/        Generated React Query hooks — DO NOT EDIT
│   ├── api-zod/                 Generated Zod validators — DO NOT EDIT
│   └── db/
│       ├── src/schema/          Drizzle table definitions
│       └── drizzle.config.ts    Database configuration
│
├── docs/                        Project handbook (this repository's knowledge base)
│   ├── README.md                Documentation index
│   └── 00_PROJECT_HANDOFF.md    Start here — full project introduction
│
├── scripts/                     Utility and maintenance scripts
│
├── pnpm-workspace.yaml          Workspace package discovery and catalog pins
├── tsconfig.base.json           Shared TypeScript configuration
└── README.md                    This file — living project blueprint
```

---

## Documentation Index

The `docs/` directory contains the full project handbook. It is structured as numbered documents that can be read independently or in sequence.

| File | Description |
|------|-------------|
| `docs/README.md` | Documentation directory index |
| `docs/00_PROJECT_HANDOFF.md` | Full project introduction — start here |
| `docs/01_PROJECT_VISION.md` | Long-form vision and north star |
| `docs/02_PRODUCT_REQUIREMENTS.md` | Functional and non-functional requirements |
| `docs/03_ENGINEERING_GUIDE.md` | How to work on this codebase |
| `docs/04_SYSTEM_ARCHITECTURE.md` | Architecture deep dive |
| `docs/05_DATABASE_DESIGN.md` | Schema, relationships, and data decisions |
| `docs/06_FOLDER_STRUCTURE.md` | Annotated directory map |
| `docs/07_DEVELOPMENT_WORKFLOW.md` | Local setup, commands, and conventions |
| `docs/08_DEVOPS_CURRICULUM.md` | Full curriculum design and sequencing |
| `docs/09_AI_MENTOR_DESIGN.md` | AI integration plans and mentor design |
| `docs/10_CHALLENGE_ENGINE.md` | How challenges are structured and scored |
| `docs/11_SCORING_ENGINE.md` | XP system, level thresholds, and progression |
| `docs/12_HINT_ENGINE.md` | Hint design principles and implementation |
| `docs/13_USER_ROLES.md` | Roles, permissions, and multi-user design |
| `docs/14_SECURITY.md` | Security posture, threat model, and practices |
| `docs/15_CI_CD.md` | Pipeline design for this project |
| `docs/16_DOCKER_STRATEGY.md` | Containerisation strategy for the platform itself |
| `docs/17_GITHUB_STRATEGY.md` | Branching, tagging, and repository conventions |
| `docs/18_TESTING_STRATEGY.md` | Test approach, coverage targets, and tooling |
| `docs/19_DEPLOYMENT_STRATEGY.md` | Hosting, deployment pipeline, and environment strategy |
| `docs/20_SPRINT_ROADMAP.md` | Current and upcoming sprints |
| `docs/21_PRODUCT_BACKLOG.md` | Prioritised feature and improvement backlog |
| `docs/22_HISTORY_OF_DECISIONS.md` | Architecture decision records |
| `docs/23_INTERVIEW_GOALS.md` | Skills and outcomes the platform targets for job readiness |
| `docs/24_CODING_STANDARDS.md` | Style guide and code conventions |
| `docs/25_FUTURE_ROADMAP.md` | Long-term vision and planned capabilities |

---

## Development Workflow

### Prerequisites

- Node.js 24
- pnpm
- PostgreSQL (provided automatically in Replit via `DATABASE_URL`)

### Initial setup

```bash
pnpm install
pnpm --filter @workspace/db run push
```

### Running the application

```bash
# API server (port 8080, served at /api)
pnpm --filter @workspace/api-server run dev

# Frontend (served at /)
pnpm --filter @workspace/devops-forge run dev
```

In Replit, both services run automatically via configured workflows. The shared reverse proxy routes `/api` to the API server and `/` to the frontend.

### Making API changes

1. Edit `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Update route handlers in `artifacts/api-server/src/routes/`
4. Update frontend pages and components as needed

Never edit the generated files in `lib/api-client-react/` or `lib/api-zod/` directly.

### Making database changes

1. Edit schema files in `lib/db/src/schema/`
2. Run `pnpm --filter @workspace/db run push`

### Typechecking

```bash
# Full check across all packages
pnpm run typecheck

# Check only shared libraries
pnpm run typecheck:libs
```

### Adding content

Challenge content, hints, and documentation topics are stored in the database. New content can be added by inserting rows into the `challenges`, `challenge_hints`, and `doc_topics` tables. See `docs/10_CHALLENGE_ENGINE.md` for content authoring guidelines (once that document is written).

---

## Coding Principles

These principles apply to all code in this repository.

**1. Contract first**
The OpenAPI spec defines the API. Implementation follows the spec, never the other way around.

**2. No `console.log` on the server**
Use `req.log` inside route handlers and the `logger` singleton everywhere else. This keeps log output structured and searchable.

**3. Validate at the boundary**
API inputs are validated with generated Zod schemas. Data that enters the system is always verified before it is used.

**4. Generated code is not edited**
Files produced by Orval codegen are treated as build artifacts. They are regenerated, not patched.

**5. Errors are explicit**
The server returns structured JSON error responses. Silent fallbacks that hide failures are not acceptable.

**6. Plain language in content**
All challenge content, hints, and documentation is written for a complete beginner. No jargon without explanation. No assumed knowledge beyond what has already been covered in the curriculum.

**7. No emojis in the UI**
The platform is professional and calm. Emojis are not used anywhere in the interface.

---

## Roadmap

### Now (v1 — current)
- Seven modules defined, Docker and Docker Compose unlocked
- Ten challenges seeded with content and hints
- XP and level system operational
- Dashboard, module browser, challenge detail, documentation pages live
- Single-user, no authentication

### Next (v1.1)
- Expand challenge library to 8–15 challenges per module
- Implement automatic module unlocking based on XP milestones
- Expand documentation library to 5–10 topics per module
- Improve streak tracking and add milestone badges

### Near-term (v2)
- User authentication (Replit Auth or Clerk)
- Per-user progress records
- AI mentor integration — contextual hints and Q&A via LLM
- Admin interface for adding and editing content without SQL

### Long-term
- Sandboxed terminal environments for running commands directly in the browser
- Adaptive challenge difficulty based on learner performance
- Community features — shared progress, peer encouragement
- Structured learning paths and certificates of completion

See `docs/25_FUTURE_ROADMAP.md` for the full long-term vision (document in progress).

---

## Contribution Workflow

This project is currently maintained by a single owner. The following workflow applies when contributions are made by others.

### Branching

- `main` — production-ready code, always deployable
- Feature work goes on a named branch: `feature/challenge-content-docker`, `fix/module-unlock-logic`, `docs/fill-architecture-guide`
- Branches merge to `main` via pull request

### Commit messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add module unlock logic based on XP threshold
fix: correct XP calculation for completed challenges
docs: populate 01_PROJECT_VISION
chore: regenerate API client after spec update
refactor: extract level calculator into shared utility
```

### Before opening a pull request

- Run `pnpm run typecheck` and confirm it passes
- Run `pnpm --filter @workspace/api-spec run codegen` if the OpenAPI spec was changed
- Run `pnpm --filter @workspace/db run push` if schema files were changed
- Update this README and relevant docs files if the architecture or roadmap changed

### AI assistants working on this project

This README is the primary entry point for AI assistants (such as Replit Agent) picking up work on this codebase. Before making changes, an AI assistant should:

1. Read this README in full
2. Read `docs/00_PROJECT_HANDOFF.md`
3. Check `replit.md` for environment-specific conventions and gotchas
4. Review the relevant section of the handbook for the area being changed

AI assistants should follow the same coding principles, commit conventions, and API-first workflow as human contributors.

---

## How This README Should Evolve

This README is a **living document**. It should be updated whenever:

- A new module is added or its status changes
- The architecture changes (new service, new library, new data store)
- A major feature ships that changes what the platform can do
- The roadmap shifts in priority or scope
- A new section of the handbook is completed and worth surfacing here
- The development workflow changes (new commands, new tools, new conventions)

The README is the entry point for both humans and AI assistants. An outdated README costs everyone time. When in doubt, update it.

**Commit updated README changes with:**
```
docs: update README — <brief description of what changed>
```
