import { describe, it, expect, vi } from 'vitest';
import { applyPlaygroundUrlState } from '../apply-playground-search-params';
import type { SharePayload } from '@/lib/utils/share';

function params(entries: Record<string, string>): URLSearchParams {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(entries)) u.set(k, v);
  return u;
}

describe('applyPlaygroundUrlState', () => {
  it('prefers fragment s over scenario and mode', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();
    const notifyInvalidSharePayload = vi.fn();
    const decode = vi.fn((): SharePayload | null => ({
      policy: 'pk(A)',
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
    }));

    applyPlaygroundUrlState(
      params({ scenario: '2fa-recovery', mode: 'build' }),
      '#s=x',
      { restoreSession, loadScenario, enterBuildMode, notifyInvalidSharePayload },
      decode,
    );

    expect(decode).toHaveBeenCalledWith('x');
    expect(restoreSession).toHaveBeenCalledTimes(1);
    expect(loadScenario).not.toHaveBeenCalled();
    expect(enterBuildMode).not.toHaveBeenCalled();
    expect(notifyInvalidSharePayload).not.toHaveBeenCalled();
  });

  it('falls back to scenario when fragment s decode fails', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();
    const notifyInvalidSharePayload = vi.fn();
    const decode = vi.fn(() => null);

    applyPlaygroundUrlState(
      params({ scenario: '2fa-recovery' }),
      '#s=bad',
      { restoreSession, loadScenario, enterBuildMode, notifyInvalidSharePayload },
      decode,
    );

    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).toHaveBeenCalledWith('2fa-recovery');
    expect(notifyInvalidSharePayload).toHaveBeenCalledTimes(1);
  });

  it('uses mode=build when no s and no scenario', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();

    applyPlaygroundUrlState(
      params({ mode: 'build' }),
      '',
      { restoreSession, loadScenario, enterBuildMode },
    );

    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).not.toHaveBeenCalled();
    expect(enterBuildMode).toHaveBeenCalledTimes(1);
  });

  it('uses mode=build and notifies when s decode fails and no scenario', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();
    const notifyInvalidSharePayload = vi.fn();
    const decode = vi.fn(() => null);

    applyPlaygroundUrlState(
      params({ mode: 'build' }),
      '#s=bad',
      { restoreSession, loadScenario, enterBuildMode, notifyInvalidSharePayload },
      decode,
    );

    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).not.toHaveBeenCalled();
    expect(enterBuildMode).toHaveBeenCalledTimes(1);
    expect(notifyInvalidSharePayload).toHaveBeenCalledTimes(1);
  });

  it('does nothing when query is empty', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();

    applyPlaygroundUrlState(params({}), '', {
      restoreSession,
      loadScenario,
      enterBuildMode,
    });

    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).not.toHaveBeenCalled();
    expect(enterBuildMode).not.toHaveBeenCalled();
  });

  it('ignores legacy query-string s values', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();
    const decode = vi.fn();

    applyPlaygroundUrlState(
      params({ s: 'legacy', scenario: '2fa-recovery' }),
      '',
      { restoreSession, loadScenario, enterBuildMode },
      decode,
    );

    expect(decode).not.toHaveBeenCalled();
    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).toHaveBeenCalledWith('2fa-recovery');
  });
});
