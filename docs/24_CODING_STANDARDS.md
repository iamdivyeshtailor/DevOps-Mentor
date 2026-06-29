# 24 — Coding Standards

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

These standards apply to all code in the DevOps Forge repository. They exist to make the codebase consistent, readable, and maintainable as it grows — whether maintained by one person or many. They are not arbitrary preferences; each rule has a reason.

When in doubt, follow the existing code. Consistency within the codebase outranks personal preference.

---

## TypeScript

### Strict mode, always

All packages extend `tsconfig.base.json`, which enables TypeScript's strict mode. This means:
- `strict: true` (enables `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, and more)
- `noUncheckedIndexedAccess: true` — array indexing returns `T | undefined`, not `T`

There are no exceptions. If the compiler is unhappy, fix the code.

### No `any`

`any` disables the type system. It is not used. If you find yourself reaching for `any`, ask:
- Can I use `unknown` instead and narrow the type before using it?
- Can I define a proper interface for this shape?
- Is there a generated type I should be using?

Type assertions (`as SomeType`) are allowed only when there is a documented reason. Add a comment explaining why the assertion is safe.

### Prefer `type` over `interface` for object shapes

```typescript
// Preferred
type User = {
  id: number;
  name: string;
};

// Acceptable but not preferred
interface User {
  id: number;
  name: string;
}
```

`interface` is used only when you need declaration merging (rare) or when implementing a class interface. For plain data shapes, `type` is preferred.

### Explicit return types on exported functions

Functions exported from modules declare their return type explicitly:

```typescript
// Correct
export function xpToLevel(xp: number): LevelInfo { ... }

// Incorrect — implicit return type
export function xpToLevel(xp: number) { ... }
```

Private/internal functions may omit return types when they are obvious.

### Avoid non-null assertions (`!`)

```typescript
// Incorrect
const value = someMap.get(key)!;

// Correct
const value = someMap.get(key);
if (!value) throw new Error(`Key ${key} not found`);
```

Non-null assertions hide bugs. Check explicitly and handle the null/undefined case.

---

## Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Variables | camelCase | `challengeId`, `totalXp` |
| Functions | camelCase | `xpToLevel`, `getModuleProgress` |
| React components | PascalCase | `ChallengeDetail`, `AppSidebar` |
| Types and interfaces | PascalCase | `ProgressSummary`, `Module` |
| Enums | PascalCase | `Difficulty` |
| Constants | SCREAMING_SNAKE_CASE for true constants | `MAX_LEVEL`, `XP_LEVELS` |
| Database tables | snake_case | `challenge_hints`, `doc_topics` |
| Database columns | snake_case | `module_id`, `xp_reward` |
| Files | kebab-case (not used here — camelCase for TS files) | `AppLayout.tsx`, `progress.ts` |

### Meaningful names

Names should communicate purpose. Abbreviations are allowed only when they are universally understood (`id`, `xp`, `url`).

```typescript
// Incorrect
const m = await db.select().from(modulesTable);
const c = m.map(x => ({ ...x, tc: 0 }));

// Correct
const modules = await db.select().from(modulesTable);
const modulesWithCounts = modules.map(m => ({ ...m, totalChallenges: 0 }));
```

---

## Server code (Express routes)

### Logging

**Never use `console.log` or `console.error` in server code.**

Inside route handlers, use `req.log`:
```typescript
req.log.info({ moduleId: id }, "Fetching module");
req.log.error({ err }, "getModule error");
```

Outside request context, use the `logger` singleton:
```typescript
import { logger } from "../logger";
logger.info({ port }, "Server listening");
```

Pino log levels:
- `trace` — highly detailed diagnostic info (rarely used)
- `debug` — detailed info useful during development
- `info` — normal operation events
- `warn` — unexpected but recoverable
- `error` — failures that need attention

### Error handling

Every route handler wraps its logic in try/catch:

```typescript
router.get("/:id", async (req, res) => {
  try {
    // ... business logic
  } catch (err) {
    req.log.error({ err }, "getModule error");
    res.status(500).json({ error: "Internal server error" });
  }
});
```

Never let an unhandled exception reach Express's default error handler — it leaks stack traces to clients.

### Early returns for 404

```typescript
const [module] = await db.select().from(modulesTable).where(eq(modulesTable.id, id));
if (!module) return void res.status(404).json({ error: "Not found" });
```

Use `return void res...` to satisfy TypeScript and avoid fall-through. This is the established pattern in this codebase.

### Input validation

Parse and validate path parameters before using them:

```typescript
const id = parseInt(req.params.id, 10);
if (isNaN(id)) return void res.status(404).json({ error: "Not found" });
```

For request bodies (when authentication is added), use generated Zod schemas.

---

## Frontend code (React)

### Component structure

```typescript
// 1. Imports
import { useGetChallenge } from "@workspace/api-client-react";

// 2. Types (if any, local to this file)
type Props = { id: number };

// 3. Component
export function ChallengeDetail({ id }: Props) {
  // 4. Hooks at the top
  const { data: challenge, isLoading } = useGetChallenge(id, {
    query: { enabled: !!id, queryKey: getGetChallengeQueryKey(id) },
  });

  // 5. Loading state
  if (isLoading) return <LoadingSkeleton />;

  // 6. Empty state
  if (!challenge) return <EmptyState message="Challenge not found" />;

  // 7. Render
  return <div>...</div>;
}
```

### Hooks must be called unconditionally

```typescript
// Incorrect — hook called conditionally
if (id) {
  const { data } = useGetChallenge(id);
}

// Correct — hook called unconditionally, condition in options
const { data } = useGetChallenge(id, {
  query: { enabled: !!id },
});
```

### No inline styles

Tailwind utility classes only. If a style cannot be expressed with Tailwind, add a custom class in `index.css`.

```typescript
// Incorrect
<div style={{ backgroundColor: "#0a0f1a", padding: "16px" }}>

// Correct
<div className="bg-background p-4">
```

### No emojis

No emojis anywhere in the UI — in component text, button labels, empty states, error messages, or any other user-facing string. This is a platform design principle, not a preference.

### Data fetching with generated hooks

Always import hooks from `@workspace/api-client-react`. Never write `fetch()` calls by hand in components.

```typescript
// Correct
import { useListModules, getListModulesQueryKey } from "@workspace/api-client-react";

// Incorrect
const modules = await fetch("/api/modules").then(r => r.json());
```

---

## Database code

### No raw SQL in route handlers

All database access uses the Drizzle query builder. Raw SQL strings are not used in application code.

```typescript
// Correct
const modules = await db.select().from(modulesTable).orderBy(modulesTable.sortOrder);

// Incorrect
const modules = await db.execute(sql`SELECT * FROM modules ORDER BY sort_order`);
```

### No string interpolation in SQL

Never interpolate values into SQL strings. Always use parameterised queries or the Drizzle query builder.

```typescript
// Correct
await db.select().from(challengesTable).where(eq(challengesTable.id, id));

// Incorrect — SQL injection risk
await db.execute(sql.raw(`SELECT * FROM challenges WHERE id = ${id}`));
```

---

## File organisation

- One component per file
- One router per file in `routes/`
- One table per file in `schema/`
- Export from index files for clean imports

---

## Comments

Comments explain *why*, not *what*. The code explains what. Comments explain reasoning that is not obvious from reading the code.

```typescript
// Correct — explains a non-obvious decision
// Use void to satisfy TypeScript's "consistent return" rule in async route handlers
return void res.status(404).json({ error: "Not found" });

// Incorrect — redundant with the code
// Returns 404 if module not found
if (!module) return void res.status(404).json({ error: "Not found" });
```

Commented-out code is not committed. If code is removed, it is removed. Git history preserves it.

---

## Formatting

Prettier handles formatting automatically. The configuration is in `.prettierrc` at the root. Key settings:
- 2-space indentation
- Single quotes
- Trailing commas in multi-line structures
- 100-character line width

Run Prettier before committing or configure your editor to format on save. The CI pipeline checks formatting — a PR with unformatted code will not pass.
