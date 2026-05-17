import { apiClient, type ApiUser, type SessionResponse } from './client';

export async function signUp(email: string, name: string, password: string): Promise<ApiUser> {
  const res = await apiClient.post<SessionResponse>('/api/auth/sign-up-email', {
    email,
    name,
    password,
  });
  return res.user!;
}

export async function signIn(email: string, password: string): Promise<ApiUser> {
  const res = await apiClient.post<SessionResponse>('/api/auth/sign-in-email', {
    email,
    password,
  });
  return res.user!;
}

export async function getSession(): Promise<SessionResponse> {
  return apiClient.get<SessionResponse>('/api/auth/get-session');
}

export async function signOut(): Promise<void> {
  await apiClient.post<void>('/api/auth/sign-out', {});
}
