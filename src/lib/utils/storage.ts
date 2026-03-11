import type { KeyVariable, ScriptContext, Network } from '@/lib/engine/types';

const STORAGE_KEY = 'miniscript-lab-session';

export interface PersistedSession {
  policy: string;
  keyVariables: KeyVariable[];
  context: ScriptContext;
  network: Network;
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
