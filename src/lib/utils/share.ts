import type { KeyVariable, ScriptContext, Network, PlaygroundMode } from '@/lib/engine/types';
import { isValidPolicyIdentifier } from '@/lib/utils/policy-identifiers';
import {
  MAX_POLICY_KEY_NAME_LENGTH,
  MAX_POLICY_KEY_VARIABLES,
  MAX_POLICY_LENGTH,
  MAX_POLICY_PUBLIC_KEY_LENGTH,
  isSupportedPublicKey,
  validatePolicyCompileInput,
} from '@/lib/engine/policy-limits';

const PLAYGROUND_MODES = new Set<PlaygroundMode>(['scenario', 'build']);

const NETWORKS = new Set<Network>(['testnet', 'signet']);
const CONTEXTS = new Set<ScriptContext>(['wsh', 'tr']);

/** Policy text upper bound shared by compile, share, and session validation. */
export const MAX_SHARE_POLICY_LENGTH = MAX_POLICY_LENGTH;
/** Display label and stable identifier upper bound. */
export const MAX_SHARE_KEY_NAME_LENGTH = MAX_POLICY_KEY_NAME_LENGTH;
/** Compressed or x-only public key upper bound. */
export const MAX_SHARE_PUBLIC_KEY_LENGTH = MAX_POLICY_PUBLIC_KEY_LENGTH;
/** Key variables upper bound for share payloads. */
export const MAX_SHARE_KEY_VARIABLES = MAX_POLICY_KEY_VARIABLES;
/** Decoded JSON payload upper bound (bytes). */
export const MAX_SHARE_DECODED_PAYLOAD_BYTES = 16 * 1024;
/** Base64URL characters needed to represent the largest accepted decoded payload. */
export const MAX_SHARE_ENCODED_PAYLOAD_CHARS =
  Math.ceil(MAX_SHARE_DECODED_PAYLOAD_BYTES / 3) * 4;

/** Full URL length above which we warn the user (proxies / older browsers). */
export const SHARE_URL_WARNING_LENGTH = 2048;

export interface SharePayload {
  policy: string;
  keyVariables: KeyVariable[];
  context: ScriptContext;
  network: Network;
  playgroundMode?: PlaygroundMode;
}

export interface ValidatedPlaygroundFields {
  policy: string;
  keyVariables: KeyVariable[];
  context: ScriptContext;
  network: Network;
  playgroundMode?: PlaygroundMode;
}

function validateKeyVariablesList(arr: unknown): KeyVariable[] | null {
  if (!Array.isArray(arr) || arr.length > MAX_SHARE_KEY_VARIABLES) return null;
  const out: KeyVariable[] = [];
  const seenPolicyNames = new Set<string>();
  for (const item of arr) {
    if (typeof item !== 'object' || item === null) return null;
    const o = item as Record<string, unknown>;
    const { name, policyName, publicKey } = o;
    if (
      typeof name !== 'string' ||
      name.length === 0 ||
      name.length > MAX_SHARE_KEY_NAME_LENGTH ||
      typeof policyName !== 'string' ||
      policyName.length === 0 ||
      policyName.length > MAX_SHARE_KEY_NAME_LENGTH ||
      typeof publicKey !== 'string' ||
      publicKey.length === 0 ||
      publicKey.length > MAX_SHARE_PUBLIC_KEY_LENGTH ||
      !isSupportedPublicKey(publicKey)
    ) {
      return null;
    }
    // P1-02: policyName is the stable ID inside policy text — enforce
    // valid identifier shape and uniqueness across the payload.
    if (!isValidPolicyIdentifier(policyName)) return null;
    if (seenPolicyNames.has(policyName)) return null;
    seenPolicyNames.add(policyName);
    out.push({ name, policyName, publicKey });
  }
  return out;
}

/**
 * Validates decoded JSON body for share links and legacy session storage.
 * Returns null if shape or values are invalid.
 */
export function parseValidPlaygroundPayload(
  parsed: Record<string, unknown>,
): ValidatedPlaygroundFields | null {
  if (typeof parsed.policy !== 'string' || parsed.policy.length > MAX_SHARE_POLICY_LENGTH) {
    return null;
  }
  const keyVariables = validateKeyVariablesList(parsed.keyVariables);
  if (keyVariables === null) return null;
  if (validatePolicyCompileInput(parsed.policy, keyVariables)) return null;
  if (typeof parsed.context !== 'string' || !CONTEXTS.has(parsed.context as ScriptContext)) {
    return null;
  }
  if (typeof parsed.network !== 'string' || !NETWORKS.has(parsed.network as Network)) {
    return null;
  }
  let playgroundMode: PlaygroundMode | undefined;
  if (parsed.playgroundMode !== undefined) {
    if (
      typeof parsed.playgroundMode === 'string' &&
      PLAYGROUND_MODES.has(parsed.playgroundMode as PlaygroundMode)
    ) {
      playgroundMode = parsed.playgroundMode as PlaygroundMode;
    }
    /* invalid mode: omit (legacy payloads), same as previous decodeSharePayload */
  }
  return {
    policy: parsed.policy,
    keyVariables,
    context: parsed.context as ScriptContext,
    network: parsed.network as Network,
    ...(playgroundMode !== undefined ? { playgroundMode } : {}),
  };
}

const UTF8_ENCODER = new TextEncoder();
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/u, '');
}

function decodeBase64UrlToBytes(encoded: string): Uint8Array {
  const paddingLength = (4 - (encoded.length % 4)) % 4;
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat(paddingLength);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeSharePayload(payload: SharePayload): string {
  const validated = parseValidPlaygroundPayload(payload as unknown as Record<string, unknown>);
  if (!validated) {
    throw new Error('Share payload exceeds allowed field limits or has an invalid shape');
  }
  const json = JSON.stringify(payload);
  const bytes = UTF8_ENCODER.encode(json);
  if (bytes.length > MAX_SHARE_DECODED_PAYLOAD_BYTES) {
    throw new Error('Share payload exceeds the decoded byte limit');
  }
  return bytesToBase64Url(bytes);
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    if (
      encoded.length === 0 ||
      encoded.length > MAX_SHARE_ENCODED_PAYLOAD_CHARS ||
      !/^[A-Za-z0-9_-]+$/u.test(encoded)
    ) {
      return null;
    }
    const estimatedBytes = Math.floor((encoded.length * 3) / 4);
    if (estimatedBytes > MAX_SHARE_DECODED_PAYLOAD_BYTES) return null;

    const bytes = decodeBase64UrlToBytes(encoded);
    if (bytes.length > MAX_SHARE_DECODED_PAYLOAD_BYTES) return null;
    const json = UTF8_DECODER.decode(bytes);
    const parsed: unknown = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const body = parseValidPlaygroundPayload(parsed as Record<string, unknown>);
    if (!body) return null;
    return {
      policy: body.policy,
      keyVariables: body.keyVariables,
      context: body.context,
      network: body.network,
      ...(body.playgroundMode !== undefined ? { playgroundMode: body.playgroundMode } : {}),
    };
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const encoded = encodeSharePayload(payload);
  const url = new URL(window.location.origin + '/playground');
  url.hash = new URLSearchParams({ s: encoded }).toString();
  return url.toString();
}

export function isShareUrlLikelyTooLong(url: string): boolean {
  return url.length > SHARE_URL_WARNING_LENGTH;
}
