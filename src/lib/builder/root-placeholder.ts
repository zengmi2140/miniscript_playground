import type { StrategyNode } from './types';

/** Stable id for the initial root placeholder shown when entering build mode or clearing policy. */
export const ROOT_PLACEHOLDER_ID = 'root_placeholder';

/**
 * Fresh root placeholder: user picks strategy type from the canvas (dashed "选择策略类型").
 */
export function createRootPlaceholderTree(): StrategyNode {
  return {
    id: ROOT_PLACEHOLDER_ID,
    kind: 'placeholder',
    placeholderType: 'root',
  };
}
