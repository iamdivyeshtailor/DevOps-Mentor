# 20 — Sprint Roadmap

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

This document tracks planned and completed sprints. A sprint is a focused block of work — typically one to two weeks — with a clear goal and a defined set of deliverables. Sprints are not rigidly time-boxed for a solo project; they are used to maintain focus and create natural checkpoints for review.

Update this document at the end of each sprint with what was completed and what carried over.

---

## Sprint 0 — Foundation (Completed)

**Goal:** Build the initial platform with a working full-stack architecture, all seven modules defined, and enough content to demonstrate the learning experience.

**Deliverables:**

- [x] pnpm monorepo with api-server, devops-forge, api-spec, db, api-client-react, api-zod packages
- [x] PostgreSQL database with Drizzle ORM schema (modules, challenges, challenge_hints, progress, doc_topics)
- [x] OpenAPI 3.1 spec covering all planned endpoints
- [x] Orval codegen producing React Query hooks and Zod validators
- [x] Express API server with routes for all planned endpoints
- [x] React frontend with all seven pages (Dashboard, Modules, ModuleDetail, Challenges, ChallengeDetail, Docs, DocDetail)
- [x] Dark terminal-inspired UI with sidebar navigation, XP level display, and module cards
- [x] All 7 modules seeded (Docker and Docker Compose unlocked)
- [x] 10 challenges seeded across all modules with content and hints
- [x] 7 documentation topics seeded (one per module)
- [x] Challenge completion flow (mark complete, XP update, dashboard refresh)
- [x] Production deployment on Replit
- [x] Project handbook created (docs/ directory, 27 files)

**Status:** Complete

---

## Sprint 1 — Content Expansion (Planned)

**Goal:** Grow the challenge library from 10 to 30+ challenges. Each module should have at least 3 challenges with full content and hints. Docker should have all 10 planned challenges.

**Deliverables:**

- [ ] Docker module: challenges 4–10 (environment variables, volumes, networking, inspect, push, multi-stage, image size)
- [ ] Docker Compose: challenges 3–6 (Redis, overrides, health checks, build+push)
- [ ] GitHub Actions: challenges 2–4 (run tests, secrets, Docker in CI)
- [ ] GitLab CI: challenges 2–3 (test with Docker image, caching)
- [ ] AWS: challenges 2–3 (SSH to EC2, create S3 bucket)
- [ ] Terraform: challenges 2–3 (variables, state in S3)
- [ ] Kubernetes: challenges 2–3 (Deployment, Service)
- [ ] Documentation expanded: 3 topics per module (21 total)
- [ ] Sprint 0 handbook docs reviewed and updated where inaccurate

**Estimated effort:** 2–3 weeks  
**Status:** Not started

---

## Sprint 2 — Progression System (Planned)

**Goal:** Implement automatic module unlocking based on XP milestones or challenge completion. Replace the hardcoded unlock flags with a progression system.

**Deliverables:**

- [ ] Define unlock rules for each module (e.g., "GitHub Actions unlocks at 300 XP" or "after completing 3 Docker challenges")
- [ ] Implement unlock check in the modules API — `is_unlocked` is computed dynamically, not stored statically
- [ ] Frontend shows a clear message on locked modules: what is required to unlock
- [ ] Progress toward unlock is visible (e.g., "3/5 Docker challenges complete — GitHub Actions unlocks at 5")
- [ ] Streak tracking implemented properly (consecutive calendar days)
- [ ] Milestone badges: completing all challenges in a module, 7-day streak, first challenge
- [ ] Badge display on dashboard

**Estimated effort:** 1–2 weeks  
**Status:** Not started

---

## Sprint 3 — Authentication and Multi-user (Planned)

**Goal:** Add user authentication so multiple learners can use the platform with separate progress records.

**Deliverables:**

- [ ] Integrate Replit Auth (OIDC/PKCE) or Clerk
- [ ] Add `users` table to schema
- [ ] Add `user_id` foreign key to `progress` table
- [ ] Scope all progress API endpoints to the authenticated user
- [ ] Login and logout UI
- [ ] Session persistence across page refreshes
- [ ] Admin role for platform operator
- [ ] Basic admin interface for content management (no SQL required)

**Estimated effort:** 2–3 weeks  
**Status:** Not started. Depends on Sprint 1 being complete (content must be solid before opening to multiple users).

---

## Sprint 4 — AI Mentor (Planned)

**Goal:** Add the AI mentor feature — a conversational panel on the challenge detail page that answers questions in the context of the current challenge.

**Deliverables:**

- [ ] Connect Replit AI integration (Anthropic Claude or Gemini)
- [ ] New API endpoint: POST /api/mentor/ask — accepts question + context, returns streamed response
- [ ] Context assembly: current challenge content, learner's completion history, relevant hints
- [ ] System prompt implementing the mentor persona (see `09_AI_MENTOR_DESIGN.md`)
- [ ] Mentor panel UI in challenge detail (collapsible, conversation history for session)
- [ ] Streaming response rendering in the frontend
- [ ] Rate limiting on the mentor endpoint (20 req/min)
- [ ] Manual review of sample mentor conversations for quality

**Estimated effort:** 2–3 weeks  
**Status:** Not started. Depends on Sprint 3 (auth required to scope mentor context to individual users).

---

## Sprint 5 — CI/CD and Testing (Planned)

**Goal:** Implement the automated CI/CD pipeline and a foundational test suite.

**Deliverables:**

- [ ] GitHub Actions CI workflow (typecheck + lint on every push)
- [ ] Integration test suite for all API endpoints
- [ ] Test database provisioning in CI
- [ ] Staging environment on Replit
- [ ] Automated deployment to staging on merge to `main`
- [ ] Smoke test suite for staging
- [ ] Dependabot configuration for dependency updates
- [ ] ESLint and Prettier enforced in CI

**Estimated effort:** 1–2 weeks  
**Status:** Not started.

---

## Sprint 6 — Polish and Public Beta (Planned)

**Goal:** Address UX gaps, performance issues, and accessibility. Prepare for a broader audience.

**Deliverables:**

- [ ] Mobile-responsive layouts for all pages
- [ ] Keyboard navigation for all interactive elements
- [ ] Markdown rendering for challenge content and documentation
- [ ] Loading skeleton improvements
- [ ] Error boundary implementation in React (graceful crash handling)
- [ ] Full challenge library: 8+ challenges per module
- [ ] Full documentation library: 5+ topics per module
- [ ] Custom domain configuration
- [ ] Public announcement and repository open-sourcing (if decided)

**Estimated effort:** 3–4 weeks  
**Status:** Not started.

---

## Backlog items not yet assigned to a sprint

- Sandboxed terminal environments (significant infrastructure — likely v3+)
- Community features (progress sharing, peer encouragement)
- Certificate of completion
- Export progress as PDF
- Offline mode (service worker + local storage)
- Video content integration
- Multiple language support
