// Types
export * from './types';

// Templates
export { getTemplate, singleSigTemplate, sharedControlTemplate, recoveryTemplate, resetNodeIdCounter } from './templates';

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
  wrapNodeInGroup,
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
