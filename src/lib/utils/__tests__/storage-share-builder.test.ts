import { describe, it, expect, beforeEach } from 'vitest';
import { saveSession, loadSession, clearSession } from '../storage';
import {
  encodeSharePayload,
  decodeSharePayload,
  MAX_SHARE_DECODED_PAYLOAD_BYTES,
  MAX_SHARE_ENCODED_PAYLOAD_CHARS,
  MAX_SHARE_KEY_VARIABLES,
  MAX_SHARE_POLICY_LENGTH,
  buildShareUrl,
} from '../share';
import type { SharePayload } from '../share';

const ALICE_KEY = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798';
const BOB_KEY = '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5';

function encodeRawPayload(payload: unknown): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

describe('storage (legacy key cleanup)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clearSession removes scriptwise-session', () => {
    saveSession({
      policy: 'pk(Alice)',
      keyVariables: [
        { name: 'Alice', policyName: 'Alice', publicKey: ALICE_KEY },
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
        { name: 'User', policyName: 'User', publicKey: ALICE_KEY },
        { name: 'Service', policyName: 'Service', publicKey: BOB_KEY },
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
    const encoded = encodeRawPayload(bad);
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it('decodeSharePayload returns null for invalid context', () => {
    const bad = {
      policy: 'pk(A)',
      keyVariables: [],
      context: 'p2pkh',
      network: 'testnet',
    };
    const encoded = encodeRawPayload(bad);
    expect(decodeSharePayload(encoded)).toBeNull();
  });

  it('decodeSharePayload returns null for malformed keyVariables entry', () => {
    const bad = {
      policy: 'pk(A)',
      keyVariables: [{ name: 'A', policyName: 'A' }],
      context: 'wsh',
      network: 'testnet',
    };
    const encoded = encodeRawPayload(bad);
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

    const encoded = encodeRawPayload(payload);
    const decoded = decodeSharePayload(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded!.playgroundMode).toBeUndefined();
  });
});

describe('share payload hardening', () => {
  it('rejects generation when policy exceeds the shared business limit', () => {
    const payload: SharePayload = {
      policy: 'a'.repeat(MAX_SHARE_POLICY_LENGTH + 1),
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
    };
    expect(() => encodeSharePayload(payload)).toThrow();
  });

  it('rejects payloads with more than 32 key variables', () => {
    const keyVariables = Array.from({ length: MAX_SHARE_KEY_VARIABLES + 1 }, (_, i) => ({
      name: `K${i}`,
      policyName: `K${i}`,
      publicKey: ALICE_KEY,
    }));
    const payload: SharePayload = {
      policy: 'pk(K0)',
      keyVariables,
      context: 'wsh',
      network: 'testnet',
    };
    expect(() => encodeSharePayload(payload)).toThrow();
  });

  it('rejects oversized input before Base64URL decoding', () => {
    expect(decodeSharePayload('A'.repeat(MAX_SHARE_ENCODED_PAYLOAD_CHARS + 1))).toBeNull();
  });

  it('rejects non-canonical Base64URL characters and padding', () => {
    expect(decodeSharePayload('abc+def')).toBeNull();
    expect(decodeSharePayload('abc/def')).toBeNull();
    expect(decodeSharePayload('abc=')).toBeNull();
    expect(decodeSharePayload('!not-base64url')).toBeNull();
  });

  it('accepts valid payloads within limits', () => {
    const payload: SharePayload = {
      policy: 'pk(Alice)',
      keyVariables: [{ name: 'Alice', policyName: 'Alice', publicKey: ALICE_KEY }],
      context: 'wsh',
      network: 'testnet',
      playgroundMode: 'scenario',
    };

    const encoded = encodeSharePayload(payload);
    const decoded = decodeSharePayload(encoded);

    expect(decoded).toEqual(payload);
  });

  it('uses URL-safe characters without padding', () => {
    const encoded = encodeSharePayload({
      policy: 'pk(Alice)',
      keyVariables: [{ name: 'Alice', policyName: 'Alice', publicKey: ALICE_KEY }],
      context: 'wsh',
      network: 'testnet',
    });

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/u);
    expect(encoded).not.toContain('=');
  });

  it('builds fragment share URLs and never emits query s', () => {
    const url = new URL(
      buildShareUrl({
        policy: 'pk(Alice)',
        keyVariables: [{ name: 'Alice', policyName: 'Alice', publicKey: ALICE_KEY }],
        context: 'wsh',
        network: 'testnet',
      }),
    );

    expect(url.pathname).toBe('/playground');
    expect(url.searchParams.has('s')).toBe(false);
    expect(new URLSearchParams(url.hash.slice(1)).get('s')).toBeTruthy();
  });

  it('rejects decoded JSON above the byte limit', () => {
    const oversized = encodeRawPayload({
      policy: 'a'.repeat(MAX_SHARE_DECODED_PAYLOAD_BYTES),
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
    });
    expect(decodeSharePayload(oversized)).toBeNull();
  });
});
