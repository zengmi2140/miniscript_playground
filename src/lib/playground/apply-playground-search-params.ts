import type { SharePayload } from '@/lib/utils/share';
import { decodeSharePayload } from '@/lib/utils/share';

export interface ApplyPlaygroundSearchParamsActions {
  restoreSession: (payload: SharePayload) => void;
  loadScenario: (scenarioId: string) => void;
  enterBuildMode: () => void;
}

/**
 * Applies Playground URL query: `s` (share) &gt; `scenario` &gt; `mode=build`.
 * Call when `searchParams` changes (including client-side navigation).
 */
export function applyPlaygroundSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>,
  actions: ApplyPlaygroundSearchParamsActions,
  decode: (encoded: string) => SharePayload | null = decodeSharePayload,
): void {
  const s = searchParams.get('s');
  if (s) {
    const payload = decode(s);
    if (payload) {
      actions.restoreSession(payload);
      return;
    }
  }

  const scenarioId = searchParams.get('scenario');
  if (scenarioId) {
    actions.loadScenario(scenarioId);
    return;
  }

  if (searchParams.get('mode') === 'build') {
    actions.enterBuildMode();
  }
}
