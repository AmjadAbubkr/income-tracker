import { beforeEach, vi } from 'vitest';

vi.resetModules();

export function createTestServer() {
  // This function will be implemented once we have a test database
  // For now, tests require a running PostgreSQL instance
  throw new Error(
    'Test server requires PostgreSQL. Set DATABASE_URL to a test database and re-run.'
  );
}
