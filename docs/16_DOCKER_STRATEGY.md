# 16 — Docker Strategy

**Document status:** Complete  
**Last updated:** June 2026

---

## Overview

This document covers two related but distinct topics:

1. **Docker as curriculum content** — how the platform teaches Docker (covered in `08_DEVOPS_CURRICULUM.md`)
2. **Docker as infrastructure** — how the DevOps Forge platform itself uses (or will use) Docker for its own deployment and development

This document is about the second: the containerisation strategy for running DevOps Forge in Docker.

---

## Current state

DevOps Forge v1 does not run in Docker. It runs directly on Replit's infrastructure — Node.js processes managed by Replit's workflow system, with a Replit-provisioned PostgreSQL database. This is the fastest way to ship for a single-author project and requires no container knowledge to operate.

Containerising the application is a v2 initiative, planned alongside the CI/CD pipeline.

---

## Why containerise the platform

### Consistency

A Docker image guarantees that the application runs identically in development, CI, staging, and production. Replit's environment is consistent now, but moving to self-hosted infrastructure — or adding contributors who work locally — introduces environmental differences that containers eliminate.

### Portability

If the platform ever needs to move off Replit (to AWS ECS, a VPS, or Kubernetes), having Docker images ready makes that migration straightforward. Running on raw Node.js ties the deployment to Replit-specific conventions.

### Dogfooding

A DevOps learning platform that containerises itself is a working example of what the Docker curriculum teaches. The `Dockerfile` and `docker-compose.yml` in the repository serve as real-world references for learners.

### CI/CD integration

The CI/CD pipeline (see `15_CI_CD.md`) will build Docker images as part of the deployment process. Images are tagged by commit SHA and pushed to a registry before deployment.

---

## Planned Docker architecture

### Services

```yaml
services:
  api:
    build:
      context: .
      dockerfile: artifacts/api-server/Dockerfile
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL
      - SESSION_SECRET
      - NODE_ENV=production
    depends_on:
      db:
        condition: service_healthy

  web:
    build:
      context: .
      dockerfile: artifacts/devops-forge/Dockerfile
    ports:
      - "3000:3000"

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=devops_forge
      - POSTGRES_USER=forge
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U forge -d devops_forge"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pg_data:
```

In production, the `db` service is replaced by a managed PostgreSQL instance (Replit's database, AWS RDS, or equivalent). The compose file is for development and CI only.

---

## Planned Dockerfiles

### API server

```dockerfile
# artifacts/api-server/Dockerfile

FROM node:24-alpine AS base
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/ lib/
COPY artifacts/api-server/package.json artifacts/api-server/
RUN pnpm install --frozen-lockfile

# Build
COPY artifacts/api-server/ artifacts/api-server/
RUN pnpm --filter @workspace/api-server run build

# Production image
FROM node:24-alpine AS production
WORKDIR /app
COPY --from=base /app/artifacts/api-server/dist ./dist
COPY --from=base /app/node_modules ./node_modules
EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
```

### Frontend

The frontend is a static build served by a lightweight web server (Nginx or Caddy):

```dockerfile
# artifacts/devops-forge/Dockerfile

FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY lib/ lib/
COPY artifacts/devops-forge/package.json artifacts/devops-forge/
RUN pnpm install --frozen-lockfile

COPY artifacts/devops-forge/ artifacts/devops-forge/
RUN pnpm --filter @workspace/devops-forge run build

FROM nginx:alpine AS production
COPY --from=build /app/artifacts/devops-forge/dist /usr/share/nginx/html
COPY artifacts/devops-forge/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

The Nginx config will include a `try_files` directive to handle client-side routing (wouter):

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://api:8080;
    }
}
```

---

## Multi-stage build strategy

Both Dockerfiles use multi-stage builds:

1. **Base stage** — installs all dependencies (including devDependencies) and builds
2. **Production stage** — copies only the built output; no source code, no devDependencies, no build tools

This keeps production images small. The API server image should be under 200MB; the frontend image should be under 50MB (most of which is Nginx).

---

## Image naming and tagging

```
ghcr.io/<owner>/devops-forge-api:<sha>
ghcr.io/<owner>/devops-forge-web:<sha>
```

Images are tagged with the full commit SHA in CI. The `latest` tag is only applied to images built from `main`. Never deploy `latest` directly — always deploy a specific SHA-tagged image so rollback is unambiguous.

---

## Local development with Docker

For contributors who prefer to run everything in Docker locally:

```bash
# Copy environment template
cp .env.example .env
# Fill in DATABASE_URL, SESSION_SECRET, POSTGRES_PASSWORD

# Build and start all services
docker compose up --build

# Access the app
open http://localhost:3000
```

A `.env.example` file will be committed with placeholder values and documentation for each variable. The actual `.env` is gitignored.

---

## Database migration in Docker

When running in Docker, schema migrations are applied by running a one-off container before the API container starts:

```bash
docker compose run --rm api pnpm --filter @workspace/db run push
```

In the CI/CD pipeline, this step runs as a pre-deploy job. In `docker compose`, it can be defined as a service with `restart: no` that runs `db push` and exits, gated by a `depends_on` condition on the `db` health check.
