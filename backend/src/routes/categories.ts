import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { category } from '../db/schema';
import { requireAuth } from '../middleware/auth';

const categoryRoutes = new Hono();

const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
});

// POST / — Create category
categoryRoutes.post('/', requireAuth, zValidator('json', createCategorySchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  try {
    const [newCategory] = await db
      .insert(category)
      .values({
        userId: user.id,
        name: body.name,
      })
      .returning();

    return c.json(newCategory, 201);
  } catch (error) {
    // Check for unique constraint violation (PostgreSQL error code 23505)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      return c.json({ error: 'Category already exists' }, 409);
    }
    throw error;
  }
});

// GET / — List all categories for user
categoryRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');

  const categories = await db
    .select()
    .from(category)
    .where(eq(category.userId, user.id))
    .orderBy(category.name);

  return c.json(categories);
});

// DELETE /:id — Delete category
categoryRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const [deletedCategory] = await db
    .delete(category)
    .where(and(eq(category.id, id), eq(category.userId, user.id)))
    .returning();

  if (!deletedCategory) {
    return c.json({ error: 'Category not found' }, 404);
  }

  return c.json({ message: 'Category deleted' });
});

export { categoryRoutes };
