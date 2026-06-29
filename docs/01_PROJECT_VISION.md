# 01 — Project Vision

**Document status:** Complete  
**Last updated:** June 2026

---

## The north star

DevOps Forge exists to make DevOps engineering accessible to anyone willing to do the work.

Not accessible in the sense of being easy — DevOps is genuinely hard, and pretending otherwise does learners a disservice. Accessible in the sense of being navigable. The tools, concepts, and mental models that define modern infrastructure work are not mysteries. They can be learned systematically by anyone with time, curiosity, and a clear path to follow.

Today that path does not exist in one place. It is scattered across documentation pages, YouTube videos, blog posts from 2017, forum threads, and certification prep courses that teach for the exam rather than for the job. A beginner has to assemble the path themselves before they can walk it — and most never get that far.

DevOps Forge is the path.

---

## What the platform is trying to become

A mentor. Not a course. Not a reference manual. Not a quiz app.

A mentor knows where you are. It does not give you chapter three until you have understood chapter two. It does not overwhelm you with everything at once. It remembers what you have already done, recognises where you are stuck, and gives you the next right thing to do. When you ask a question, it gives you a real answer — one that explains the why, not just the what.

In the current version, the platform approximates this through structured curriculum design: modules that unlock in the right order, challenges that build on each other, and documentation that explains the reasoning behind every command. In a future version, a language model will provide the contextual responsiveness that makes mentorship feel personal.

The goal is that a learner who finishes the full curriculum — all seven modules, all challenges, all documentation — can sit in an engineering interview or join a team and contribute from day one. Not perform. Contribute.

---

## Why this matters

The DevOps skills gap is real and growing. Organisations at every scale need people who can build and maintain CI/CD pipelines, manage cloud infrastructure, containerise applications, and reason about distributed systems. These are not rare or niche skills — they are baseline requirements for modern software teams.

At the same time, the hiring bar for entry-level DevOps roles has risen faster than the availability of clear learning paths. Junior engineers are expected to know Docker, know Kubernetes, understand IAM, have worked with Terraform — before they have had a job in which they could learn any of those things. The catch-22 is real.

DevOps Forge is one answer to that. It gives learners a structured, hands-on, progressively challenging curriculum that they can complete on their own time, at their own pace, producing real evidence of capability — not just a certificate.

---

## The learner we are building for

Her name is not important. She is 24 or 34 or 44. She may have a degree in something unrelated to software, or she may be a self-taught developer who has been writing application code for two years and now wants to understand what happens after the code is pushed. She is motivated. She is not intimidated by hard work. But she has been burned by resources that started well and then assumed knowledge she did not have, or that taught her commands without explaining why they worked.

She needs a resource that:
- Starts at the very beginning without condescension
- Explains the reasoning, not just the recipe
- Gives her something concrete to do — not just something to read
- Makes it clear she is making progress
- Does not waste her time with things she does not need yet

DevOps Forge is built for her. Every feature decision, every content decision, every design decision is filtered through the question: does this help her make progress?

---

## What success looks like

**For the learner:** A person who arrives knowing nothing about infrastructure can, after completing the curriculum, confidently set up a CI/CD pipeline, containerise an application, provision cloud resources with Terraform, and deploy to Kubernetes. More importantly, they understand why each of those things works the way it does and can troubleshoot when something goes wrong.

**For the platform:** The platform becomes the resource that DevOps learners recommend to each other — not because it is flashy, but because it actually works. Completion rates are high because the content is good and the experience is designed to sustain motivation over weeks and months, not just the first session.

**For the field:** A small but real contribution toward making infrastructure skills more broadly distributed. Not just among people who already had access to mentors, coding bootcamps, or expensive certifications.

---

## What this platform will not become

- A social network or community forum (there are better tools for that)
- A job board or recruiter marketplace
- A certification authority
- A tool for experienced engineers seeking advanced reference material
- A passive learning experience built around video lectures
- A platform that teaches multiple ways to do the same thing without guiding the learner toward a clear choice

These are not failures of ambition. They are deliberate constraints that keep the platform focused on the one thing it does: teach DevOps to beginners, well.

---

## Guiding principles for every future decision

When a new feature, content piece, or design change is proposed, it should be evaluated against these questions:

1. **Does it help a beginner make progress?** If the primary beneficiary is an advanced user, it is probably out of scope for now.
2. **Does it reduce or increase cognitive load?** Every feature that makes the interface more complex has to earn its place by reducing confusion elsewhere.
3. **Is this the right time?** Many good ideas belong in v2 or v3. Shipping sooner with less is almost always better than shipping later with more.
4. **Does it make the learning more concrete?** Abstract explanations without something to do are less valuable than concrete challenges without full explanations. When in doubt, bias toward doing.
5. **Does it respect the learner's time?** The learner is fitting this into a life. Nothing should be padded, repeated unnecessarily, or designed to extend engagement at the expense of actual learning.
