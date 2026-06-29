# 02 — Product Requirements

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

This document defines the functional and non-functional requirements for DevOps Forge. Requirements are organised by feature area. Each requirement is marked with its current implementation status.

**Status legend:**
- `[x]` Implemented in v1
- `[ ]` Planned — not yet built
- `[-]` Partially implemented

---

## Functional Requirements

### 1. Module System

| # | Requirement | Status |
|---|-------------|--------|
| 1.1 | The platform must define a fixed set of learning modules, each representing a distinct technology area | `[x]` |
| 1.2 | Each module must have a title, description, icon, category, and estimated learning hours | `[x]` |
| 1.3 | Modules must be orderable and displayed in a consistent sequence | `[x]` |
| 1.4 | Modules must have a locked or unlocked state visible to the learner | `[x]` |
| 1.5 | A learner must be able to see their completion percentage for each module | `[x]` |
| 1.6 | Locked modules must be clearly distinguished from unlocked modules in the UI | `[x]` |
| 1.7 | Module unlock must be triggered automatically by learner progression (XP or challenge milestones) | `[ ]` |
| 1.8 | The platform must initially unlock Docker and Docker Compose for all learners | `[x]` |

### 2. Challenge System

| # | Requirement | Status |
|---|-------------|--------|
| 2.1 | Each module must contain one or more challenges | `[x]` |
| 2.2 | Each challenge must have a title, description, difficulty level, and XP reward | `[x]` |
| 2.3 | Difficulty levels must be: beginner, intermediate, advanced | `[x]` |
| 2.4 | Each challenge must have full instructional content (step-by-step, written for beginners) | `[x]` |
| 2.5 | Each challenge must have between one and five progressive hints | `[x]` |
| 2.6 | A learner must be able to mark a challenge as complete | `[x]` |
| 2.7 | Completing a challenge must award XP and update progress | `[x]` |
| 2.8 | A completed challenge must remain marked as complete across sessions | `[x]` |
| 2.9 | The challenge list must be filterable by module and by difficulty | `[x]` |
| 2.10 | Challenge completion state must be visible in both list and detail views | `[x]` |
| 2.11 | Challenges within a module should be orderable (a recommended sequence) | `[x]` |
| 2.12 | Each module should eventually contain 8–15 challenges | `[ ]` |

### 3. XP and Progression System

| # | Requirement | Status |
|---|-------------|--------|
| 3.1 | The platform must maintain a total XP count for the learner | `[x]` |
| 3.2 | XP must be awarded only when a challenge is marked complete | `[x]` |
| 3.3 | XP must not be awarded more than once for the same challenge | `[x]` |
| 3.4 | The learner's XP must map to one of seven named levels | `[x]` |
| 3.5 | The learner's current level and progress to next level must be displayed on the dashboard | `[x]` |
| 3.6 | Level thresholds must be: 0 / 200 / 500 / 1000 / 2000 / 3500 / 5500 XP | `[x]` |
| 3.7 | The platform must display a streak (consecutive days with activity) | `[-]` |
| 3.8 | The platform must support badges or milestone awards | `[ ]` |

### 4. Documentation System

| # | Requirement | Status |
|---|-------------|--------|
| 4.1 | Each module must have one or more associated documentation topics | `[x]` |
| 4.2 | Each topic must have a title, summary, full content, and estimated reading time | `[x]` |
| 4.3 | Topics must be browsable independently of challenges | `[x]` |
| 4.4 | Topics must be filterable by module | `[x]` |
| 4.5 | Topic content must be stored in the database, not in static files | `[x]` |
| 4.6 | Topic content must render with appropriate formatting (headings, code blocks, lists) | `[-]` |
| 4.7 | Each module should eventually have 5–10 documentation topics | `[ ]` |

### 5. Dashboard

