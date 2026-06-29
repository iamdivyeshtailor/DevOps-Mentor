# 21 — Product Backlog

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

This backlog contains all known improvements, features, and content items that are not yet assigned to a sprint. Items are grouped by category and roughly prioritised within each group. This is a living document — update it whenever a new item is identified or an item is pulled into a sprint.

Items pulled into a sprint are removed from this backlog and tracked in `20_SPRINT_ROADMAP.md`.

---

## Priority key

- **P1** — Critical for core learning experience; should be in the next sprint
- **P2** — Important; meaningfully improves the platform
- **P3** — Nice to have; low urgency

---

## Content

| Priority | Item | Notes |
|----------|------|-------|
| P1 | Docker module: challenges 4–10 | Environment variables, volumes, networking, inspect, push to Hub, multi-stage builds, image optimisation |
| P1 | Docker Compose: challenges 3–6 | Redis cache, compose overrides, health checks, production compose |
| P1 | GitHub Actions: challenges 2–7 | Tests in CI, secrets, Docker build, matrix builds, reusable workflows, deploy on merge |
| P1 | GitLab CI: challenges 2–5 | Docker executor, caching, artifacts, environment deploy |
| P1 | AWS: challenges 2–8 | SSH to EC2, S3, Security Groups, IAM, VPC, ECS, RDS |
| P1 | Terraform: challenges 2–6 | Variables, remote state, EC2, VPC, modules |
| P1 | Kubernetes: challenges 2–11 | Deployment, Service, ConfigMap, Secrets, rolling update, PVC, resource limits, Helm, HPA |
| P2 | Documentation: 3+ topics per module | Currently 1 per module; target is 5–10 per module |
| P2 | Challenge difficulty balance review | Ensure each module has a clear beginner → intermediate → advanced path |
| P3 | Challenge tagging improvements | Add more granular tags for cross-module search |
| P3 | Glossary of DevOps terms | A single searchable page defining key terms used across all modules |

---

## Features

### High priority

| Priority | Item | Notes |
|----------|------|-------|
| P1 | Module unlock progression | Replace hardcoded `is_unlocked` with dynamic unlock based on XP or challenge milestones |
| P1 | User authentication | Replit Auth or Clerk; required before platform is shared with multiple learners |
| P1 | Per-user progress isolation | Multi-user schema changes; `user_id` on progress table |
| P2 | AI mentor — challenge Q&A | LLM-powered contextual help panel on challenge detail page |
| P2 | Admin content management UI | Create/edit challenges, hints, and docs through a UI instead of SQL |
| P2 | Streak tracking (real) | Compute consecutive-day streak from `completed_at` timestamps |
| P2 | Milestone badges | Complete all module challenges, 7-day streak, level-up events |
| P2 | Badge display on dashboard | Show earned badges with tooltips |

### Medium priority

| Priority | Item | Notes |
|----------|------|-------|
| P2 | Markdown rendering for content | Render challenge content and documentation as formatted Markdown |
| P2 | Unlock progress indicator | Show "X/Y challenges complete — Module Z unlocks at Y" on locked module cards |
| P2 | Challenge search | Full-text search across challenge titles, descriptions, and tags |
| P2 | Documentation search | Full-text search across documentation topics |
| P2 | Reading progress on doc topics | Track which documentation topics a learner has read |
| P3 | "Continue where you left off" | Dashboard shortcut to the last in-progress module |
| P3 | Challenge completion animation | Satisfying visual feedback when a challenge is completed |
| P3 | Level-up notification | Toast or modal when the learner crosses a level threshold |
| P3 | Module completion screen | A dedicated screen when all challenges in a module are done |

### Lower priority

| Priority | Item | Notes |
|----------|------|-------|
| P3 | Mobile responsive layouts | Currently desktop-only |
| P3 | Keyboard navigation | Full keyboard accessibility across all interactive elements |
| P3 | Dark/light mode toggle | Currently dark only |
| P3 | Progress export | Export completion history as a simple PDF or CSV |
| P3 | Print-friendly challenge view | Clean print layout for offline reference |

---

## Infrastructure and engineering

| Priority | Item | Notes |
|----------|------|-------|
| P1 | CI/CD pipeline | GitHub Actions: typecheck + lint on push, tests on PR |
| P1 | Integration test suite | API endpoint tests with real test database |
| P2 | Staging environment | Pre-production validation environment |
| P2 | ESLint enforcement | Codify and enforce coding standards via linter |
| P2 | Prettier enforcement | Consistent formatting across the codebase |
| P2 | Formal seed script | Replace ad-hoc seed calls with a reusable script in `scripts/` |
| P2 | Database backup procedure | Documented and automated regular backups |
| P3 | Dockerise the application | `Dockerfile` and `docker-compose.yml` for the platform itself |
| P3 | Uptime monitoring | Alert when the production deployment is unreachable |
| P3 | Error tracking | Sentry or equivalent for production error capture |
| P3 | Performance profiling | Identify and address slow API queries |

---

## Long-term / speculative

These items are genuinely interesting but far from the current focus. They are recorded here so they are not forgotten.

| Item | Why interesting |
|------|----------------|
| Sandboxed terminal environments | Learners could run commands directly in the browser — removes the biggest barrier to starting |
| Adaptive difficulty | Platform adjusts challenge recommendations based on performance and time-to-completion |
| Community progress sharing | Optional public profiles showing level and completed modules |
| Peer review of challenge solutions | Learners describe their solution approach and get feedback from more experienced peers |
| Certificate of completion | Verifiable completion credential per module or for the full curriculum |
| Instructor mode | Create and share custom learning paths built from existing challenges |
| Offline mode | Service worker + IndexedDB so content is accessible without internet |
| Multiple language support | Translated content for non-English-speaking learners |

---

## Bugs and known issues

| Severity | Issue | Notes |
|----------|-------|-------|
| Low | Streak always shows 1 | Streak calculation not implemented; hardcoded value |
| Low | No empty state for activity feed | When no challenges have been completed, the activity feed area is blank rather than showing an encouraging message |
| Low | Module unlock is static | All unlock states are hardcoded; no dynamic progression |
