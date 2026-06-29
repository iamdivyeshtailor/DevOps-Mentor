# 13 — User Roles

**Document status:** Complete  
**Last updated:** June 2026

---

## Current state (v1)

DevOps Forge v1 has no authentication system. There is one implicit role:

**Learner (anonymous, global)**
- Can view all modules and their challenge lists
- Can access any unlocked module's challenges
- Can mark challenges as complete
- Has one shared progress record (no user segmentation)
- Cannot manage content (add/edit challenges, modules, documentation)

This is a deliberate simplification to ship a working platform quickly and validate the learning experience before building identity infrastructure.

---

## Planned roles (v2+)

When authentication is added, the platform will support at minimum two roles:

### Learner

The primary role. A learner is any authenticated user who is using the platform to learn DevOps.

**Permissions:**
- View all modules, challenges, and documentation
- Complete challenges and earn XP
- View their own progress, activity feed, and level
- Access the AI mentor
- Update their profile (display name, preferences)

**Restrictions:**
- Cannot view other learners' progress (no social features in v2)
- Cannot modify content (challenges, modules, documentation)
- Cannot access admin routes

### Administrator

An admin is a trusted user responsible for managing the platform's content and operations.

**Permissions (superset of Learner):**
- Create, edit, and delete modules
- Create, edit, and delete challenges and hints
- Create, edit, and delete documentation topics
- View aggregate usage statistics
- Manage user accounts (reset progress, deactivate accounts)
- Configure platform settings (unlock thresholds, XP values)

**Restrictions:**
- Admin actions are logged (audit trail)
- Destructive actions (delete challenge, delete user data) require confirmation
- Admin role is assigned manually — no self-service admin registration

---

## Authentication design

### Approach

Replit Auth (OIDC with PKCE) is the most straightforward option given the Replit hosting environment. Clerk is an alternative that provides a more polished authentication UI. The decision will be made when this feature is prioritised.

Either way, the approach is:
1. Authentication happens at the frontend — the user logs in via the auth provider's UI
2. The frontend receives a session token
3. All API requests include the session token in the `Authorization` header
4. The API server validates the token on every request and extracts the user identity
5. Route handlers use the authenticated user identity to scope data access

### Session model

Sessions are stateless (JWT) rather than server-side session storage. This avoids the need for a session store (Redis or database session table) and scales naturally to multiple instances.

For Replit Auth specifically: the PKCE flow produces an ID token that is validated against the Replit OIDC discovery endpoint.

---

## Database changes required for multi-user

Adding authentication will require schema changes:

```sql
-- New table
CREATE TABLE users (
  id         serial PRIMARY KEY,
  provider_id text NOT NULL UNIQUE,  -- the ID from the auth provider
  email       text,
  display_name text,
  role        text NOT NULL DEFAULT 'learner',
  created_at  timestamp NOT NULL DEFAULT NOW()
);

-- Add user_id to progress
ALTER TABLE progress ADD COLUMN user_id integer REFERENCES users(id);

-- Change unique constraint
-- Old: UNIQUE (challenge_id)
-- New: UNIQUE (challenge_id, user_id)
```

All progress queries will be filtered by `user_id = (current user's ID)`. The progress API endpoints will change from returning global progress to returning per-user progress.

---

## Role enforcement

Roles are enforced at the API layer, not the database layer. The database does not have row-level security — access control is implemented in Express middleware and route handlers.

### Middleware approach

```typescript
// Authentication middleware — runs on all protected routes
function requireAuth(req, res, next) {
  // Validate session token
  // Set req.user = { id, role }
  // Call next() or return 401
}

// Authorisation middleware — runs on admin routes
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}
```

Routes are organised so that admin routes live under `/api/admin` and are protected by the `requireAdmin` middleware. Learner routes live under `/api` and are protected only by `requireAuth`.

---

## Content management roles (future)

A third role — **Content Editor** — may be introduced between Learner and Administrator. A content editor can:
- Create and edit challenges, hints, and documentation
- Cannot manage users or platform settings

This role would be useful for bringing in subject-matter experts to write curriculum content without granting them full admin access.

---

## Privacy considerations

When multi-user is implemented:
- Learners cannot see each other's progress or activity
- Email addresses are stored encrypted
- No analytics or tracking beyond what is needed for the platform's own features
- Users can request deletion of their account and all associated progress data
- Admin actions on user accounts are logged with the admin's identity and timestamp
