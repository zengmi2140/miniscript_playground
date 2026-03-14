import type { KeyVariable, ScriptContext, Network, PlaygroundMode } from '@/lib/engine/types';

export interface SharePayload {
  policy: string;
  keyVariables: KeyVariable[];
  context: ScriptContext;
  network: Network;
  playgroundMode?: PlaygroundMode;
}

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    const parsed = JSON.parse(json);
    if (
      typeof parsed.policy !== 'string' ||
      !Array.isArray(parsed.keyVariables) ||
      typeof parsed.context !== 'string' ||
      typeof parsed.network !== 'string'
    ) {
      return null;
    }
    return parsed as SharePayload;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const encoded = encodeSharePayload(payload);
  const url = new URL(window.location.origin + '/playground');
  url.searchParams.set('s', encoded);
  return url.toString();
}
