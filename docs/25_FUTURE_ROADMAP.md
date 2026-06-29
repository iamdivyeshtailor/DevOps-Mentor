# 25 — Future Roadmap

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

This document describes the long-term direction of DevOps Forge — what the platform is working toward over the next one to three years, and the principles that should guide decisions along the way. It is intentionally aspirational. The near-term sprint plan is in `20_SPRINT_ROADMAP.md`; this document is about the bigger picture.

---

## The north star (repeated from 01_PROJECT_VISION.md)

A learner who arrives knowing nothing about infrastructure can, after completing the DevOps Forge curriculum, sit in an engineering interview or join a team and contribute from day one. The platform produces genuine capability, not just familiarity.

Everything in this roadmap is in service of that outcome.

---

## Phase 1 — Complete learning platform (current focus)

**Timeframe:** Now — 6 months

**Goal:** Build a platform with enough high-quality content to take a learner from zero to confident practitioner across all seven modules.

**What this means:**
- 8–15 challenges per module (currently: 1–3)
- 5–10 documentation topics per module (currently: 1)
- A working progression system that unlocks modules in sequence
- Streak tracking and milestone badges
- Markdown rendering for challenge content
- A clean, complete UI with no rough edges

By the end of Phase 1, the platform is a complete learning experience for a single learner. The content is the product. The technology is just the delivery mechanism.

---

## Phase 2 — Multi-user and AI mentor (6–12 months)

**Goal:** Open the platform to multiple learners simultaneously, each with their own progress, and add the AI mentor as a first-class feature.

### Authentication and per-user progress

Add user authentication (Replit Auth or Clerk). Each learner has their own account, their own XP, their own completions. Progress from one user does not affect another.

This unlocks:
- Sharing the platform with others
- Building a community (even a small one) around the learning experience
- Collecting aggregate usage data to inform content improvements

### AI mentor

The AI mentor is the feature that most directly realises the platform's vision of acting like a personal tutor. In Phase 2, the mentor:
- Answers questions about the current challenge in natural language
- Is aware of what the learner has already completed
- Follows the hint design principles (guides without giving away answers)
- Is accessible via a collapsible panel on every challenge detail page

The mentor will use Replit's AI integration proxy (Anthropic Claude or Gemini) — no separate API key management required.

### Content management interface

An admin UI that allows creating and editing challenges, hints, and documentation topics through a web form rather than SQL. This allows non-technical contributors to add curriculum content.

---

## Phase 3 — Verified learning and community (12–24 months)

**Goal:** Add mechanisms for learners to verify their progress and optionally share it, and build light community features.

### Sandboxed terminal environments

The biggest improvement to the learning experience that is currently out of reach: a browser-based terminal where learners can run commands directly without needing to set up Docker or any other tool on their own machine.

This removes the highest barrier to starting — the friction of configuring a local environment before doing the first challenge. A learner with a browser can start Docker challenge 1 immediately.

Implementation options:
- WebAssembly-based terminal (e.g., Wasm-based Docker simulation)
- Server-side terminal with WebSocket connection (higher infrastructure cost, more realistic)
- Integration with a cloud sandbox provider (Killercoda, Play with Docker, etc.)

### Automated challenge verification

Instead of self-reporting completion ("I did it — mark it done"), the platform verifies completion by checking the learner's output against expected results. This requires the sandboxed terminal environment.

Verification makes the XP and level system meaningful as a credential — the learner genuinely demonstrated the capability, rather than clicking a button.

### Certificates of completion

Verifiable completion credentials for each module and for the full curriculum. Generated as PDFs with a unique verification URL. These are most meaningful once automated verification is in place.

### Community features (optional)

Light community features that support learning without becoming a social network:
- Optional public profiles showing level and completed modules
- A "learning together" mode — shared progress with a study partner
- Community-submitted challenge improvements (flagging confusing content)

Community features are lower priority than content quality. A platform with great content and no community beats a platform with mediocre content and active forums.

---

## Phase 4 — Adaptive and personalised learning (24+ months)

**Goal:** Use learner behaviour data to make the curriculum adapt to the individual.

### Adaptive challenge difficulty

Track time-to-completion and hint usage for each challenge, per learner. Use this data to:
- Identify which challenges are too hard (high hint usage, high abandonment)
- Recommend alternative challenges when a learner is consistently stuck
- Adjust the XP reward based on actual difficulty (crowd-sourced calibration)

### Personalised learning paths

Instead of a single fixed sequence, the platform offers curated paths based on the learner's goal:
- "I want to pass a DevOps interview in 3 months" — prioritises breadth
- "I want to become proficient in Kubernetes" — goes deep on container orchestration
- "I want to move from developer to DevOps engineer" — emphasises CI/CD and IaC

### Advanced AI mentor capabilities

The AI mentor in Phase 4 goes beyond Q&A:
- Notices when a learner is stuck and proactively offers help
- Generates personalised challenge variations when a learner has mastered a standard challenge
- Provides a "why did I get this wrong?" explanation when a learner's attempted approach fails
- Remembers previous conversations to maintain continuity across sessions

---

## Principles for future decisions

As the platform grows, these principles should guide every significant decision:

### 1. Content quality over feature quantity

A platform with 10 excellent challenges is more valuable than a platform with 100 mediocre ones. Before building a new feature, ask whether the same effort invested in content would deliver more learning value.

### 2. Reduce friction before adding features

Every point of friction in the learning experience — setup complexity, confusing UI, unclear instructions — costs learners. Removing friction is almost always more valuable than adding a new feature.

### 3. Verify before expanding

Before adding a new module, verify that existing modules work well. Before opening to more users, verify that the experience for current users is solid. Build up, not out.

### 4. Maintain the beginner focus

As the platform grows, it will be tempting to add advanced content, power features, and configuration options. Resist. The platform is for beginners. Advanced learners can use the official documentation of each technology — they have the skills to navigate it. Beginners cannot.

### 5. Keep the tech simple

The platform teaches complex technology. The platform itself should be as simple as possible to understand and maintain. Every new dependency, new service, and new abstraction is a cost. Justify it clearly before adding it.

### 6. The mentor character is the product

Features, content, and infrastructure are all in service of one thing: a learner experience that feels like having a patient, knowledgeable person sitting beside them. When evaluating any decision, ask: does this make the learner feel more guided and supported, or less?

---

## What success looks like in 3 years

A learner who discovers DevOps Forge can complete the full curriculum in 3–6 months of consistent effort. At the end, they can demonstrate real competence with Docker, CI/CD, AWS, Terraform, and Kubernetes in an interview or on a team. They did the work in a browser, without needing to configure a local environment or find a mentor.

The platform has a small but active group of learners who recommend it to others because it actually worked for them. The curriculum is updated regularly based on real learner feedback. The content is high quality, well-maintained, and honest about what it covers and what it does not.

DevOps Forge is not the biggest or most comprehensive DevOps learning resource. It is the most effective one for a learner who is starting from zero.
