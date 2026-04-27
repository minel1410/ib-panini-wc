import { useState } from 'react';
import type { User } from '../types';

const STORAGE_KEY = 'panini_user';

export function useUser() {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const saveUser = (u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const clearUser = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return { user, saveUser, clearUser };
}
