import { Hono } from 'hono';
import { auth } from '../auth';

const authRoutes = new Hono();

// Mount Better Auth handler for all auth endpoints
authRoutes.on(['POST', 'GET'], '/*', async (c) => {
  return auth.handler(c.req.raw);
});

// Get current session
authRoutes.get('/get-session', async (c) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ user: null, session: null });
  }

  return c.json({ user: session.user, session: session.session });
});

// Logout
authRoutes.post('/sign-out', async (c) => {
  await auth.api.signOut({
    headers: c.req.raw.headers,
  });

  return c.json({ success: true });
});

export { authRoutes };
