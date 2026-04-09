import { describe, expect, it } from 'vitest';
import { APPLICATION_PLAYGROUND_SCENARIO_IDS } from '@/components/intro/data';
import { SCENARIOS } from '@/lib/scenarios/data';
import { sortScenariosForPlayground } from '@/lib/scenarios/playground-order';

describe('sortScenariosForPlayground', () => {
  it('matches Applications order for presets that appear on the homepage', () => {
    const sorted = sortScenariosForPlayground(SCENARIOS);
    const appIds = APPLICATION_PLAYGROUND_SCENARIO_IDS;
    const head = sorted.slice(0, appIds.length).map((s) => s.id);
    expect(head).toEqual(appIds);
  });

  it('places presets not in Applications after the Applications block', () => {
    const sorted = sortScenariosForPlayground(SCENARIOS);
    const appSet = new Set(APPLICATION_PLAYGROUND_SCENARIO_IDS);
    const tail = sorted.filter((s) => !appSet.has(s.id));
    expect(tail.map((s) => s.id).sort()).toEqual(
      ['degrading-multisig', 'vault-hot-cold'].sort(),
    );
  });
});
