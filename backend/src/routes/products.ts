import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { product } from '../db/schema';
import { requireAuth } from '../middleware/auth';

const productRoutes = new Hono();

const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Price must be a valid decimal number'),
  description: z.string().max(1000).optional(),
  image: z.string().max(500).optional(),
  inventory: z.coerce.number().int().min(0).optional(),
  category: z.string().max(255).optional(),
});

const updateProductSchema = createProductSchema.partial();

// POST / — Create product
productRoutes.post('/', requireAuth, zValidator('json', createProductSchema), async (c) => {
  const user = c.get('user');
  const body = c.req.valid('json');

  const [newProduct] = await db
    .insert(product)
    .values({
      userId: user.id,
      name: body.name,
      price: body.price,
      description: body.description,
      image: body.image,
      inventory: body.inventory,
      category: body.category,
    })
    .returning();

  return c.json(newProduct, 201);
});

// GET / — List all products for user
productRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user');

  const products = await db
    .select()
    .from(product)
    .where(eq(product.userId, user.id))
    .orderBy(desc(product.createdAt));

  return c.json(products);
});

// GET /:id — Get single product
productRoutes.get('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const [foundProduct] = await db
    .select()
    .from(product)
    .where(and(eq(product.id, id), eq(product.userId, user.id)));

  if (!foundProduct) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(foundProduct);
});

// PUT /:id — Update product
productRoutes.put('/:id', requireAuth, zValidator('json', updateProductSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const body = c.req.valid('json');

  // Build update data — only include fields that were provided
  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.image !== undefined) updateData.image = body.image;
  if (body.inventory !== undefined) updateData.inventory = body.inventory;
  if (body.category !== undefined) updateData.category = body.category;

  const [updatedProduct] = await db
    .update(product)
    .set(updateData)
    .where(and(eq(product.id, id), eq(product.userId, user.id)))
    .returning();

  if (!updatedProduct) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(updatedProduct);
});

// DELETE /:id — Delete product
productRoutes.delete('/:id', requireAuth, async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');

  const [deletedProduct] = await db
    .delete(product)
    .where(and(eq(product.id, id), eq(product.userId, user.id)))
    .returning();

  if (!deletedProduct) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json({ message: 'Product deleted' });
});

export { productRoutes };
