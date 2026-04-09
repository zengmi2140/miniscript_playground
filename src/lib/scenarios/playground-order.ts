import { APPLICATION_PLAYGROUND_SCENARIO_IDS } from '@/components/intro/data';
import type { Scenario } from '@/lib/engine/types';

const APPLICATION_ORDER = new Map(
  APPLICATION_PLAYGROUND_SCENARIO_IDS.map((id, i) => [id, i]),
);

/**
 * Playground 左栏：与首页 Applications 卡片顺序一致；未出现在 Applications 的预设排在末尾。
 */
export function sortScenariosForPlayground(scenarios: Scenario[]): Scenario[] {
  return [...scenarios].sort((a, b) => {
    const ia = APPLICATION_ORDER.get(a.id);
    const ib = APPLICATION_ORDER.get(b.id);
    if (ia !== undefined && ib !== undefined) return ia - ib;
    if (ia !== undefined) return -1;
    if (ib !== undefined) return 1;
    return a.id.localeCompare(b.id);
  });
}
