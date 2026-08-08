"use client";

import { useCallback, useEffect, useState } from "react";

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";

export interface AuthUser {
  name: string;
}

interface SavedScore {
  game: string;
  score: number;
  name: string;
  at: number;
}

function readUser(): AuthUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(readUser());
  }, []);

  const login = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch {}
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
  }, []);

  return { user, login, signOut };
}

export function saveScore(entry: { game: string; score: number; name: string }): void {
  try {
    const all: SavedScore[] = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {}
}
