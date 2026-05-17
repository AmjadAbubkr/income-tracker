import { Hono } from 'hono';
import { authRoutes } from './auth';
import { requireAuth } from '../middleware/auth';

const apiRoutes = new Hono();

// Mount auth routes at /auth
apiRoutes.route('/auth', authRoutes);

// Protected test route to verify middleware works
apiRoutes.get('/protected', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ message: 'Access granted', userId: user.id });
});

export { apiRoutes };
