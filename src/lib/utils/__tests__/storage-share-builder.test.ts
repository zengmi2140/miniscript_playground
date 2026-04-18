import { describe, it, expect, beforeEach } from 'vitest';
import { saveSession, loadSession, clearSession } from '../storage';
import { encodeSharePayload, decodeSharePayload } from '../share';
import type { SharePayload } from '../share';

describe('storage (legacy key cleanup)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clearSession removes scriptwise-session', () => {
    saveSession({
      policy: 'pk(Alice)',
      keyVariables: [
        { name: 'Alice', policyName: 'Alice', publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798' },
      ],
      context: 'wsh',
      network: 'testnet',
      playgroundMode: 'build',
    });

    expect(loadSession()).not.toBeNull();

    clearSession();
    expect(loadSession()).toBeNull();
  });

  it('loadSession returns null for invalid persisted body', () => {
    localStorage.setItem(
      'scriptwise-session',
      JSON.stringify({
        policy: 'pk(A)',
        keyVariables: [],
        context: 'wsh',
        network: 'mainnet',
        savedAt: Date.now(),
      }),
    );
    expect(loadSession()).toBeNull();
  });
});

describe('share with playgroundMode', () => {
  it('should encode and decode share payload with playgroundMode', () => {
    const payload: SharePayload = {
      policy: 'and(pk(User),or(pk(Service),older(4320)))',
      keyVariables: [
        { name: 'User', policyName: 'User', publicKey: 'user123' },
        { name: 'Service', policyName: 'Service', publicKey: 'service456' },
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
    const payload = {
      policy: 'pk(Alice)',
      keyVariables: [] as SharePayload['keyVariables'],
      context: 'wsh' as const,
      network: 'testnet' as const,
    };

    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.playgroundMode).toBeUndefined();
  });

  it('decodeSharePayload returns null for invalid network', () => {
    const bad = { policy: 'pk(A)', keyVariables: [], context: 'wsh', network: 'mainnet' };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(bad))));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it('decodeSharePayload returns null for invalid context', () => {
    const bad = {
      policy: 'pk(A)',
      keyVariables: [],
      context: 'p2pkh',
      network: 'testnet',
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(bad))));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it('decodeSharePayload returns null for malformed keyVariables entry', () => {
    const bad = {
      policy: 'pk(A)',
      keyVariables: [{ name: 'A', policyName: 'A' }],
      context: 'wsh',
      network: 'testnet',
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(bad))));
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it('should drop invalid playgroundMode from share payload', () => {
    const payload = {
      policy: 'pk(Alice)',
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
      playgroundMode: 'invalid',
    };

    const encoded = encodeSharePayload(payload as SharePayload);
    const decoded = decodeSharePayload(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.playgroundMode).toBeUndefined();
  });
});
