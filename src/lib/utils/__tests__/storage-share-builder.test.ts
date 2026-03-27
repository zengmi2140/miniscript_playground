import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSession, loadSession, clearSession } from '../storage';
import { encodeSharePayload, decodeSharePayload } from '../share';
import type { PersistedSession } from '../storage';
import type { SharePayload } from '../share';

describe('storage with playgroundMode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load session with playgroundMode', () => {
    const session = {
      policy: 'pk(Alice)',
      keyVariables: [{ name: 'Alice', pubkey: 'abc123' }],
      context: 'wsh' as const,
      network: 'testnet' as const,
      playgroundMode: 'build' as const,
    };

    saveSession(session);
    const loaded = loadSession();

    expect(loaded).not.toBeNull();
    expect(loaded!.playgroundMode).toBe('build');
    expect(loaded!.policy).toBe('pk(Alice)');
  });

  it('should default playgroundMode to scenario for old sessions', () => {
    // Simulate old session format without playgroundMode
    const oldSession = {
      policy: 'pk(Alice)',
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
      savedAt: Date.now(),
    };
    localStorage.setItem('miniscript-lab-session', JSON.stringify(oldSession));

    const loaded = loadSession();
    expect(loaded).not.toBeNull();
    expect(loaded!.playgroundMode).toBe('scenario');
  });

  it('should clear session', () => {
    saveSession({
      policy: 'pk(Alice)',
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
      playgroundMode: 'build',
    });

    clearSession();
    const loaded = loadSession();
    expect(loaded).toBeNull();
  });
});

describe('share with playgroundMode', () => {
  it('should encode and decode share payload with playgroundMode', () => {
    const payload: SharePayload = {
      policy: 'and(pk(User),or(pk(Service),older(4320)))',
      keyVariables: [
        { name: 'User', pubkey: 'user123' },
        { name: 'Service', pubkey: 'service456' },
      ],
      context: 'wsh',
      network: 'signet',
      playgroundMode: 'build',
    };

    const encoded = encodeSharePayload(payload);
    expect(encoded).toBeTruthy();

    const decoded = decodeSharePayload(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.playgroundMode).toBe('build');
    expect(decoded!.policy).toBe(payload.policy);
    expect(decoded!.keyVariables).toEqual(payload.keyVariables);
  });

  it('should handle missing playgroundMode in share payload', () => {
    // Create a payload without playgroundMode
    const payload = {
      policy: 'pk(Alice)',
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
    };

    const encoded = btoa(JSON.stringify(payload));
    const decoded = decodeSharePayload(encoded);

    expect(decoded).not.toBeNull();
    // playgroundMode should be undefined (not forced to 'scenario' in share)
    expect(decoded!.playgroundMode).toBeUndefined();
  });
});
