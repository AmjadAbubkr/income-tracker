import { Hono } from 'hono';
import { authRoutes } from './auth';
import { productRoutes } from './products';
import { categoryRoutes } from './categories';
import { requireAuth } from '../middleware/auth';

const apiRoutes = new Hono();

// Mount auth routes at /auth
apiRoutes.route('/auth', authRoutes);

// Mount product routes at /products
apiRoutes.route('/products', productRoutes);

// Mount category routes at /categories
apiRoutes.route('/categories', categoryRoutes);

// Protected test route to verify middleware works
apiRoutes.get('/protected', requireAuth, (c) => {
  const user = c.get('user');
  return c.json({ message: 'Access granted', userId: user.id });
});

export { apiRoutes };
