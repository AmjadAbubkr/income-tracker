import { act, render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../src/context/LanguageContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { database } from '../src/utils/database';
import { storage } from '../src/utils/storage';

const DB_NAME = 'IncomeTrackerDB';
let auth: ReturnType<typeof useAuth> | undefined;

const deleteDatabase = () => new Promise<void>((resolve, reject) => {
  const request = indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess = () => resolve();
  request.onerror = () => reject(request.error);
});

function AuthProbe() {
  auth = useAuth();
  return <span data-testid="email">{auth.user?.email || ''}</span>;
}

function renderAuth() {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <LanguageProvider>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>,
  );
}

describe('profile email boundaries', () => {
  beforeEach(async () => {
    localStorage.clear();
    await deleteDatabase();
    vi.resetModules();
  });

  afterEach(() => {
    database.close();
    auth = undefined;
  });

  it('normalizes an email update and rejects another local user email', async () => {
    await storage.auth.createUser({
      id: 'other-user',
      email: 'taken@example.com',
      name: 'Other',
      createdAt: '2026-08-12T00:00:00.000Z',
    });
    renderAuth();
    await waitFor(() => expect(auth?.isLoading).toBe(false));

    let registered = false;
    await act(async () => {
      registered = await auth!.register('Owner', 'owner@example.com', 'password');
    });
    expect(registered).toBe(true);

    let duplicateAccepted = false;
    await act(async () => {
      duplicateAccepted = await auth!.updateProfile({ email: 'TAKEN@example.com' });
    });
    expect(duplicateAccepted).toBe(false);
    expect(auth?.user?.email).toBe('owner@example.com');

    await act(async () => {
      duplicateAccepted = await auth!.updateProfile({ email: ' NEW@example.com ' });
    });
    expect(duplicateAccepted).toBe(true);
    expect(auth?.user?.email).toBe('new@example.com');
  });
});
