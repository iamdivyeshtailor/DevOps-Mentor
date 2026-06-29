# 14 — Security

**Document status:** Complete  
**Last updated:** June 2026

---

## Current security posture (v1)

DevOps Forge v1 is a single-user learning platform with no authentication. The attack surface is limited. That said, basic security hygiene is applied throughout, and this document describes the current posture and the requirements for future versions.

---

## What is protected

### Secret management

No secrets appear in source code or committed files. All environment variables — database connection strings, session secrets — are managed through Replit's secrets system. The application reads them from the environment at startup and fails explicitly if a required variable is missing.

`.env` files are not used and are listed in `.gitignore` as a safeguard. The `SESSION_SECRET` environment variable is provisioned in Replit's secrets system even though it is not used in v1 — it will be needed when session-based auth is added and having it ready avoids a deployment step.

### SQL injection prevention

All database queries go through Drizzle ORM. Drizzle generates parameterised queries — user-controlled values are never interpolated into SQL strings. There are no raw SQL queries in the application code.

The only exception is development seed scripts run via `executeSql` in the Replit code execution sandbox. These scripts use parameterised inserts (`params: [...]`) for any user-controlled data. Multi-value inserts (which cannot use the params system) use static literals only.

### Input validation

All API inputs are validated using Zod schemas generated from the OpenAPI spec before any business logic runs. A request that fails validation is rejected with a 400 response before touching the database.

Path parameters (e.g., `:id`) are validated as integers before being used in queries. Non-numeric IDs return 404 immediately.

### Error handling

Route handlers wrap all logic in try/catch. Unhandled exceptions log the full error (including stack trace) and return a generic `{ "error": "Internal server error" }` to the client. Raw error messages and stack traces are never exposed in API responses — they would leak internal implementation details.

---

## v2 security requirements

When authentication is added, the security posture must be strengthened substantially.

### Authentication

- Use an established auth provider (Replit Auth or Clerk) rather than rolling a custom auth system
- Never store passwords — delegate credential management entirely to the auth provider
- Validate ID tokens on every request using the provider's public keys
- Tokens must be short-lived (1 hour) with refresh token rotation

### Authorisation

- All data access is scoped to the authenticated user's ID
- Admin-only routes are protected by middleware that checks the user's role
- Role assignment is done manually by a superadmin — no self-service role escalation
- Audit logs are kept for all admin actions

### HTTPS

- The platform is served exclusively over HTTPS in production (enforced by Replit's hosting)
- HTTP traffic is redirected to HTTPS
- Strict-Transport-Security header is set

### Content Security Policy

A CSP header prevents XSS by restricting which resources the browser can load. The CSP will be:
- `default-src 'self'`
- `script-src 'self'` (no inline scripts, no eval)
- `style-src 'self' 'unsafe-inline'` (Tailwind generates inline styles — this is a known tradeoff)
- `img-src 'self' data:` (data URIs for base64 images)
- `connect-src 'self'` (API calls only to same origin)

### CSRF protection

Session-based auth requires CSRF protection. The recommended approach is the SameSite cookie attribute combined with a CSRF token for state-changing requests.

If stateless JWT auth is used (recommended), CSRF is not a concern — JWTs in Authorization headers are not sent by the browser in cross-origin requests.

### Rate limiting

The API must implement rate limiting in v2 to prevent abuse:
- Challenge completion endpoint: 60 requests per minute per user
- AI mentor endpoint: 20 requests per minute per user (LLM costs)
- All other endpoints: 300 requests per minute per user

Rate limits are implemented in Express middleware using a token bucket or sliding window algorithm.

---

## Dependency security

### Current approach

Dependencies are pinned through the pnpm workspace catalog (`pnpm-workspace.yaml`). Catalog pins prevent accidental upgrades to breaking or vulnerable versions.

Dependency updates should be reviewed before merging — automated tools like Dependabot can propose updates, but a human (or AI assistant) should review each one for breaking changes.

### Audit

```bash
pnpm audit
```

Run periodically and before releases. Address critical and high severity findings before shipping. Medium and low findings should be tracked and addressed in the next maintenance window.

---

## Secrets that must never be committed

| Secret | Description |
|--------|-------------|
| `DATABASE_URL` | PostgreSQL connection string with credentials |
| `SESSION_SECRET` | Secret used to sign session tokens |
| Any LLM API key | If using a third-party LLM directly (prefer Replit's proxy) |
| AWS credentials | If accessing AWS directly from the server |

All of these are managed through Replit's secrets system. The `.gitignore` includes `.env` as a safeguard, but the correct approach is to never put secrets in files at all.

---

## Incident response

In the event of a suspected security incident:

1. **Rotate all secrets immediately** — generate new values for `DATABASE_URL` credentials, `SESSION_SECRET`, and any API keys
2. **Review access logs** — check the API logs for unusual patterns
3. **Assess impact** — determine what data may have been accessed or modified
4. **Notify affected users** — if user data is involved, notify them promptly
5. **Document the incident** — record what happened, what the impact was, and what was done to prevent recurrence

For v1 (single user, no sensitive user data), the blast radius of most incidents is low. When multi-user is added, incident response must be formalised further.
