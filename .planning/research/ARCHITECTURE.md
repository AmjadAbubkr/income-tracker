# Architecture Patterns

**Domain:** Business income/sales tracking SaaS
**Researched:** 2026-05-17

## Recommended Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Vercel)                 │
│  React 19 + TypeScript + Vite + React Router v7     │
│  TanStack Query (server state) + Zustand (UI state)  │
│  Tailwind CSS + shadcn/ui                           │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS + JSON
                       │
┌──────────────────────▼──────────────────────────────┐
│                Backend API (Railway)                 │
│  Hono 4.x + Node.js                                 │
│  Better Auth (auth routes)                          │
│  Zod validation (@hono/zod-validator)               │
│  Pino (structured logging)                          │
└──────────────────────┬──────────────────────────────┘
                       │ postgres:// (private network)
                       │
┌──────────────────────▼──────────────────────────────┐
│              PostgreSQL 16+ (Railway)                │
│  Tables: users, sessions, transactions,             │
│  categories, clients, recurring_incomes             │
│  Row-level security for multi-tenant isolation      │
└─────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Frontend App** | UI rendering, routing, form handling, data visualization | Backend API (HTTPS), local storage (theme, preferences) |
| **Auth Module** | Registration, login, session management, OAuth | Better Auth middleware, PostgreSQL (users/sessions tables) |
| **Transaction API** | CRUD for income records, validation, aggregation | PostgreSQL (transactions table), Auth (user ID from session) |
| **Category API** | CRUD for income categories | PostgreSQL (categories table), Auth |
| **Dashboard API** | Aggregated metrics, time-series data, summaries | PostgreSQL (aggregation queries), Transaction API |
| **Export Service** | CSV/PDF generation | Transaction API, Category API |
| **Database** | Persistent storage, relations, constraints | Backend API only (private network) |

### Data Flow

1. **User requests page** → Frontend React Router loads route component
2. **Component mounts** → TanStack Query fires API request to Hono backend
3. **Hono middleware** → Auth middleware validates session cookie
4. **Route handler** → Zod validates request params/query/body
5. **Drizzle query** → Type-safe SQL query to PostgreSQL
6. **Response** → JSON returned, TanStack Query caches it
7. **UI renders** → Component displays data, Zustand manages local UI state

## Patterns to Follow

### Pattern 1: Repository Pattern (via Drizzle)
**What:** Keep database queries in dedicated files, not inline in route handlers
**When:** Always — keeps route handlers focused on HTTP concerns
**Example:**
```typescript
// db/repositories/transactions.ts
export const transactionsRepo = {
  getByUserAndDateRange: async (db: DrizzleClient, userId: string, start: Date, end: Date) => {
    return db.select().from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.date, start),
        lte(transactions.date, end)
      ))
      .orderBy(desc(transactions.date));
  }
};

// routes/transactions.ts
app.get('/transactions', zValidator('query', dateRangeSchema), async (c) => {
  const { start, end } = c.req.valid('query');
  const userId = c.get('userId');
  const txns = await transactionsRepo.getByUserAndDateRange(db, userId, start, end);
  return c.json(txns);
});
```

### Pattern 2: Tenant Isolation via User ID
**What:** Every query includes `WHERE user_id = ?` to enforce data isolation
**When:** Every database query — non-negotiable for multi-tenant SaaS
**Example:** Use a middleware that extracts `userId` from the session and attaches it to the context, then require it in every repository call.

### Pattern 3: Optimistic Updates for CRUD
**What:** Update UI immediately on mutation, rollback on error
**When:** All transaction CRUD operations
**Example:** TanStack Query's `onMutate` + `onError` + `onSettled` pattern:
```typescript
useMutation({
  mutationFn: createTransaction,
  onMutate: async (newTxn) => {
    await queryClient.cancelQueries({ queryKey: ['transactions'] });
    const previous = queryClient.getQueryData(['transactions']);
    queryClient.setQueryData(['transactions'], (old) => [...old, newTxn]);
    return { previous };
  },
  onError: (err, newTxn, context) => {
    queryClient.setQueryData(['transactions'], context.previous);
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
});
```

### Pattern 4: Server-Validated, Client-Validated Forms
**What:** Zod schema shared between frontend form validation and backend request validation
**When:** All form submissions
**Example:** Define Zod schema in a shared package, use with `@hookform/resolvers` on frontend and `@hono/zod-validator` on backend.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Auth Tokens in localStorage
**What:** Putting JWTs or session tokens in browser localStorage
**Why bad:** XSS vulnerability — any JavaScript on the page can read localStorage and steal tokens
**Instead:** Use HttpOnly, Secure, SameSite=Lax cookies (Better Auth handles this correctly)

### Anti-Pattern 2: Mixing Server State and Client State
**What:** Storing API responses in Zustand/Redux alongside UI state
**Why bad:** Cache staleness, manual invalidation logic, synchronization bugs
**Instead:** TanStack Query for server state, Zustand only for genuine client state (UI preferences, form state)

### Anti-Pattern 3: N+1 Query Problem
**What:** Fetching related data in a loop (e.g., fetching categories for each transaction individually)
**Why bad:** O(n) database queries instead of O(1), severe performance degradation
**Instead:** Use Drizzle's `.leftJoin()` or `.innerJoin()` to fetch related data in a single query

### Anti-Pattern 4: Fat Route Handlers
**What:** Putting business logic, validation, and database queries all in route handlers
**Why bad:** Unreadable, untestable, hard to reuse logic
**Instead:** Route handlers should only handle HTTP concerns (parsing, validation, response formatting). Business logic goes in services, database access in repositories.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Database connections** | Direct pg pool (10 connections) | Add PgBouncer connection pooler | Read replicas, connection pooling via PgBouncer |
| **API throughput** | Single Hono instance | Load-balanced Hono instances (Railway auto-scaling) | Multi-region deployment, CDN caching for dashboard data |
| **File storage** | None needed (CSV generated on-demand) | Object storage (Cloudflare R2 or S3) for exports | CDN-backed object storage |
| **Caching** | TanStack Query client-side cache | Add Redis for server-side caching of dashboard aggregates | Redis cluster, edge caching for public data |
| **Background jobs** | None needed | BullMQ worker on Railway for exports, email notifications | Dedicated worker fleet, message queue (Redis Streams) |
| **Monitoring** | Basic logging (Pino) | Structured logging + error tracking (Sentry) | Full observability stack (metrics, traces, logs) |

## Database Schema (Initial)

```
users
├── id (uuid, PK)
├── email (unique)
├── password_hash
├── created_at
└── updated_at

transactions
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── amount (decimal)
├── currency (varchar, default 'USD')
├── date (date)
├── description (text)
├── category_id (uuid, FK → categories)
├── client_id (uuid, FK → clients, nullable)
├── created_at
└── updated_at

categories
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (varchar)
├── color (varchar)
└── created_at

clients
├── id (uuid, PK)
├── user_id (uuid, FK → users)
├── name (varchar)
├── email (varchar, nullable)
└── created_at
```

## Sources

- Multi-tenant SaaS architecture patterns (2026)
- Hono official documentation
- Better Auth documentation
- TanStack Query documentation
- Drizzle ORM documentation
- Railway SaaS backend guide (2026-03)
