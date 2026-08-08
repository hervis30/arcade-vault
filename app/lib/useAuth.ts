"use client";

import { useCallback, useSyncExternalStore } from "react";

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

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): string | null {
  return localStorage.getItem(USER_KEY);
}

function getServerSnapshot(): string | null {
  return null;
}

function parseUser(raw: string | null): AuthUser | null {
  try {
    return JSON.parse(raw ?? "null");
  } catch {
    return null;
  }
}

export function useAuth() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = parseUser(raw);

  const login = useCallback((nextUser: AuthUser | null) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch {}
    emitChange();
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch {}
    emitChange();
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
