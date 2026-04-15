import { describe, it, expect, vi } from 'vitest';
import { applyPlaygroundSearchParams } from '../apply-playground-search-params';
import type { SharePayload } from '@/lib/utils/share';

function params(entries: Record<string, string>): URLSearchParams {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(entries)) u.set(k, v);
  return u;
}

describe('applyPlaygroundSearchParams', () => {
  it('prefers s over scenario and mode', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();
    const decode = vi.fn((): SharePayload | null => ({
      policy: 'pk(A)',
      keyVariables: [],
      context: 'wsh',
      network: 'testnet',
    }));

    applyPlaygroundSearchParams(
      params({ s: 'x', scenario: '2fa-recovery', mode: 'build' }),
      { restoreSession, loadScenario, enterBuildMode },
      decode,
    );

    expect(decode).toHaveBeenCalledWith('x');
    expect(restoreSession).toHaveBeenCalledTimes(1);
    expect(loadScenario).not.toHaveBeenCalled();
    expect(enterBuildMode).not.toHaveBeenCalled();
  });

  it('falls back to scenario when s decode fails', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();
    const decode = vi.fn(() => null);

    applyPlaygroundSearchParams(
      params({ s: 'bad', scenario: '2fa-recovery' }),
      { restoreSession, loadScenario, enterBuildMode },
      decode,
    );

    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).toHaveBeenCalledWith('2fa-recovery');
  });

  it('uses mode=build when no s and no scenario', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();

    applyPlaygroundSearchParams(
      params({ mode: 'build' }),
      { restoreSession, loadScenario, enterBuildMode },
    );

    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).not.toHaveBeenCalled();
    expect(enterBuildMode).toHaveBeenCalledTimes(1);
  });

  it('does nothing when query is empty', () => {
    const restoreSession = vi.fn();
    const loadScenario = vi.fn();
    const enterBuildMode = vi.fn();

    applyPlaygroundSearchParams(params({}), { restoreSession, loadScenario, enterBuildMode });

    expect(restoreSession).not.toHaveBeenCalled();
    expect(loadScenario).not.toHaveBeenCalled();
    expect(enterBuildMode).not.toHaveBeenCalled();
  });
});
