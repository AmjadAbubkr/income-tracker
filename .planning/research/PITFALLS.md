# Domain Pitfalls

**Domain:** Business income/sales tracking SaaS
**Researched:** 2026-05-17

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Missing Multi-Tenant Data Isolation
**What goes wrong:** Users can see other users' transactions due to missing `WHERE user_id = ?` clauses
**Why it happens:** Developer forgets to filter by user ID in one or more queries, or uses a shared cache key without user scoping
**Consequences:** Data breach, GDPR violation, loss of trust, potential legal liability
**Prevention:**
- Use a middleware that extracts `userId` from session and attaches to request context
- Write a Drizzle helper that automatically appends `eq(table.userId, c.get('userId'))` to every query
- Write integration tests that create two users and verify cross-user data is never accessible
- Consider PostgreSQL Row-Level Security (RLS) as a database-level safety net
**Detection:** Audit all SELECT/UPDATE/DELETE queries for user_id filtering; add automated tests with multiple users

### Pitfall 2: Floating-Point Money Storage
**What goes wrong:** Storing monetary amounts as JavaScript `number` (floating-point) leads to rounding errors
**Why it happens:** JavaScript's IEEE 754 floating-point cannot represent all decimal values exactly (0.1 + 0.2 !== 0.3)
**Consequences:** Incorrect totals, tax calculations off by cents, audit failures
**Prevention:**
- Store amounts as integers (cents) in PostgreSQL: `amount INTEGER` representing cents
- Or use PostgreSQL `DECIMAL`/`NUMERIC` type with Drizzle's `decimal()` column type
- Never use JavaScript `number` for financial calculations — use a library like `dinero.js` or `currency.js`
- Always format on display, not on storage
**Detection:** Code review for any `number` type used for money; lint rule to flag financial calculations without decimal libraries

### Pitfall 3: Session Revocation Not Working
**What goes wrong:** Users cannot be logged out, password changes don't invalidate existing sessions
**Why it happens:** Using stateless JWTs without a revocation mechanism, or not invalidating sessions on password change
**Consequences:** Stolen tokens remain valid indefinitely, security breach persists after password reset
**Prevention:**
- Use database-backed sessions (Better Auth default) — deleting a session row instantly revokes it
- On password change, delete all sessions for that user
- Implement session rotation for refresh tokens
**Detection:** Test password change flow — verify old sessions are invalidated; test logout — verify session is deleted

### Pitfall 4: Timezone Handling Bugs
**What goes wrong:** Income totals differ based on user's timezone, daily reports show wrong dates
**Why it happens:** Storing dates without timezone info, or converting dates inconsistently between frontend and backend
**Consequences:** Financial reports are inaccurate, users lose trust in the product
**Prevention:**
- Store all dates in UTC in PostgreSQL (`TIMESTAMPTZ`)
- Store user's preferred timezone in their profile
- Convert to user's timezone only at display time (frontend)
- Use `date-fns-tz` for timezone conversions
- Be explicit about "day boundaries" — a day starts at midnight in the user's timezone, not UTC
**Detection:** Test with users in different timezones; verify daily totals match regardless of server timezone

## Moderate Pitfalls

### Pitfall 5: Unindexed Foreign Keys
**What goes wrong:** Slow queries as transaction count grows, dashboard loads take seconds
**Why it happens:** Forgetting to add indexes on `user_id`, `category_id`, `date` columns
**Prevention:** Add indexes on all foreign keys and frequently queried columns during migration
**Detection:** Run `EXPLAIN ANALYZE` on common queries; monitor slow query log

### Pitfall 6: Missing Rate Limiting on Auth Endpoints
**What goes wrong:** Brute force attacks on login, credential stuffing
**Why it happens:** Not implementing rate limiting on login/register/password-reset endpoints
**Prevention:** Better Auth has a built-in rate limiter plugin — enable it. Also add infrastructure-level rate limiting (Cloudflare, nginx)
**Detection:** Monitor login attempt frequency; set up alerts for unusual patterns

### Pitfall 7: Over-Fetching in Dashboard Queries
**What goes wrong:** Dashboard loads all transactions instead of aggregated data
**Why it happens:** Fetching full transaction list and aggregating in JavaScript instead of using SQL aggregation
**Prevention:** Use SQL `SUM()`, `COUNT()`, `GROUP BY` for dashboard metrics; only fetch individual transactions when viewing the list
**Detection:** Check query plans for full table scans on dashboard routes; verify response payload sizes

### Pitfall 8: Not Handling Database Connection Exhaustion
**What goes wrong:** App crashes under load because all database connections are consumed
**Why it happens:** Not configuring connection pool limits, or not releasing connections after use
**Prevention:**
- Use `pg` pool with appropriate `max` connections (typically 10-20 per instance)
- Use PgBouncer for connection pooling at scale
- Ensure all queries are properly awaited and connections released
**Detection:** Monitor active connections; set up alerts when pool is near capacity

### Pitfall 9: CORS Misconfiguration
**What goes wrong:** Frontend cannot communicate with API, or API is open to all origins
**Why it happens:** Setting `Access-Control-Allow-Origin: *` in production, or not configuring CORS for the specific frontend domain
**Prevention:** Use `@hono/cors` with explicit `origin` configuration pointing to the frontend URL; never use `*` in production
**Detection:** Test CORS preflight requests; verify response headers in production

### Pitfall 10: Exporting Sensitive Data Without Authentication
**What goes wrong:** CSV/PDF export endpoints are accessible without authentication
**Why it happens:** Forgetting to apply auth middleware to export routes
**Prevention:** Apply auth middleware globally or at the route group level; test all endpoints for auth requirements
**Detection:** Automated security scan of all API endpoints; verify each requires authentication

## Minor Pitfalls

### Pitfall 11: Hardcoding Environment Variables
**What goes wrong:** Secrets committed to git, different configs for dev/staging/prod
**Prevention:** Use `.env` files (never commit), validate required env vars at startup with Zod

### Pitfall 12: Not Handling Soft Deletes
**What goes wrong:** Deleted transactions disappear from reports, breaking financial history
**Prevention:** Use `deleted_at` timestamp instead of hard deletes; filter out soft-deleted records in queries

### Pitfall 13: Large Bundle Size from UI Libraries
**What goes wrong:** Slow initial page load due to heavy charting/UI libraries
**Prevention:** Use tree-shakeable libraries; lazy-load chart components; prefer Recharts (SVG-based, React-native) over heavy alternatives

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Auth setup** | Session fixation, missing CSRF protection | Use Better Auth (handles both); test auth flows thoroughly |
| **Database schema** | Missing indexes, wrong data types for money | Review schema with financial data best practices; add indexes early |
| **Transaction CRUD** | N+1 queries, missing user_id filters | Write repository pattern with automatic user scoping |
| **Dashboard** | Over-fetching, timezone bugs | Use SQL aggregation; store dates in UTC, display in user timezone |
| **Export** | Memory issues with large datasets, auth bypass | Stream CSV generation; apply auth middleware to export routes |
| **Deployment** | Missing env vars, cold starts | Validate env at startup; use Railway persistent containers |
| **Testing** | Tests passing with stale data | Use transactional test isolation; reset database between tests |

## Sources

- Node.js Auth Security Best Practices 2026 (AuthGear)
- DEV Community: JWT Best Practices 2026
- Multi-tenant SaaS security patterns
- PostgreSQL financial data handling best practices
- Railway deployment guide for SaaS backends (2026-03)
- Render: Next.js Background Jobs & PostgreSQL Production
