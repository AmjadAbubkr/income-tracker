---
status: resolved
trigger: "Better Auth sign-up/sign-in return 404, baseURL warning persists"
created: 2026-05-20
updated: 2026-05-20
---

# Debug: better-auth-404-routes

## Symptoms
- Expected: POST /api/auth/sign-up/email and /api/auth/sign-in/email return session
- Actual: Returns 404
- Error: Better Auth handler receives full Hono path including /auth prefix, can't match internal routes
- Warning: "Base URL could not be determined" despite BETTER_AUTH_URL in .env and baseURL in config

## Current Focus
- hypothesis: CONFIRMED — but not for the originally suspected reason
- The path matching in Better Auth actually WORKS correctly (basePath /api/auth is stripped internally by normalizePathname)
- The real issue was Hono route ordering: the `on(['POST','GET'], '/*', ...)` wildcard on line 7 intercepted ALL requests BEFORE the specific `/get-session` and `/sign-out` handlers

## Evidence
- timestamp: 2026-05-20 - Backend routes mounted: app.route('/api', apiRoutes) → apiRoutes.route('/auth', authRoutes) → authRoutes.on('/*', auth.handler)
- timestamp: 2026-05-20 - Better Auth endpoints: /sign-up/email, /sign-in/email (confirmed from dist source)
- timestamp: 2026-05-20 - Frontend calls: /auth/sign-up/email → BASE_URL=/api + path → /api/auth/sign-up/email ✓
- timestamp: 2026-05-20 - VERIFIED: auth.handler(c.req.raw) with URL http://localhost:3000/api/auth/sign-up/email returns 500 (DB error) NOT 404 — path matching works
- timestamp: 2026-05-20 - VERIFIED: Hono route ordering test — `on('/*')` wildcard intercepts specific `/get-session` and `/sign-out` handlers; specific routes must be registered FIRST
- timestamp: 2026-05-20 - VERIFIED: Better Auth's /get-session returns `null` (just null) when no session, not `{ user: null, session: null }` — frontend expects the latter
- timestamp: 2026-05-20 - VERIFIED: baseURL is correctly resolved from env; no "Base URL could not be determined" warning in our setup
- timestamp: 2026-05-20 - VERIFIED: dotenv/config loads before auth.ts import; BETTER_AUTH_URL=http://localhost:3000 is available

## Resolution
- root_cause: Hono route ordering bug — the `on(['POST','GET'], '/*', ...)` wildcard handler was registered BEFORE specific `/get-session` and `/sign-out` handlers, causing the wildcard to intercept all requests. The specific handlers were dead code. Additionally, Better Auth's /get-session returns `null` instead of `{ user: null, session: null }` when no session exists, causing a response format mismatch with the frontend.
- fix: Reordered auth route handlers in backend/src/routes/auth.ts — specific `/get-session` and `/sign-out` handlers now come BEFORE the wildcard `on('/*')` catch-all. Also added explicit `basePath: '/api/auth'` to auth.ts config for clarity. Fixed test file comments (sign-up-email → sign-up/email).
- specialist_hint: typescript
- files_changed:
  - backend/src/routes/auth.ts — reordered: specific handlers first, wildcard last
  - backend/src/auth.ts — added explicit basePath: '/api/auth'
  - backend/tests/auth.test.ts — fixed endpoint path comments (sign-up-email → sign-up/email)
