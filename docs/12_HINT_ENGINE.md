# 12 — Hint Engine

**Document status:** Complete  
**Last updated:** June 2026

---

## Purpose

Hints are one of the most important features of the platform. They are the mechanism through which the platform acts like a mentor rather than a textbook. A textbook gives you information. A mentor gives you the next useful piece of information when you are stuck — without doing the work for you.

Getting hints right is hard. Too much and the learner does not actually learn. Too little and they give up. The hint engine is designed to thread that needle.

---

## Data model

Hints are stored in the `challenge_hints` table:

```
challenge_hints
  id            serial PRIMARY KEY
  challenge_id  integer NOT NULL → challenges.id
  hint          text NOT NULL
  sort_order    integer NOT NULL DEFAULT 0
```

Each challenge has zero or more hints. Hints are retrieved in `sort_order` order and returned as an array of strings in the `GET /api/challenges/:id` response:

```json
{
  "hints": [
    "Check that the flag you are using matches the Docker documentation exactly.",
    "The -d flag runs the container in detached mode. Without it, your terminal is locked.",
    "Your full command should start with: docker run -d"
  ]
}
```

---

## Hint quantity

| Challenge difficulty | Recommended hints |
|---------------------|-------------------|
| Beginner | 2–3 |
| Intermediate | 2–3 |
| Advanced | 3–4 |

Beginner challenges do not get fewer hints than intermediate ones — beginners are more likely to get stuck and less likely to know where to look. The difference is in the specificity of the hints, not the quantity.

---

## Hint writing principles

### Progressive disclosure

Hints must be ordered from least to most revealing. A learner reveals them one at a time, trying to proceed after each. The sequence should feel like: "I can probably figure it out now" → "OK I'm still stuck but I know what to check" → "I have everything I need, I just have to do it."

### One piece of information per hint

Each hint gives the learner one new thing to work with. A hint that gives three pieces of information at once defeats the purpose — the learner did not solve three problems, they were told three things.

**Bad:** "The command is docker run, you need to add -d for background mode and -p for ports, and the image name goes at the end."

**Good (three separate hints):**
1. "Look at the command you are running and check whether it includes a flag that runs the container in the background."
2. "The -d flag is what detaches the container from your terminal. Without it, you cannot type other commands while the container is running."
3. "The port mapping flag follows the format: host_port:container_port. If you want to reach port 80 inside the container on port 8080 of your machine, the flag would be -p 8080:80."

### Specific, not generic

Generic hints waste the learner's time. "Read the documentation" is not a hint. "Check the Docker documentation for the `docker run` command and look at the -p flag" is a hint.

A good hint contains enough specificity that a learner can immediately go and act on it.

### Confirm the direction, not the answer

A hint can confirm that the learner is looking in the right place without giving the answer:
- "You are right that the Dockerfile is where this change belongs."
- "The flag you identified is correct — check that the port numbers are in the right order."
- "That error message means Docker cannot find the image locally. That is expected — check what Docker does next."

### No apologetics

Hints do not apologise for not giving the answer. They do not say "I can't tell you the answer, but...". They simply give the next useful piece of guidance without preamble.

---

## Frontend hint UI

The current implementation displays hints in an accordion on the challenge detail page. The learner must actively click to reveal each hint. They are not visible by default.

Design principles for the hint UI:
- **Friction is intentional.** The learner should feel a small resistance before revealing a hint — it signals that revealing a hint means pausing and reading it carefully.
- **No countdown or delay.** Artificial delays ("reveal hint in 10 seconds") are patronising. The friction is the click, not the wait.
- **Hints are numbered.** "Hint 1 of 3" gives the learner a sense of how much help is available.
- **Previously revealed hints stay visible.** Once a hint is revealed, it does not hide again when the learner moves on the page.

---

## AI-generated hints

When the AI mentor is implemented (see `09_AI_MENTOR_DESIGN.md`), it will supplement stored hints with dynamically generated guidance. The stored hints serve as the baseline — they are always available, consistent, and reviewed. The AI mentor adds depth for learners who need more specific help.

The AI mentor will be instructed to follow the same hint writing principles above. It will have access to:
- The challenge content
- The stored hints (so it does not repeat them)
- The learner's question (what specifically they are stuck on)

The AI mentor will not replace stored hints — it augments them.

---

## Authoring hints for new challenges

When writing hints for a new challenge:

1. **Do the challenge yourself** first. Write down where you had to think carefully or where a beginner might get confused.
2. **Write a hint for each confusion point**, in order of how likely a beginner is to encounter it.
3. **Test each hint in isolation.** Cover the later hints and ask: with only this hint, would a learner who is stuck know what to do next? If not, add more specificity.
4. **Check for answer leakage.** Read the last hint and ask: could someone complete the challenge using only this hint without understanding why? If yes, pull it back.

---

## Hint quality checklist

Before adding a hint to a challenge:

- [ ] It gives one piece of information, not three
- [ ] It is specific enough to act on immediately
- [ ] It does not give away the final answer
- [ ] It would not make sense as the first hint (progressive order matters)
- [ ] It is under 3 sentences
- [ ] It uses plain language a beginner can understand
