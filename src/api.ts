import type { User, StickerRow, MatchResult, LookupResult, LeaderboardEntry } from './types';

async function authRequest(endpoint: string, name: string, password: string): Promise<User> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? 'Request failed');
  }
  return res.json();
}

export function registerUser(name: string, password: string): Promise<User> {
  return authRequest('/api/auth/register', name, password);
}

export function loginUser(name: string, password: string): Promise<User> {
  return authRequest('/api/auth/login', name, password);
}

export async function getUsers(): Promise<User[]> {
  return fetch('/api/users').then(r => r.json());
}

export async function getMyStickers(userId: string): Promise<StickerRow[]> {
  return fetch(`/api/stickers/${userId}`).then(r => r.json());
}

export async function updateSticker(userId: string, stickerId: string, quantity: number): Promise<void> {
  await fetch(`/api/stickers/${userId}/${encodeURIComponent(stickerId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
}

export async function getMatches(userId: string): Promise<MatchResult[]> {
  return fetch(`/api/matches/${userId}`).then(r => r.json());
}

export async function lookupSticker(stickerId: string): Promise<LookupResult[]> {
  return fetch(`/api/lookup/${encodeURIComponent(stickerId)}`).then(r => r.json());
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetch('/api/leaderboard').then(r => r.json());
}

export async function deleteUser(userId: string): Promise<void> {
  await fetch(`/api/users/${userId}`, { method: 'DELETE' });
}
