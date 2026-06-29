# 09 — AI Mentor Design

**Document status:** Complete  
**Last updated:** June 2026

---

## Vision

The name "DevOps Forge" and the tagline "AI-assisted learning platform" both point toward a future where the platform does not just present content — it responds. The AI mentor is the feature that transforms the platform from a structured curriculum into something closer to a personal tutor.

A mentor knows where you are. It knows what you have already learned. It can answer the question you did not know how to ask. It gives you exactly as much help as you need — not so little that you are blocked, not so much that you do not learn.

This document describes the design for the AI mentor feature: what it will do, how it will behave, how it will be implemented, and where the boundaries are.

---

## What the AI mentor will do

### Contextual Q&A inside challenges

The primary interface is a conversational panel available on the challenge detail page. When a learner is working through a challenge and gets confused, they can type a question in natural language.

Examples of questions the mentor should answer well:
- "What does the -d flag actually do?"
- "Why does Docker need to download the image before running it?"
- "I ran the command but nothing happened. What should I check?"
- "What is the difference between COPY and ADD in a Dockerfile?"

The mentor answers in plain language, calibrated to a beginner, and always aware of which challenge and module the learner is currently on.

### Progressive hint delivery

Hints are currently stored in the database and revealed statically. The AI mentor will augment this by generating contextually appropriate hints when the stored hints are not enough — or when the learner asks for a hint in their own words ("I'm stuck on the port mapping part specifically").

### Concept explanation on demand

When a learner reads a documentation topic and encounters a concept they do not understand, they can ask the mentor to explain it. The mentor explains it in the context of what the learner already knows, using examples from earlier challenges they have completed.

### Encouragement and orientation

When a learner completes a challenge, the mentor can offer a brief acknowledgement and orient them toward what comes next. When a learner has not returned in a few days, the mentor can surface where they left off. This is the "patient" quality of a mentor — noticing and responding to where the learner is, not just what they asked.

---

## What the AI mentor will not do

### Give away answers

The mentor does not complete the challenge for the learner. If a learner asks "just tell me the answer", the mentor declines and redirects toward a hint. It explains why: the point of the challenge is to do it, and being told the answer prevents learning.

The mentor is allowed to confirm that an approach is correct or incorrect — it can say "you're close, that flag is in the right place but the port numbers are reversed" — but it will not paste a complete working solution.

### Invent content outside its knowledge

The mentor does not speculate about topics it has not been given reliable context for. If asked about a technology not in the curriculum, it acknowledges the limits of its context and suggests the learner consult the official documentation.

### Replace the written curriculum

The AI mentor supplements the structured content; it does not replace it. Challenges, documentation, and the progression system remain the backbone of the learning experience. The mentor makes those better — it does not make them optional.

---

## Implementation plan

### Phase 1 — Context assembly (backend)

Before the AI mentor can respond helpfully, it needs context. A new API endpoint will accept a question along with:
- The current challenge ID (which module, which difficulty, what content)
- The challenges the learner has completed (what they already know)
- The current documentation topic (if the question comes from a doc page)

The server assembles a structured context object and sends it to the LLM along with the question.

### Phase 2 — LLM integration

The server calls an LLM via Replit's AI integration proxy. The model receives:
- A system prompt that defines the mentor persona (see below)
- The assembled context (challenge content, learner history, relevant hints)
- The learner's question

The response is streamed back to the client.

### Phase 3 — Frontend interface

A collapsible mentor panel is added to the challenge detail page. It contains:
- A short prompt ("Ask your mentor anything about this challenge")
- A text input
- A scrollable conversation history for the current session
- The mentor's response, streamed in as it arrives

The conversation history is session-local — it does not persist across page refreshes in v1.

### Phase 4 — Hint integration

When the mentor generates a hint, it uses the same hint design principles as the stored hints: narrow the search space, do not give the full answer. The stored hints remain as a structured fallback, but the mentor can go deeper in response to specific follow-up questions.

---

## The mentor persona

The system prompt that shapes the mentor's behavior will include the following:

**Identity:** You are the DevOps Forge mentor — a patient, knowledgeable guide for people learning DevOps from scratch. You communicate clearly and without jargon unless a technical term is necessary, in which case you define it.

**Tone:** Calm, encouraging, and direct. You are not sycophantic ("great question!"), but you are supportive. You treat the learner as intelligent but inexperienced.

**Scope:** You answer questions about the current challenge, the module it belongs to, and concepts that the learner has already covered. You do not fabricate technical answers about topics outside the curriculum.

**Hints:** When a learner asks for help, you guide rather than reveal. You give the next useful piece of information — not the complete answer.

**Boundaries:** If a learner asks for the answer directly, you explain that you will not give it because the value is in doing it themselves, and you redirect toward a more specific question.

---

## LLM selection

Replit's AI integration supports multiple models via a shared proxy. The mentor will use one of:
- Anthropic Claude (strong at instruction-following, consistent tone)
- Google Gemini (available via Replit AI integrations)
- OpenAI GPT-4o (widely understood baseline)

The model choice should be configurable via an environment variable so it can be changed without a code deployment. The prompt engineering should be model-agnostic where possible.

---

## Data and privacy considerations

### What is sent to the LLM

- Challenge content (already public within the platform)
- The learner's completion history (which challenges they have done)
- The learner's question

### What is never sent

- Any personally identifiable information (when auth is added, user IDs are not sent — only anonymous progress context)
- Any credentials or secrets from the learner's environment

### Logging

LLM requests and responses are logged at the server with the full prompt and response for debugging purposes. These logs must be kept private and rotated regularly. When the platform becomes multi-user, logging must be reviewed for privacy compliance.

---

## Success criteria

The AI mentor is considered successful when:
- A learner who is stuck on a challenge can get unstuck without leaving the platform to search the web
- The mentor's answers consistently feel helpful rather than generic
- Fewer learners abandon challenges mid-way through
- The mentor never gives away challenge answers, confirmed through manual review of conversation logs
