import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import pino from 'pino';
import 'dotenv/config';

const logger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
});

const app = new Hono();

// Security headers (manual replacement for @hono/helmet)
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  await next();
});

// CORS - allow frontend origin with credentials for httpOnly cookies
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(
    { method: c.req.method, path: c.req.path, status: c.res.status, duration: `${ms}ms` },
    'request'
  );
});

// Health check
app.get('/api/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// 404 handler
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port }, (info) => {
  logger.info(`Server running on port ${info.port}`);
});

export default app;
