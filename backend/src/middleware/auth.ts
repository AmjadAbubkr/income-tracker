import { MiddlewareHandler } from 'hono';
import { auth } from '../auth';

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      name: string;
      emailVerified: boolean;
      image?: string;
      createdAt: Date;
      updatedAt: Date;
    };
    session: {
      id: string;
      expiresAt: Date;
      userId: string;
    };
  }
}

export const requireAuth: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session || !session.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('user', session.user);
  c.set('session', session.session);

  await next();
};
