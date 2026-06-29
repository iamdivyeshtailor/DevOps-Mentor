# 15 — CI/CD

**Document status:** Complete  
**Last updated:** June 2026

---

## Current state

DevOps Forge v1 has no automated CI/CD pipeline. Deployments are triggered manually through Replit's publish workflow. There is no automated test suite, no linting enforcement, and no staging environment.

This is acceptable for a single-author platform in early development, where the cost of pipeline setup exceeds the benefit. As the project grows — especially when collaborators are added — CI/CD becomes essential.

This document describes the planned CI/CD design.

---

## Why CI/CD matters for this project

There is a certain irony in a DevOps learning platform not having a CI/CD pipeline of its own. Beyond the practical benefits (catching errors before they reach production), setting up a real pipeline for this project serves as a working example of what the curriculum teaches. The pipeline becomes documentation.

---

## Planned pipeline design

### Trigger events

| Event | Pipeline |
|-------|---------|
| Push to any branch | Typecheck + lint |
| Pull request to `main` | Typecheck + lint + tests |
| Merge to `main` | Typecheck + lint + tests + deploy to staging |
| Manual trigger | Deploy to production |

### Stages

```
┌─────────────┐
│    Lint     │  ESLint, Prettier check
└──────┬──────┘
       │
┌──────▼──────┐
│  Typecheck  │  pnpm run typecheck (all packages)
└──────┬──────┘
       │
┌──────▼──────┐
│    Test     │  Unit + integration tests (when written)
└──────┬──────┘
       │
┌──────▼──────┐    ← only on merge to main
│   Build     │  pnpm --filter @workspace/api-server run build
└──────┬──────┘    pnpm --filter @workspace/devops-forge run build
       │
┌──────▼──────┐
│  Deploy     │  Push to Replit production
└─────────────┘
```

### GitHub Actions implementation

The pipeline will live in `.github/workflows/`. Two workflows:

**`.github/workflows/ci.yml`** — runs on every push and PR:
```yaml
name: CI

on:
  push:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @workspace/api-spec run codegen
      - run: pnpm run typecheck
```

**`.github/workflows/deploy.yml`** — runs on merge to `main`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    needs: [check]  # references the CI workflow
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Replit deployment steps (to be defined)
```

---

## Linting

### ESLint

ESLint enforces code quality rules across the monorepo. A root `.eslintrc` extends `eslint:recommended` and `@typescript-eslint/recommended`. Key rules:

- `no-console` — error in server code, warning in frontend (enforces the pino logging convention)
- `@typescript-eslint/no-explicit-any` — error (enforces type safety)
- `@typescript-eslint/no-unused-vars` — error

### Prettier

Prettier enforces consistent formatting. A root `.prettierrc` defines:
- 2-space indentation
- Single quotes
- Trailing commas in multi-line structures
- 100-character line width

Prettier runs as a check in CI (not auto-format) — contributors are expected to run it locally or have editor integration.

---

## Test strategy overview

See `18_TESTING_STRATEGY.md` for the full test plan. In the context of CI/CD:

- **Unit tests** run in every CI job — fast, no database required
- **Integration tests** run on PR to `main` — require a test database
- **End-to-end tests** are not planned for v1

The CI database is provisioned as a PostgreSQL service container in the GitHub Actions job, seeded from the schema push, and torn down after the job.

---

## Environment management

### Development

Runs in Replit. Secrets are managed through Replit's secrets system. The dev database is the Replit-provisioned PostgreSQL instance.

### Staging

A separate Replit deployment (or a separate Replit project) used to validate changes before production. Uses its own database. Content is a copy of production data, refreshed periodically.

Staging is not yet set up — it is planned alongside the CI pipeline.

### Production

The Replit-published deployment. The production database is separate from development. Schema changes are applied manually before deploying code changes that depend on them (until automated migration is implemented).

---

## Deployment process (current — manual)

1. Ensure `pnpm run typecheck` passes locally
2. Commit and push all changes
3. In Replit, click the Publish/Deploy button
4. Verify the deployed application with a smoke test (navigate to `/`, `/modules`, `/api/healthz`)

### Deployment process (planned — automated)

1. Push to `main` branch
2. CI pipeline runs typecheck and tests
3. If all checks pass, deployment to staging is triggered automatically
4. Smoke tests run against staging
5. If staging is healthy, manual trigger deploys to production

---

## Rollback

Replit maintains deployment history. To roll back:
1. Open the Deployments section in Replit
2. Select the previous successful deployment
3. Redeploy it

Database schema rollback is not automated. If a schema change caused the issue, manually revert it using Drizzle or raw SQL, then redeploy the matching application version.

This is why schema changes and application changes should be deployed in separate steps — it makes rollback of either component independent.
