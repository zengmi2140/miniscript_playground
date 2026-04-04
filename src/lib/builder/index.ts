// Types
export * from './types';

export { createRootPlaceholderTree, ROOT_PLACEHOLDER_ID } from './root-placeholder';

// Test fixtures
export { singleSigTemplate, sharedControlTemplate, nestedRecoveryLikeTree, resetNodeIdCounter } from './templates';

// Serialization
export { serializeStrategyTree } from './serialize';

// Import from semantic tree
export { importFromSemanticTree } from './from-semantic-tree';

// Node operations
export {
  findNode,
  updateNode,
  removeNode,
  addChildNode,
  canAddChildToBinaryGroup,
  countRealChildren,
  defaultThresholdK,
  clampThresholdK,
  wrapNodeInGroup,
  changeGroupOp,
  computeTreeDepth,
  updateThreshold,
  updateTimelockValue,
  updateSignatureRole,
  addSignatureChild,
  addTimelockChild,
  collectRoleIds,
  convertRootPlaceholder,
  convertChildPlaceholder,
  createDefaultKeyVariables,
  createSignatureNode,
  createTimelockNode,
} from './node-ops';

// Flow conversion
export { builderTreeToFlow } from './tree-to-flow';

// Status computation
export { computeBuilderStatus, getStatusLabel } from './status';
export type { BuilderStatusMap } from './status';
// Note: BuilderNodeStatus is re-exported from ./types via export * to avoid conflicts

// Path highlighting
export { collectHighlightedNodeIds } from './path-highlighting';
