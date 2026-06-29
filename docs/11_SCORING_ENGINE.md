# 11 — Scoring Engine

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

The scoring engine is the system that converts challenge completions into XP, maps XP to levels, and surfaces progress data to the learner. It is deliberately simple in v1 — no time bonuses, no streak multipliers, no partial credit. This document describes the current design and the rationale behind it.

---

## XP model

### How XP is earned

XP is earned by completing challenges. Each challenge has a fixed `xp_reward` value stored in the `challenges` table. When a learner marks a challenge as complete, the XP is permanently associated with that completion.

XP is **not** stored as a running total in the database. It is always computed on the fly by summing `challenges.xp_reward` for all challenges where a corresponding `progress` record exists with `is_completed = true`.

```sql
SELECT COALESCE(SUM(c.xp_reward), 0) AS total_xp
FROM challenges c
INNER JOIN progress p ON p.challenge_id = c.id
WHERE p.is_completed = true
```

### Why computed, not stored

Storing a running XP total creates a consistency problem: if the `xp_reward` for a challenge is ever corrected (say, a challenge was worth 50 XP and should have been 100), the stored total would be wrong for everyone who completed it before the correction. Computing from the source of truth avoids this entirely.

The performance cost of summing across a few hundred completions is negligible at the current scale.

### XP rewards by difficulty

| Difficulty | Base XP |
|------------|---------|
| Beginner | 50 |
| Intermediate | 75–100 |
| Advanced | 100–150 |

These values are seeded with each challenge. They can be adjusted individually if a particular challenge warrants a different reward.

---

## Level system

### Level thresholds

| Level | Name | XP Required | XP to next |
|-------|------|-------------|------------|
| 1 | Apprentice | 0 | 200 |
| 2 | Explorer | 200 | 300 |
| 3 | Practitioner | 500 | 500 |
| 4 | Engineer | 1,000 | 1,000 |
| 5 | Architect | 2,000 | 1,500 |
| 6 | Expert | 3,500 | 2,000 |
| 7 | Master | 5,500 | — |

Level 7 is the cap. A learner who completes the full planned curriculum (approximately 6,400 total XP) would comfortably exceed the Master threshold.

### Level name rationale

The names map to a genuine progression in competence:
- **Apprentice** — learning the basics, not yet self-sufficient
- **Explorer** — beginning to navigate the tooling independently
- **Practitioner** — can complete real tasks with the tools
- **Engineer** — combines tools and concepts to solve problems
- **Architect** — makes deliberate design decisions, not just uses tools
- **Expert** — deep understanding, can teach others
- **Master** — full command of the curriculum

### Level calculation

The `xpToLevel()` function in `artifacts/api-server/src/routes/progress.ts` walks the level table and returns the current level, level name, current level's XP threshold, and next level's XP threshold.

```typescript
function xpToLevel(xp: number): {
  level: number;
  levelName: string;
  currentLevelXp: number;
  nextLevelXp: number;
}
```

The function returns `nextLevelXp === currentLevelXp` when the learner has reached Level 7 (indicating no further progression). The frontend should detect this case and display "Max Level" instead of a progress bar toward the next level.

---

## Progress summary

The `/api/progress/summary` endpoint returns:

| Field | Description |
|-------|-------------|
| `totalXp` | Sum of XP from all completed challenges |
| `level` | Current level (1–7) |
| `levelName` | Human-readable level name |
| `currentLevelXp` | XP required for the current level |
| `nextLevelXp` | XP required for the next level |
| `completedChallenges` | Count of completed challenges |
| `totalChallenges` | Count of all available challenges |
| `streakDays` | Consecutive days with at least one completion (v1: hardcoded to 1) |
| `modulesStarted` | Count of modules with at least one completion |
| `modulesCompleted` | Count of modules where all challenges are complete |

### Level progress bar calculation

The frontend renders a progress bar showing how far through the current level the learner is:

```
progress = (totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)
```

For a learner at 750 XP (Practitioner, threshold 500, next at 1000):
```
progress = (750 - 500) / (1000 - 500) = 250 / 500 = 0.5 = 50%
```

---

## Streak tracking

### Current implementation (v1)

Streak is hardcoded to 1 in v1. The data needed to compute a real streak (timestamps of completed challenges) exists in `progress.completed_at`, but the logic to compute consecutive calendar days has not been implemented.

### Planned implementation (v1.1)

A streak is defined as the number of consecutive calendar days (in the learner's local timezone) on which at least one challenge was completed.

```sql
-- Get distinct completion dates
SELECT DISTINCT DATE(completed_at) AS completion_date
FROM progress
WHERE is_completed = true
ORDER BY completion_date DESC
```

Walk backwards from today: if yesterday has a completion, increment the streak and check the day before. Stop when a gap is found.

### Streak reset

A streak resets to 0 if no challenge is completed on a given calendar day. It resets to 1 on the next day a challenge is completed.

The streak is shown on the dashboard. When it reaches milestones (7 days, 30 days, 100 days), a badge is awarded. Badge logic is planned for v1.1.

---

## Activity feed

The `/api/progress/activity` endpoint returns the 10 most recent completions, formatted as activity items:

```json
{
  "id": 5,
  "type": "challenge_completed",
  "title": "Build Your First Docker Image",
  "xpEarned": 100,
  "moduleName": "Docker",
  "occurredAt": "2026-06-27T10:30:00.000Z"
}
```

In a future version, the activity feed will also include:
- `module_started` — when a learner opens their first challenge in a new module
- `badge_earned` — when a streak or completion milestone is reached
- `level_up` — when the learner crosses a level threshold

---

## Future scoring considerations

### Streak multipliers

A streak bonus (e.g., 1.5x XP after 7 consecutive days) would increase motivation but complicate the "XP is computed, not stored" model. If implemented, the multiplier would need to be applied at completion time and stored with the progress record, since the historic streak cannot be reliably reconstructed later.

### Time bonuses

No time bonuses are planned. Rewarding speed penalises thoughtful learners who read the documentation and understand what they are doing. The platform rewards doing, not doing quickly.

### Badges

Badges will be awarded for:
- Completing all challenges in a module
- Maintaining a streak for 7, 30, and 100 days
- Reaching each level threshold
- Completing the first challenge in each module

Badges will be stored in a `badges` table (planned for v1.1) and displayed on the dashboard and a future profile page.
