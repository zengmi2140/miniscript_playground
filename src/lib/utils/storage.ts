/**
 * Legacy `miniscript-lab-session` helpers. The app no longer auto-saves or restores Playground
 * state from localStorage; `PlaygroundClient` calls `clearSession()` on mount. `saveSession` /
 * `loadSession` remain for tests and any future explicit persistence.
 */
import type { KeyVariable, ScriptContext, Network, PlaygroundMode } from '@/lib/engine/types';

const STORAGE_KEY = 'miniscript-lab-session';

export interface PersistedSession {
  policy: string;
  keyVariables: KeyVariable[];
  context: ScriptContext;
  network: Network;
  playgroundMode: PlaygroundMode;
  savedAt: number;
}

export function saveSession(session: Omit<PersistedSession, 'savedAt'>): void {
  try {
    const data: PersistedSession = { ...session, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function loadSession(): PersistedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed.policy !== 'string' ||
      !Array.isArray(parsed.keyVariables) ||
      typeof parsed.context !== 'string' ||
      typeof parsed.network !== 'string'
    ) {
      return null;
    }
    // Default playgroundMode to 'scenario' for backward compatibility
    if (!parsed.playgroundMode) {
      parsed.playgroundMode = 'scenario';
    }
    return parsed as PersistedSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
