# Technology Stack

**Project:** Income Tracker SaaS
**Researched:** 2026-05-17

## Recommended Stack

### Backend Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Hono** | 4.x | API framework | TypeScript-first, ~14KB bundle, runs on Node.js natively, built-in Zod validation via `@hono/zod-validator`, Express-like API (trivial learning curve), multi-runtime portability (future-proof), fastest-growing framework in 2026 (~1.2M weekly downloads), ~45K req/s on Node.js. For a traditional Node.js-only deployment, Fastify is a close second, but Hono's DX and forward-compatibility make it the default for new projects. |

**Why not Express:** Express is in maintenance mode, has no native TypeScript (relies on community `@types/express`), no built-in validation, and is 4-5x slower than modern alternatives. It was designed before TypeScript, before async/await, and before edge runtimes. For a greenfield 2026 project, there is no reason to start with Express.

**Why not Fastify:** Fastify is an excellent choice for Node.js-only APIs with superior raw throughput (~77K req/s) and built-in JSON Schema validation. However, Hono's TypeScript inference, smaller bundle, and runtime portability provide more long-term value. The performance gap narrows to ~20% once database queries are added (both converge around 10-15K RPS with real DB calls). Fastify's learning curve is steeper due to its schema system and plugin encapsulation model.

### ORM
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Drizzle ORM** | latest | Database access layer | ~7KB gzipped, zero binary dependencies, pure TypeScript, SQL-first philosophy ("If you know SQL, you know Drizzle"), native PostgreSQL support, excellent TypeScript inference, fast cold starts (<500ms vs Prisma's 1-3s), works on edge/serverless natively, no Rust engine binary to bundle. Schema defined in TypeScript files (no separate DSL). |

**Why not Prisma:** Prisma has excellent DX with its declarative schema language and auto-generated client, but it bundles a ~15-20MB Rust query engine binary, has slow cold starts (1-3 seconds in serverless), and requires Prisma Accelerate for edge runtime support. For a SaaS that may eventually deploy to serverless or edge environments, Drizzle's tiny footprint and zero-config serverless compatibility is a significant advantage. Prisma's proprietary DSL also means learning a second language for schema definition.

**Why not raw SQL:** Raw `pg` or `postgres.js` is viable for very small projects, but Drizzle provides type safety, migrations (via Drizzle Kit), and a query builder that maps 1:1 to SQL — getting the safety without sacrificing control. The overhead is negligible (~7KB).

### Auth
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Better Auth** | 1.x | Authentication & authorization | Framework-agnostic (works with Hono, Express, Fastify, Next.js), TypeScript-first, 3M+ weekly downloads, 28K+ GitHub stars, built-in email/password, 30+ OAuth providers, 2FA, passkeys, multi-tenancy (organizations plugin), automatic database management, Drizzle adapter built-in, plugin-based architecture, self-hosted (auth lives in your codebase), MIT license. |

**Why not Lucia Auth:** Lucia v3 was deprecated in March 2025. The project pivoted to educational resources. Do not start new projects with Lucia.

**Why not Auth.js (NextAuth v5):** Auth.js is battle-tested but carries historical baggage, is more complex to configure, and is tightly coupled to Next.js patterns. Better Auth provides a cleaner architecture, simpler setup, and is framework-agnostic — important since we're using Hono, not Next.js.

**Why not Passport.js:** Passport.js is legacy. It bundles strategy selection, session management, and serialization into a single middleware chain — convenient for Express but opaque when debugging and incompatible with modern runtimes. The ecosystem has moved toward composable, minimal libraries.

### Frontend
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **React** | 19.x | UI library | Current stable with React 19 features (Server Components, Actions, use hook). |
| **TypeScript** | 6.0 | Language | Stable release, excellent type safety for financial data. |
| **Vite** | 6.x | Build tool | Sub-2s dev server start, instant HMR, native ESM, replaced Create React App as the default. |
| **React Router** | v7 | Routing | File-based routing (Framework Mode), excellent TypeScript inference, progressive enhancement, deploy anywhere. |
| **Tailwind CSS** | latest | Styling | Utility-first, dominant in 2026 React ecosystem, pairs with shadcn/ui. |
| **shadcn/ui** | latest | UI components | Copy-paste components, not a dependency, fully customizable, built on Radix UI + Tailwind. |

**Why not Next.js for the frontend:** Since the backend is a separate Node.js API (Hono), the frontend is a client-side SPA dashboard behind authentication. Vite + React Router is simpler, produces smaller bundles (~42KB vs Next.js ~92KB), and avoids the complexity of SSR/SSG for an app where 80%+ of pages are behind a login. If public-facing marketing pages or SEO are needed later, a separate Next.js site can be added.

### State Management
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **TanStack Query** | v5 | Server state | Caching, deduplication, background refetching, optimistic updates, loading/error states. Handles 70-80% of what people used to put in Redux. |
| **Zustand** | latest | Client state | ~1KB bundle, no Provider needed, minimal API, selective subscriptions. For UI state (sidebar, theme, filters). |

**Why not Redux Toolkit:** Redux is overkill for a SaaS dashboard. Zustand + TanStack Query covers 95% of use cases with a fraction of the boilerplate and bundle size (1.2KB vs 11KB). Only reach for Redux if you need time-travel debugging, complex interdependent state transitions, or have a large team requiring strict architectural guardrails.

### Validation
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Zod** | 4.x | Runtime validation | TypeScript-first schema validation, integrates with Hono via `@hono/zod-validator`, React Hook Form, and Better Auth. Single validation library across the entire stack. |

### Testing
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Vitest** | 4.x | Unit & integration tests | 3-5x faster than Jest, native TypeScript/ESM support, shares Vite config, Jest-compatible API, watch mode is near-instant (HMR-aware), 14M+ weekly downloads. |
| **React Testing Library** | latest | Component testing | Standard for testing React components, works with Vitest, tests behavior not implementation. |
| **Playwright** | latest | E2E testing | Fast, reliable browser automation, parallel execution, auto-waiting, trace viewer. |

**Why not Jest:** Jest requires configuration for TypeScript (`ts-jest` or `@swc/jest`), has experimental ESM support, and is 3-5x slower in watch mode. For a new Vite-based project, Vitest is the obvious default with zero additional configuration.

### Database
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **PostgreSQL** | 16+ | Primary database | Relational, ACID-compliant, excellent for financial data, native JSONB support, full-text search, window functions, row-level security. |

### Infrastructure / Deployment
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Railway** | — | Hosting (backend + DB) | Persistent containers (no cold starts), built-in PostgreSQL, Redis, background workers, cron jobs, private networking between services, usage-based pricing with $5/mo Hobby plan, git-push deploys. Ideal for a SaaS with a persistent API server + database. |
| **Vercel** | — | Hosting (frontend) | Zero-config React deploys, global CDN, preview deploys per PR, $20/mo Pro plan. Best-in-class DX for frontend. |
| **Docker** | — | Containerization | Portability, local dev parity with production, multi-stage builds. |

**Alternative: Render** — If you want everything (frontend + backend + DB) on a single platform with predictable fixed-tier pricing, Render is a strong alternative. It colocates compute and PostgreSQL on a private network. Trade-off: no global edge CDN like Vercel.

**Why not AWS for early stage:** AWS offers maximum flexibility but requires significant DevOps expertise. The crossover point where AWS becomes cheaper than managed platforms is typically $1,000-2,000/month in managed platform costs. Start simple, migrate when you hit concrete limitations.

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@hono/zod-validator` | — | Request validation in Hono | Always — validates incoming request bodies/params against Zod schemas |
| `@hono/cors` | — | CORS middleware | Always — for SPA frontend communicating with API |
| `@hono/helmet` | — | Security headers | Always — sets secure HTTP headers |
| `react-hook-form` | — | Form management | Always — performant form handling with Zod integration |
| `date-fns` | — | Date manipulation | Always — lightweight, tree-shakeable, immutable date utilities |
| `recharts` or `chart.js` | — | Data visualization | For income/charts dashboard — Recharts for React-native SVG charts |
| `@tanstack/react-table` | — | Data tables | For transaction/income listing — virtualized, sortable, filterable |
| `zod-to-json-schema` | — | OpenAPI generation | For API documentation from Zod schemas |
| `pino` | — | Structured logging | Production logging with JSON output |
| `vitest` + `@vitest/coverage-v8` | — | Test coverage | CI pipeline coverage reporting |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Backend Framework | Hono | Express | No TypeScript, no validation, 4-5x slower, maintenance mode |
| Backend Framework | Hono | Fastify | Excellent but steeper learning curve, Node.js-only, heavier bundle |
| ORM | Drizzle | Prisma | 15-20MB binary, slow cold starts, proprietary DSL, edge requires paid Accelerate |
| ORM | Drizzle | TypeORM | Heavy, slow cold starts, less active development, decorator-based complexity |
| ORM | Drizzle | Raw SQL (pg) | No type safety, no migrations, more boilerplate |
| Auth | Better Auth | Lucia v3 | Deprecated March 2025 |
| Auth | Better Auth | Auth.js v5 | More complex, Next.js-coupled, historical baggage |
| Auth | Better Auth | Passport.js | Legacy, opaque debugging, Express-only patterns |
| Frontend | Vite + React Router | Next.js | Over-engineered for SPA dashboard, larger bundle, Vercel-optimized |
| Frontend | Vite + React Router | Remix | Lower ecosystem momentum, merged into React Router v7 |
| State | Zustand + TanStack Query | Redux Toolkit | Overkill for SaaS dashboard, 10x more boilerplate |
| State | Zustand + TanStack Query | SWR | TanStack Query has more features (mutations, optimistic updates, devtools) |
| Testing | Vitest | Jest | Slower, needs TS config, ESM is experimental |
| Testing | Vitest | Cypress | Playwright is faster, free parallel execution, better DX |
| Deployment | Railway | AWS | Requires DevOps expertise, not worth it until $1K+/month spend |
| Deployment | Railway | Heroku | Railway is the modern Heroku alternative with better pricing |

## Installation

```bash
# Backend
npm install hono @hono/node-server @hono/zod-validator @hono/cors
npm install drizzle-orm postgres
npm install better-auth
npm install zod
npm install pino

# Frontend
npm install react react-dom react-router
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers
npm install date-fns recharts @tanstack/react-table
npm install tailwindcss @tailwindcss/vite

# Dev dependencies (both)
npm install -D typescript vite vitest @vitest/coverage-v8
npm install -D drizzle-kit
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D playwright
npm install -D eslint @eslint/js typescript-eslint
npm install -D prettier
```

## Confidence Levels

| Area | Confidence | Notes |
|------|------------|-------|
| Backend Framework | HIGH | Multiple 2026 sources confirm Hono as default for new TypeScript API projects |
| ORM | HIGH | Drizzle vs Prisma is well-documented; Drizzle wins for serverless/edge readiness |
| Auth | HIGH | Better Auth is the emerging standard; Lucia deprecation is confirmed |
| Frontend | HIGH | Vite replaced CRA; React Router v7 is the Remix successor |
| State Management | HIGH | Zustand + TanStack Query is the 2026 consensus pattern |
| Testing | HIGH | Vitest is the default for new Vite/TypeScript projects |
| Deployment | MEDIUM | Railway vs Render is preference-dependent; both are solid |

## Sources

- DevTools Guide: Backend Framework Comparison (2026-02)
- APIScout: Hono vs Fastify vs Express API Framework 2026 (2026-03)
- PkgPulse: Express vs Hono vs Fastify 2026 (2026-03)
- TechPlained: Hono vs Express vs Fastify (2026-02)
- DevPro Portal: Node.js Framework Trends 2025 (2025-10)
- Bytebase: Drizzle vs Prisma 2026 (2025-05)
- DesignRevision: Prisma vs Drizzle Performance (2026-02)
- TechPlained: Drizzle vs Prisma (2026-02)
- Hunchbite: Prisma vs Drizzle vs TypeORM (2026-02)
- PkgPulse: oslo vs arctic vs jose JWT Auth (2026-03)
- NextBuild: Lucia Auth vs NextAuth 2026 (2025-12)
- PkgPulse: Lucia vs NextAuth 2026 (2026-03)
- Better Auth official docs (better-auth.com)
- DEV Community: JWT Auth Node.js 2026 Edition (2026-03)
- WebOmnizz: TypeScript + React 2026 Setup Guide (2026-04)
- DesignRevision: Vite vs Next.js (2026-02)
- AdminLTE: Next.js vs Remix vs Astro 2026 (2026-03)
- PkgPulse: Next.js 15 vs Remix v2 2026 (2026-03)
- jsdev.space: Best React Libraries and Tools 2026
- DevTools Watch: Vitest vs Jest 2026 (2026-02)
- PkgPulse: Jest vs Vitest 2026 (2026-04)
- PkgPulse: Best JavaScript Testing Frameworks 2026 (2026-02)
- StarterPick: State Management Zustand vs Jotai 2026 (2026-03)
- DevPro Portal: Redux vs Zustand vs Signals 2026 (2026-01)
- PkgPulse: State of React State Management 2026 (2026-03)
- Render: Deploy Node.js Production 2026
- StarterPick: Vercel vs Railway vs Render 2026 (2026-03)
- Hunchbite: Vercel vs AWS vs Railway (2026-02)
- Railway docs: SaaS Backend with Postgres (2026-03)
