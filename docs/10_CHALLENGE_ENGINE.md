# 10 — Challenge Engine

**Document status:** Complete  
**Last updated:** June 2026

---

## What is the challenge engine?

The challenge engine is not a single component — it is the combination of the data model, API, and frontend that together make challenges work. This document describes how challenges are structured, how they are stored, how they are retrieved, how they are rendered, and how the completion lifecycle works.

---

## Challenge anatomy

Every challenge has the following components:

### Identity fields
- **`id`** — database primary key, used in URLs and API calls
- **`moduleId`** — which module this challenge belongs to
- **`slug`** (future) — URL-friendly identifier for bookmarking

### Display fields
- **`title`** — action-oriented name, written as an instruction (e.g., "Build Your First Docker Image", not "Docker Images")
- **`description`** — one sentence stating the objective; appears in list views
- **`difficulty`** — `beginner`, `intermediate`, or `advanced`; controls badge colour and filter behaviour
- **`tags`** — array of lowercase keywords (e.g., `["docker", "images", "dockerfile"]`); used for search and future tagging filters
- **`xpReward`** — XP awarded on completion

### Content fields
- **`content`** — the full instructional text of the challenge. This is the heart of the challenge: step-by-step guidance written for a beginner. Stored in the database as plain text with code indented by spaces.
- **`hints`** — an ordered array of hint strings. Retrieved from the `challenge_hints` table. Each hint narrows the problem space progressively.

### Progress fields
- **`isCompleted`** — computed at query time by joining with the `progress` table. True if a progress record exists for this challenge with `is_completed = true`.

---

## Challenge content guidelines

Every piece of challenge content should follow these principles:

### 1. State the objective once, clearly
The first paragraph explains what the learner will do and why it matters. No preamble. No history of the technology. Just: here is what you are going to do, here is what you will learn from it.

### 2. Give exact commands
Do not say "run the Docker command to start the container." Say:
```
docker run -d -p 8080:80 nginx
```
A beginner cannot infer what "the Docker command" means. They need the exact string to type.

### 3. Explain what each flag does
After giving a command, explain what the flags mean. `docker run -d -p 8080:80 nginx` should be followed by:
- `-d` — run in detached mode (in the background)
- `-p 8080:80` — map port 8080 on your machine to port 80 inside the container

### 4. Tell the learner what to expect
After giving a command, describe what a successful outcome looks like. "You should see the Nginx welcome page at http://localhost:8080." A learner who does not know what to expect cannot verify they succeeded.

### 5. Flag common mistakes
If there is a predictable mistake — forgetting the dot at the end of `docker build`, using a wrong flag name — mention it. Do not leave learners to discover it through failure with no context.

### 6. Do not overexplain
The content is not a full reference document. It teaches one thing at a time. Concept depth belongs in documentation topics, not challenge content.

---

## Difficulty calibration

| Level | Definition | Target learner state |
|-------|-----------|---------------------|
| Beginner | First exposure to this technology or concept | Has never used Docker/Kubernetes/etc. |
| Intermediate | Combines two or more concepts the learner already knows | Comfortable with one beginner concept, ready to combine it with another |
| Advanced | Applies concepts to a production-relevant problem | Has completed most beginner and intermediate challenges in the module |

A beginner challenge must work if the learner has zero prior knowledge of the technology. An advanced challenge can assume everything in earlier challenges is understood.

---

## The completion lifecycle

```
Learner clicks "Mark as Complete"
        ↓
useCompleteChallenge mutation fires
        ↓
POST /api/challenges/:id/complete
        ↓
Route handler checks challenge exists (404 if not)
        ↓
Route handler upserts progress record:
  - INSERT ... ON CONFLICT → UPDATE set is_completed=true, completed_at=NOW()
        ↓
Response: { challengeId, isCompleted: true, completedAt }
        ↓
TanStack Query invalidates:
  - getGetProgressSummaryQueryKey()
  - getGetActivityFeedQueryKey()
  - getListChallengesQueryKey(...)
  - getGetModuleQueryKey(moduleId)
        ↓
Dashboard and module progress update automatically
```

### Idempotency
The completion endpoint is idempotent — calling it multiple times for the same challenge does not award XP multiple times. XP is computed at read time by summing `xp_reward` from completed challenges. There is no XP counter that increments on each call.

### No undo
There is no "un-complete" functionality. Completed challenges remain completed. This is intentional — unintentional completions are rare and the engineering cost of undo outweighs the benefit in v1.

---

## Challenge ordering

Challenges within a module have a `sort_order` column that determines the recommended completion sequence. The frontend displays challenges in this order on the module detail page.

The sort order is a simple integer (1, 2, 3...). To insert a challenge between two existing ones, update `sort_order` values of later challenges. A future version will use a float or string-based order key to avoid cascade updates.

The recommended order is:
1. Beginner challenges in conceptual sequence
2. Intermediate challenges that build on the beginner ones
3. Advanced challenges that assume the full module foundation

Learners can complete challenges in any order they choose — the `sort_order` is a recommendation, not an enforcement.

---

## Hint design

Hints are stored in `challenge_hints` and retrieved in `sort_order` order. They are designed to be progressive — the learner should reveal them one at a time, trying to proceed between each.

**Good hint structure:**
1. First hint: narrows the problem domain. "Check that the flag you are using matches the one in the documentation. Some flags have short (`-d`) and long (`--detach`) versions."
2. Second hint: points more directly. "The -d flag runs the container in the background. Without it, your terminal will be locked until the container stops."
3. Third hint (if needed): provides enough to proceed with minimal remaining work. "Your full command should look like: `docker run -d nginx`. The -p flag is separate and optional for this challenge."

**Bad hints:**
- "Have you tried running the command?" (useless — adds no information)
- "The answer is: `docker run -d nginx`" (gives it away)
- "Read the Docker documentation" (unhelpful for a beginner who may not know where to look)

Each hint should be 1–3 sentences. Concise, specific, and actionable.

---

## API design

### GET /api/challenges

Returns all challenges with `isCompleted` joined from the progress table. Accepts `moduleId` and `difficulty` query parameters. Used by the challenges list page and the module detail page.

### GET /api/challenges/:id

Returns the full challenge including `content` and `hints` (fetched from `challenge_hints` joined in order). Used by the challenge detail page.

### POST /api/challenges/:id/complete

Upserts the progress record. Returns the updated progress state. The frontend uses this response to immediately update UI state before the refetch completes.

---

## Content storage

Challenge content is plain text stored in the `content` column of the `challenges` table. Code blocks are indented by two spaces. Sections are separated by blank lines.

This format was chosen because:
- It is simple to store and retrieve
- It renders acceptably as pre-formatted text
- It does not require a Markdown parser to read

A future version will store content as Markdown and render it with a lightweight parser (e.g., `marked` or `remark`). The database schema does not need to change — only the frontend renderer.

---

## Future enhancements

- **Challenge completion verification** — instead of a self-report button, verify completion by checking that the learner's terminal output matches expected patterns (requires sandboxed environments)
- **Challenge ratings** — allow learners to flag challenges as confusing or well-written; use this to prioritise content improvements
- **Adaptive difficulty** — track time-to-completion and hint usage to suggest alternative challenges when a learner is consistently stuck
- **Challenge dependencies** — define prerequisite challenges that must be completed before certain intermediate/advanced challenges become available