| # | Requirement | Status |
|---|-------------|--------|
| 5.1 | The dashboard must display the learner's current XP total | `[x]` |
| 5.2 | The dashboard must display the learner's current level and level name | `[x]` |
| 5.3 | The dashboard must display a progress bar toward the next level | `[x]` |
| 5.4 | The dashboard must display total completed challenges and total available | `[x]` |
| 5.5 | The dashboard must display a recent activity feed | `[x]` |
| 5.6 | The dashboard must display module cards with progress | `[x]` |
| 5.7 | The dashboard must show the learner's current streak | `[-]` |
| 5.8 | The dashboard must be the default landing page | `[x]` |

### 6. Navigation and Routing

| # | Requirement | Status |
|---|-------------|--------|
| 6.1 | The platform must have persistent sidebar navigation | `[x]` |
| 6.2 | The sidebar must show links to Dashboard, Modules, Challenges, and Documentation | `[x]` |
| 6.3 | The sidebar must indicate the currently active section | `[x]` |
| 6.4 | Routes must be: `/`, `/modules`, `/modules/:id`, `/challenges`, `/challenges/:id`, `/docs`, `/docs/:id` | `[x]` |
| 6.5 | All pages must handle loading states gracefully | `[x]` |
| 6.6 | All pages must handle empty states with encouraging copy | `[x]` |
| 6.7 | Page transitions must be smooth | `[x]` |

### 7. Authentication and Multi-user Support

| # | Requirement | Status |
|---|-------------|--------|
| 7.1 | v1 operates without authentication (single-user, global progress) | `[x]` |
| 7.2 | Authentication must be added before the platform is shared with multiple learners | `[ ]` |
| 7.3 | Each authenticated user must have their own isolated progress record | `[ ]` |
| 7.4 | Admin users must be able to add and edit content without SQL | `[ ]` |

### 8. AI Mentor

| # | Requirement | Status |
|---|-------------|--------|
| 8.1 | A learner must be able to ask a question in natural language and receive a contextual answer | `[ ]` |
| 8.2 | The AI mentor must be aware of which challenge or module the learner is currently viewing | `[ ]` |
| 8.3 | The AI mentor must not give away challenge answers directly | `[ ]` |
| 8.4 | AI responses must be appropriate for a complete beginner | `[ ]` |

---

## Non-Functional Requirements

### Performance

| # | Requirement |
|---|-------------|
| P.1 | Page load time (first contentful paint) must be under 2 seconds on a standard broadband connection |
| P.2 | API responses for read operations must complete in under 300ms under normal load |
| P.3 | The application must remain responsive with up to 50 concurrent users (future requirement) |

### Reliability

| # | Requirement |
|---|-------------|
| R.1 | The API must return structured JSON error responses for all failure cases |
| R.2 | No learner progress must be lost due to application errors |
| R.3 | The application must not silently swallow errors — failures must be logged |

### Usability

| # | Requirement |
|---|-------------|
| U.1 | The platform must be usable by a complete beginner without onboarding documentation |
| U.2 | All interactive elements must be accessible via keyboard |
| U.3 | The platform must be usable on desktop screen sizes (1280px and above) |
| U.4 | Mobile responsiveness is desirable but not a v1 requirement |
| U.5 | No emojis must appear anywhere in the interface |
| U.6 | All copy must be written in plain English accessible to a non-native speaker |

### Maintainability

| # | Requirement |
|---|-------------|
| M.1 | All API changes must go through the OpenAPI spec before implementation |
| M.2 | Generated code must never be edited manually |
| M.3 | Content updates must be possible without a code deployment |
| M.4 | The codebase must pass TypeScript strict-mode checks |
| M.5 | All server-side logging must use structured JSON (pino) |

### Security

| # | Requirement |
|---|-------------|
| S.1 | No credentials or secrets must appear in source code or committed files |
| S.2 | All API inputs must be validated before use |
| S.3 | Database queries must use parameterised statements — no string interpolation into SQL |
| S.4 | Environment variables must be managed through Replit's secrets system |

---

## Out of scope for v1

The following items have been explicitly considered and deferred:

- Real-time sandboxed terminal environments
- Video content
- Mobile native application
- Social or community features
- Payment or subscription management
- Certificates of completion
- Multiple language support (English only in v1)
- Offline mode
