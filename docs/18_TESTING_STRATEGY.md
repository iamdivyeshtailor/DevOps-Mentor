# 18 — Testing Strategy

**Document status:** Complete  
**Last updated:** June 2026

---

## Current state

DevOps Forge v1 has no automated test suite. The TypeScript compiler is the primary quality gate — it catches shape mismatches, missing properties, and type errors across the codebase. Manual testing is performed by running the application and verifying behaviour in the browser.

This is acceptable for a single-author platform in early development. As the codebase grows and contributors join, an automated test suite becomes necessary.

---

## Testing philosophy

### Test behaviour, not implementation

Tests should describe what the system does from the outside — not how it does it internally. A test for the progress summary endpoint should assert that the response contains the right XP total and level, not that a specific internal function was called.

Implementation tests are brittle — they break when code is refactored even if the behaviour is unchanged. Behaviour tests survive refactoring.

### Favour integration over unit for the API

The most valuable tests for an Express API are integration tests that make real HTTP requests against a running server with a real (test) database. Unit tests for individual functions are useful but should not be the primary testing strategy for an API.

The reason: the most common API bugs involve the interaction between the route handler, the database query, and the response shaping. A unit test that mocks the database misses exactly the bugs that matter most.

### Keep tests fast

Slow tests do not get run. The test suite should complete in under 60 seconds for the full integration suite. Unit tests should be under 5 seconds.

---

## Test levels

### Level 1 — TypeScript compiler (current)

The existing quality gate. Catches:
- Type mismatches between frontend expectations and API response shapes
- Missing required fields
- Wrong function signatures
- Imports of non-existent exports

This runs on every `pnpm run typecheck`. It is not optional.

### Level 2 — Unit tests (planned, v1.1)

Unit tests for pure functions that have clear inputs and outputs:

| Function | Test cases |
|----------|-----------|
| `xpToLevel(xp)` | All level boundaries, above max level, 0 XP |
| XP-to-progress-bar calculation | 0%, 50%, 100%, above max level |
| Challenge sort order computation | Empty array, single item, multiple items |
| Module unlock threshold checks | Below threshold, at threshold, above threshold |

**Tool:** Vitest (fast, works natively with TypeScript, compatible with pnpm workspaces)

```bash
pnpm --filter @workspace/api-server run test
```

### Level 3 — API integration tests (planned, v1.1)

Integration tests make real HTTP requests against a running Express server connected to a test PostgreSQL database. The test database is seeded before each test run and torn down after.

**Tool:** Vitest + `supertest` for HTTP assertions

**Test database setup:**
- A separate test database is provisioned (same schema, different data from production)
- Schema is applied with `drizzle-kit push` targeting the test database
- A seed function populates known test data before the suite runs
- Each test can rely on this baseline state

**Example test:**

```typescript
describe("GET /api/progress/summary", () => {
  it("returns zero XP and level 1 for a learner with no completions", async () => {
    const response = await request(app).get("/api/progress/summary");
    expect(response.status).toBe(200);
    expect(response.body.totalXp).toBe(0);
    expect(response.body.level).toBe(1);
    expect(response.body.levelName).toBe("Apprentice");
  });

  it("awards XP correctly after challenge completion", async () => {
    // Complete challenge 1 (50 XP)
    await request(app).post("/api/challenges/1/complete");
    const response = await request(app).get("/api/progress/summary");
    expect(response.body.totalXp).toBe(50);
    expect(response.body.completedChallenges).toBe(1);
  });
});
```

**Coverage targets (v1.1):**

| Endpoint | Tests |
|----------|-------|
| GET /api/healthz | Basic liveness |
| GET /api/modules | Returns all modules, counts are correct |
| GET /api/modules/:id | Returns module with challenges, 404 for missing |
| GET /api/challenges | Filters by moduleId and difficulty |
| GET /api/challenges/:id | Returns content and hints, 404 for missing |
| POST /api/challenges/:id/complete | Awards XP, idempotent on re-call, 404 for missing |
| GET /api/progress/summary | Correct XP, level, counts after completions |
| GET /api/progress/activity | Returns recent completions in order |
| GET /api/docs/topics | Filters by moduleId |
| GET /api/docs/topics/:id | Returns content, 404 for missing |

### Level 4 — End-to-end tests (planned, v2)

E2E tests use a headless browser to test user flows from the UI layer. They are the slowest and most expensive tests — reserved for critical paths.

**Tool:** Playwright

**Critical paths to test:**
- Learner visits dashboard → sees correct level and XP
- Learner opens a module → sees challenge list with correct completion states
- Learner opens a challenge → reads content → reveals hints → marks complete → XP updates on dashboard

E2E tests are not planned for v1. They will be added when the core user flows are stable.

---

## Test file organisation

```
artifacts/api-server/
└── src/
    └── routes/
        └── __tests__/
            ├── modules.test.ts
            ├── challenges.test.ts
            ├── progress.test.ts
            └── docs.test.ts

lib/
└── db/
    └── src/
        └── __tests__/
            └── seed.ts         Test database seeding helpers
```

Test files live next to the code they test, in a `__tests__/` directory. Vitest discovers them automatically.

---

## Running tests

```bash
# All tests
pnpm run test

# Specific package
pnpm --filter @workspace/api-server run test

# With coverage
pnpm --filter @workspace/api-server run test --coverage

# Watch mode (during development)
pnpm --filter @workspace/api-server run test --watch
```

---

## What is not tested

- **Generated code** — files in `lib/api-client-react/` and `lib/api-zod/` are not tested directly; they are trusted to be correct because they are generated from a spec that Orval handles correctly
- **Database schema** — schema correctness is validated by `drizzle-kit push` and the TypeScript compiler
- **UI components in isolation** — Storybook-style component tests are not planned for v1; the complexity does not justify the setup cost at this scale
- **Third-party services** — the LLM integration (when built) is tested with mocks in unit tests and with real calls in a separate manual test environment

---

## CI integration

Tests run automatically in the GitHub Actions CI pipeline (see `15_CI_CD.md`):

- Unit tests run on every push
- Integration tests run on PRs to `main` using a PostgreSQL service container
- Coverage reports are uploaded as CI artifacts (not gating, but informational)
- The pipeline fails if any test fails

Test failures block merging. There are no exceptions — a failing test means the code is wrong or the test is wrong, and either way it must be resolved before merging.
