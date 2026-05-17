import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { user, session, account, verification } from './schema';

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client);

export async function testConnection(): Promise<void> {
  try {
    const result = await db.execute('SELECT 1');
    console.log('Database connection successful:', result);
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

export { user, session, account, verification };
