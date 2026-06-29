# 19 — Deployment Strategy

**Document status:** Complete  
**Last updated:** June 2026

---

## Current deployment

DevOps Forge is deployed on Replit. The production deployment is triggered manually through Replit's Publish/Deploy workflow. There are two environments:

| Environment | Description | URL |
|-------------|-------------|-----|
| Development | Replit dev server, always-on in the workspace | Replit preview pane |
| Production | Replit-published deployment | `.replit.app` domain |

There is no staging environment in v1.

---

## How Replit deployment works

When the application is published on Replit:

1. Replit builds both services (API server and frontend) using their configured build commands
2. The built services are deployed to Replit's infrastructure
3. Replit's reverse proxy routes `/api` to the API server and `/` to the frontend
4. The production database (separate from the dev database) is used automatically via `DATABASE_URL`
5. HTTPS is provided by Replit — no certificate management needed
6. The deployment is available at a `.replit.app` subdomain

The production environment runs the same Node.js version and has the same secrets (injected separately for production) as the development environment.

---

## Environment variables in production

Replit maintains separate secrets for development and production environments. The following variables must be set in the production secrets:

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Production PostgreSQL connection string (different from dev) |
| `SESSION_SECRET` | Long random string, never shared with dev |
| `NODE_ENV` | Set to `production` |

Secrets are never committed to source code. They are set once in Replit's secrets panel and persist across deployments.

---

## Schema changes in production

Schema changes must be applied to the production database before the new application version is deployed. The workflow:

1. Apply the schema change to the production database:
   ```bash
   # With DATABASE_URL pointing to production
   pnpm --filter @workspace/db run push
   ```
2. Verify the schema change did not break anything in production (if backward-compatible, existing deployment continues working)
3. Deploy the new application version

**Backward-compatible changes** (adding a column with a default, adding a new table) can be applied without downtime — the existing deployment continues to work while the schema change is applied, and the new version picks it up.

**Breaking changes** (removing a column, changing a type) require a deployment window. Coordinate by:
1. Deploying a version that works with both old and new schema
2. Applying the schema change
3. Deploying the final version that uses the new schema only

---

## Planned deployment architecture (v2)

As the platform grows, the deployment will evolve:

### Three environments

```
Development  →  Staging  →  Production
```

| Environment | Purpose | Deploy trigger |
|-------------|---------|----------------|
| Development | Active development | Manual / Replit workspace |
| Staging | Pre-production validation | Automatic on merge to `main` |
| Production | Live for learners | Manual trigger after staging validation |

### Staging requirements

Staging is a production-equivalent environment with:
- Its own database (schema matches production, data is anonymised or synthetic)
- Its own secrets (not shared with production)
- The same infrastructure configuration as production
- Smoke tests that run automatically after each staging deployment

### Zero-downtime deployments

When deploying a new version:
- The new version starts before the old version is stopped
- Health checks on `/api/healthz` confirm the new version is ready
- Traffic switches to the new version only when it is healthy
- The old version stops only after the switchover is complete

Replit's deployment system handles this automatically for Replit-hosted deployments.

---

## Health checks

The `/api/healthz` endpoint is the liveness probe for the API server. It returns:

```json
{ "status": "ok" }
```

This endpoint:
- Does not require authentication
- Does not query the database (it checks application liveness, not data health)
- Returns 200 immediately if the server is running
- Returns a non-200 status only if the server is in an unrecoverable state

A separate readiness probe (planned for v2) will check database connectivity before declaring the service ready to receive traffic.

---

## Database strategy

### Development database

Replit-provisioned PostgreSQL. Accessible only from the Replit workspace. Used for development and testing. Schema changes are applied freely.

### Production database

Separate Replit-provisioned PostgreSQL instance. Accessible only from the production deployment. Schema changes are applied carefully, following the process described above.

### Backup

Replit's managed database includes automatic daily backups with 7-day retention. For additional peace of mind, a weekly manual backup of the full database should be taken using `pg_dump`:

```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

Store backups in a private S3 bucket or similar durable storage.

---

## Monitoring (planned)

v1 has no monitoring beyond the Replit workflow console logs. Planned for v2:

| Tool | Purpose |
|------|---------|
| Replit deployment logs | Server errors, request logs |
| Uptime monitoring (e.g., UptimeRobot) | Alert when the application is unreachable |
| Error tracking (e.g., Sentry) | Capture and group production errors |
| Database metrics | Query performance, connection pool usage |

The pino logger writes structured JSON to stdout. In production, these logs can be ingested by any log aggregation service (e.g., Logtail, Datadog) by piping stdout.

---

## Rollback procedure

### Application rollback

Replit maintains deployment history. To roll back:
1. Open the Deployments panel in Replit
2. Select the last known-good deployment
3. Click Redeploy

### Database rollback

There is no automated database rollback. To roll back a schema change:
1. Identify what changed (column added, table created, etc.)
2. Apply the inverse change manually using Drizzle or raw SQL
3. Redeploy the application version that matches the rolled-back schema

This is why schema changes should be additive wherever possible (adding columns and tables rather than removing or modifying them). Additive changes are safe to roll back independently of the application.

---

## Cost considerations

Replit's free tier supports development and low-traffic production deployments. As traffic grows:

- **Replit Hacker/Pro plan** — increases compute and deployment limits
- **External PostgreSQL** (e.g., Neon, Supabase, Railway) — more control over database resources and backups
- **CDN for static assets** — the frontend build can be served from a CDN (Cloudflare, AWS CloudFront) for better global performance

These are future considerations. The current Replit setup is sufficient for a single-user or low-traffic multi-user deployment.
