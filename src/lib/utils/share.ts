import type { KeyVariable, ScriptContext, Network, PlaygroundMode } from '@/lib/engine/types';

const PLAYGROUND_MODES = new Set<PlaygroundMode>(['scenario', 'build']);

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
    let playgroundMode: PlaygroundMode | undefined;
    if (parsed.playgroundMode !== undefined) {
      if (
        typeof parsed.playgroundMode === 'string' &&
        PLAYGROUND_MODES.has(parsed.playgroundMode as PlaygroundMode)
      ) {
        playgroundMode = parsed.playgroundMode as PlaygroundMode;
      }
    }
    return {
      policy: parsed.policy,
      keyVariables: parsed.keyVariables,
      context: parsed.context,
      network: parsed.network,
      ...(playgroundMode !== undefined ? { playgroundMode } : {}),
    };
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
