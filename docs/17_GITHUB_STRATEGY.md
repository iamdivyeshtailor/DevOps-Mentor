# 17 — GitHub Strategy

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

This document describes the strategy for using GitHub with DevOps Forge: repository structure, branching conventions, commit standards, pull request process, and release management.

The platform is currently developed on Replit with version control managed through Replit's checkpoint system. When the repository is connected to GitHub, this document defines how that connection is used.

---

## Repository

**Repository name:** `devops-forge`  
**Visibility:** Private (until the platform is ready for public release)  
**Default branch:** `main`  
**Branch protection:** `main` is protected — direct pushes are not allowed when there are multiple contributors

---

## Branching strategy

### For solo development

When there is one author, all work happens directly on `main`. Replit's checkpoint system provides rollback capability. Feature branches are used optionally for larger changes that benefit from isolation.

### For collaborative development

A simple trunk-based branching model:

```
main
  ├── feature/challenge-content-docker
  ├── feature/module-unlock-logic
  ├── fix/xp-calculation-edge-case
  └── docs/fill-scoring-engine
```

**Branch naming:**
- `feature/<short-description>` — new functionality
- `fix/<short-description>` — bug fixes
- `docs/<short-description>` — documentation only
- `chore/<short-description>` — maintenance (dependency updates, config changes)
- `refactor/<short-description>` — code restructuring without behaviour change

Branches are created from `main` and merged back to `main` via pull request. Long-lived feature branches are discouraged — prefer small, frequent merges.

---

## Commit conventions

All commits follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `chore` | Build process, dependency updates, tooling |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `style` | Formatting, whitespace, missing semicolons (no logic change) |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |

### Scope (optional)

The scope narrows the context:
```
feat(challenges): add hint reveal animation
fix(progress): correct XP calculation for edge case at level boundary
docs(curriculum): expand Docker module challenge plan
chore(deps): update drizzle-orm to 0.38
```

### Examples of good commit messages

```
feat: add module unlock based on XP threshold
fix: prevent duplicate progress record on rapid double-click
docs: populate 08_DEVOPS_CURRICULUM with full module plans
chore: regenerate API client after adding activity feed endpoint
refactor: extract xpToLevel into shared utility module
style: align sidebar icon sizes with design system
```

### Examples of bad commit messages

```
update stuff
fix bug
WIP
asdfgh
changes
more content
```

---

## Pull request process

### PR description template

```markdown
## What this changes
<!-- One paragraph describing what this PR does and why -->

## Type of change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactor
- [ ] Chore

## Checklist
- [ ] pnpm run typecheck passes
- [ ] Codegen run if spec changed
- [ ] DB push run if schema changed
- [ ] README and docs updated if architecture changed
- [ ] No console.log in server code
- [ ] No edits to generated files
```

### Review requirements

- **Solo development:** no PR review required — merge directly
- **Collaborative development:** at least one approval required before merge
- **Automated checks** must pass (typecheck, lint, tests) before merge is allowed

### Merge strategy

Use **squash merge** for feature branches. This produces a clean linear history on `main` — one commit per PR, with the PR description becoming the commit message.

Use **merge commit** for release branches or significant milestones where the commit history within the branch is meaningful.

---

## Release tagging

Releases are tagged on `main` using semantic versioning:

```
v1.0.0   — initial public release
v1.1.0   — new features (module unlock, more challenges)
v1.1.1   — bug fixes only
v2.0.0   — breaking change (authentication, multi-user)
```

### Creating a release

```bash
git tag -a v1.1.0 -m "Release v1.1.0 — module unlock and expanded challenge library"
git push origin v1.1.0
```

A GitHub Release is created from the tag with a changelog summarising changes since the previous release. The changelog is generated from conventional commit messages.

---

## GitHub Issues

Issues are used to track planned work, bugs, and content requests.

### Labels

| Label | Usage |
|-------|-------|
| `bug` | Something is broken |
| `feature` | New functionality |
| `content` | New challenge, hint, or documentation to write |
| `docs` | Handbook documentation to fill or update |
| `chore` | Maintenance, dependency updates |
| `good first issue` | Suitable for a new contributor |

### Issue templates

Two templates:
1. **Bug report** — steps to reproduce, expected behaviour, actual behaviour, environment
2. **Feature / content request** — description, motivation, proposed solution

---

## GitHub Actions integration

See `15_CI_CD.md` for the full CI/CD pipeline design. From a GitHub perspective:

- Workflows live in `.github/workflows/`
- Secrets are stored in GitHub repository secrets (mirroring the Replit secrets)
- The `GITHUB_TOKEN` is used for creating releases and pushing to the container registry
- No third-party GitHub Apps beyond Dependabot for dependency updates

---

## Repository hygiene

### `.gitignore`

The root `.gitignore` includes:
```
node_modules/
dist/
.tsbuildinfo
*.map
.env
.env.local
.env.*.local
```

Generated files in `lib/api-client-react/` and `lib/api-zod/` are **not** gitignored — they are committed so that contributors do not need to run codegen on first clone. This is a deliberate tradeoff.

### Stale branch cleanup

Merged feature branches are deleted after merge. Replit keeps its own copy of the code — GitHub branches that have been merged serve no purpose.

### README as the entry point

The root `README.md` is always kept current. It is the first thing GitHub displays when anyone opens the repository. If it is out of date, update it as part of the next PR.
