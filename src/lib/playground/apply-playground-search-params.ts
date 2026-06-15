import type { SharePayload } from '@/lib/utils/share';
import { decodeSharePayload } from '@/lib/utils/share';

export interface ApplyPlaygroundSearchParamsActions {
  restoreSession: (payload: SharePayload) => void;
  loadScenario: (scenarioId: string) => void;
  enterBuildMode: () => void;
  notifyInvalidSharePayload?: () => void;
}

/**
 * Applies Playground URL state: fragment `s` (share) &gt; query `scenario`
 * &gt; query `mode=build`. Legacy query-string `s` values are intentionally ignored.
 */
export function applyPlaygroundUrlState(
  searchParams: Pick<URLSearchParams, 'get'>,
  hash: string,
  actions: ApplyPlaygroundSearchParamsActions,
  decode: (encoded: string) => SharePayload | null = decodeSharePayload,
): void {
  const fragmentParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const s = fragmentParams.get('s');
  if (s) {
    const payload = decode(s);
    if (payload) {
      actions.restoreSession(payload);
      return;
    }
    actions.notifyInvalidSharePayload?.();
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
