/**
 * Legacy `miniscript-lab-session` helpers. The app no longer auto-saves or restores Playground
 * state from localStorage; `PlaygroundClient` calls `clearSession()` on mount. `saveSession` /
 * `loadSession` remain for tests and any future explicit persistence.
 */
import type { KeyVariable, ScriptContext, Network, PlaygroundMode } from '@/lib/engine/types';
import { parseValidPlaygroundPayload } from '@/lib/utils/share';

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
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const o = parsed as Record<string, unknown>;
    if (typeof o.savedAt !== 'number') return null;
    const body = parseValidPlaygroundPayload(o);
    if (!body) return null;
    const playgroundMode: PlaygroundMode = body.playgroundMode ?? 'scenario';
    return {
      policy: body.policy,
      keyVariables: body.keyVariables,
      context: body.context,
      network: body.network,
      playgroundMode,
      savedAt: o.savedAt,
    };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
