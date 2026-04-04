/**
 * Builder Tree to Flow Conversion
 *
 * Converts a StrategyNode tree into React Flow nodes and edges
 * for display in the builder canvas.
 */

import type { Node, Edge } from '@xyflow/react';
import type { StrategyNode } from './types';
import { blocksToHumanTime } from './types';

export type BuilderNodeType = 'builderRoot' | 'builderOperator' | 'builderCondition' | 'builderPlaceholder' | 'builderAddChild';

export type BuilderNodeStatus = 'satisfied' | 'pending' | 'missing';

export interface BuilderFlowNodeData {
  nodeType: BuilderNodeType;
  strategyNodeId: string;
  label: string;
  kind: StrategyNode['kind'];
  op?: 'all' | 'any' | 'threshold';
  threshold?: number;
  childCount?: number;
  roleId?: string;
  timelockValue?: number;
  timelockMode?: 'relative' | 'absolute';
  placeholderType?: 'root' | 'child';
  status: BuilderNodeStatus;
  isReadOnly: boolean;
  isHighlighted: boolean;
  isUndefinedRole?: boolean;
  /** virtual = parent group id for append; treePlaceholder = placeholder node id for replace */
  addChildSlotKind?: 'virtual' | 'treePlaceholder';
  [key: string]: unknown;
}

export interface BuilderFlowEdgeData {
  relation: 'all' | 'any' | 'threshold';
  satisfied: boolean;
  [key: string]: unknown;
}

const NODE_SIZES: Record<BuilderNodeType, { width: number; height: number }> = {
  builderRoot: { width: 180, height: 44 },
  builderOperator: { width: 140, height: 40 },
  builderCondition: { width: 160, height: 44 },
  builderPlaceholder: { width: 200, height: 60 },
  builderAddChild: { width: 120, height: 36 },
};

let flowNodeIdCounter = 0;

function nextFlowId(): string {
  return `bf_${flowNodeIdCounter++}`;
}

/**
 * Reset the flow node ID counter (useful for tests)
 */
export function resetFlowNodeIdCounter(): void {
  flowNodeIdCounter = 0;
}

/**
 * Compute status for a strategy node based on available conditions
 */
function computeNodeStatus(
  node: StrategyNode,
  availableKeys: Set<string>,
  currentTimeBlocks: number,
  statusMap: Map<string, BuilderNodeStatus>
): BuilderNodeStatus {
  switch (node.kind) {
    case 'placeholder':
      // Placeholders are always in pending state (waiting for user input)
      return 'pending';

    case 'signature':
      return availableKeys.has(node.roleId) ? 'satisfied' : 'missing';

    case 'timelock':
      if (node.mode === 'relative') {
        return currentTimeBlocks >= node.value ? 'satisfied' : 'pending';
      }
      // Absolute timelock - always pending in MVP
      return 'pending';

    case 'hashlock':
      // Hashlocks are always missing in MVP (no hash toggle support)
      return 'missing';

    case 'group': {
      // Filter out placeholders when computing group status
      const realChildren = node.children.filter((c) => c.kind !== 'placeholder');
      const childStatuses = realChildren.map(
        (child) => statusMap.get(child.id) ?? 'missing'
      );

      // Empty group = pending (waiting for children)
      if (childStatuses.length === 0) return 'pending';

      switch (node.op) {
        case 'all':
          if (childStatuses.every((s) => s === 'satisfied')) return 'satisfied';
          if (childStatuses.some((s) => s === 'pending')) return 'pending';
          return 'missing';

        case 'any':
          if (childStatuses.some((s) => s === 'satisfied')) return 'satisfied';
          if (childStatuses.some((s) => s === 'pending')) return 'pending';
          return 'missing';

        case 'threshold': {
          const k = node.threshold ?? 1;
          const satisfiedCount = childStatuses.filter((s) => s === 'satisfied').length;
          const pendingCount = childStatuses.filter((s) => s === 'pending').length;
          if (satisfiedCount >= k) return 'satisfied';
          if (satisfiedCount + pendingCount >= k) return 'pending';
          return 'missing';
        }

        default:
          return 'missing';
      }
    }

    default:
      return 'missing';
  }
}

/**
 * Recursively compute status for all nodes in the tree (bottom-up)
 */
function computeAllStatuses(
  node: StrategyNode,
  availableKeys: Set<string>,
  currentTimeBlocks: number,
  statusMap: Map<string, BuilderNodeStatus>
): void {
  // Process children first (bottom-up)
  if (node.kind === 'group') {
    for (const child of node.children) {
      computeAllStatuses(child, availableKeys, currentTimeBlocks, statusMap);
    }
  }

  // Then compute this node's status
  const status = computeNodeStatus(node, availableKeys, currentTimeBlocks, statusMap);
  statusMap.set(node.id, status);
}

/**
 * Get label for a strategy node
 * @param addConditionLine — full line for child placeholder / virtual add (from i18n via options.labels)
 */
function getNodeLabel(
  node: StrategyNode,
  locale: 'zh' | 'en' = 'zh',
  addConditionLine?: string
): string {
  switch (node.kind) {
    case 'placeholder':
      if (node.placeholderType === 'root') {
        return locale === 'zh' ? '选择策略类型' : 'Choose Strategy Type';
      }
      return addConditionLine ?? (locale === 'zh' ? '+ 添加条件' : '+ Add Condition');

    case 'signature':
      return node.roleId;

    case 'timelock':
      if (node.mode === 'relative') {
        const human = blocksToHumanTime(node.value);
        return `${node.value} ${locale === 'zh' ? '区块' : 'blocks'} (${human})`;
      }
      return `${locale === 'zh' ? '区块高度' : 'Block'} ${node.value}`;

    case 'hashlock':
      return `${node.hashType}(${node.digest.slice(0, 8)}...)`;

    case 'group':
      switch (node.op) {
        case 'all':
          return locale === 'zh' ? '都需要' : 'All Required';
        case 'any':
          return locale === 'zh' ? '任选一' : 'Any One';
        case 'threshold': {
          const realChildCount = node.children.filter((c) => c.kind !== 'placeholder').length;
          const k = node.threshold ?? 1;
          const kDisplay = Math.min(Math.max(1, k), Math.max(1, realChildCount));
          return `${kDisplay}-of-${realChildCount}`;
        }
        default:
          return '';
      }

    default:
      return '';
  }
}

interface BuildContext {
  nodes: Node<BuilderFlowNodeData>[];
  edges: Edge<BuilderFlowEdgeData>[];
  statusMap: Map<string, BuilderNodeStatus>;
  highlightedIds: Set<string>;
  definedRoles: Set<string>;
  isReadOnly: boolean;
  locale: 'zh' | 'en';
  /** Virtual add-child strip + tree child placeholder label, e.g. "+ Add Condition" */
  addConditionLine: string;
}

function buildFlowGraph(
  strategyNode: StrategyNode,
  ctx: BuildContext,
  parentFlowId?: string,
  relation?: 'all' | 'any' | 'threshold'
): string {
  const flowId = nextFlowId();
  const status = ctx.statusMap.get(strategyNode.id) ?? 'missing';
  const isHighlighted = ctx.highlightedIds.has(strategyNode.id);
  const label = getNodeLabel(strategyNode, ctx.locale, ctx.addConditionLine);

  // Determine node type
  let nodeType: BuilderNodeType;
  if (strategyNode.kind === 'placeholder') {
    nodeType = strategyNode.placeholderType === 'root' ? 'builderPlaceholder' : 'builderAddChild';
  } else if (!parentFlowId) {
    nodeType = 'builderRoot';
  } else if (strategyNode.kind === 'group') {
    nodeType = 'builderOperator';
  } else {
    nodeType = 'builderCondition';
  }

  const isUndefinedRole =
    strategyNode.kind === 'signature' && !ctx.definedRoles.has(strategyNode.roleId);

  const nodeData: BuilderFlowNodeData = {
    nodeType,
    strategyNodeId: strategyNode.id,
    label,
    kind: strategyNode.kind,
    status,
    isReadOnly: ctx.isReadOnly,
    isHighlighted,
    isUndefinedRole,
  };

  // Add kind-specific data
  if (strategyNode.kind === 'group') {
    nodeData.op = strategyNode.op;
    nodeData.threshold = strategyNode.threshold;
    // Count real children (exclude placeholders)
    nodeData.childCount = strategyNode.children.filter((c) => c.kind !== 'placeholder').length;
  } else if (strategyNode.kind === 'signature') {
    nodeData.roleId = strategyNode.roleId;
  } else if (strategyNode.kind === 'timelock') {
    nodeData.timelockValue = strategyNode.value;
    nodeData.timelockMode = strategyNode.mode;
  } else if (strategyNode.kind === 'placeholder') {
    nodeData.placeholderType = strategyNode.placeholderType;
    if (strategyNode.placeholderType === 'child') {
      nodeData.addChildSlotKind = 'treePlaceholder';
    }
  }

  const size = NODE_SIZES[nodeType];
  ctx.nodes.push({
    id: flowId,
    type: nodeType,
    position: { x: 0, y: 0 },
    width: size.width,
    height: size.height,
    data: nodeData,
  });

  if (parentFlowId && relation) {
    ctx.edges.push({
      id: `e_${parentFlowId}_${flowId}`,
      source: parentFlowId,
      target: flowId,
      type: 'builderEdge',
      data: { relation, satisfied: status === 'satisfied' },
    });
  }

  // Recursively process children for group nodes
  if (strategyNode.kind === 'group') {
    for (const child of strategyNode.children) {
      buildFlowGraph(child, ctx, flowId, strategyNode.op);
    }
    
    // Add a virtual "add child" placeholder if not in read-only mode and binary AND/OR is not full (max 2 children)
    const binaryGroupFull =
      (strategyNode.op === 'all' || strategyNode.op === 'any') &&
      strategyNode.children.length >= 2;
    const thresholdHasTreePlaceholder =
      strategyNode.op === 'threshold' &&
      strategyNode.children.some((c) => c.kind === 'placeholder');
    if (!ctx.isReadOnly && !binaryGroupFull && !thresholdHasTreePlaceholder) {
      const addChildId = nextFlowId();
      const addChildLabel = ctx.addConditionLine;
      const addChildSize = NODE_SIZES.builderAddChild;
      ctx.nodes.push({
        id: addChildId,
        type: 'builderAddChild',
        position: { x: 0, y: 0 },
        width: addChildSize.width,
        height: addChildSize.height,
        data: {
          nodeType: 'builderAddChild',
          strategyNodeId: strategyNode.id, // Parent group ID for adding children
          label: addChildLabel,
          kind: 'placeholder' as const,
          status: 'pending',
          isReadOnly: false,
          isHighlighted: false,
          addChildSlotKind: 'virtual',
        },
      });
      ctx.edges.push({
        id: `e_${flowId}_${addChildId}`,
        source: flowId,
        target: addChildId,
        type: 'builderEdge',
        data: { relation: strategyNode.op, satisfied: false },
      });
    }
  }

  return flowId;
}

/** Vertical gap between ranks (matches previous Dagre ranksep). */
const RANK_SEP = 80;
/** Horizontal gap between sibling subtrees. */
const NODE_GAP = 80;

/**
 * Recursive TB layout: each parent is centered over the full width of its child row
 * (including virtual add-child nodes). Subtree widths are computed bottom-up so
 * nested groups never overlap siblings — unlike Dagre + parent-only nudging.
 */
function layoutBuilderTree(
  nodes: Node<BuilderFlowNodeData>[],
  edges: Edge<BuilderFlowEdgeData>[]
): void {
  if (nodes.length === 1) {
    const n = nodes[0];
    const size = NODE_SIZES[n.type as BuilderNodeType] || NODE_SIZES.builderCondition;
    n.position = { x: 0, y: 0 };
    n.width = size.width;
    n.height = size.height;
    return;
  }

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const childrenByParent = new Map<string, string[]>();
  for (const e of edges) {
    const list = childrenByParent.get(e.source) ?? [];
    list.push(e.target);
    childrenByParent.set(e.source, list);
  }

  const hasIncoming = new Set<string>();
  for (const e of edges) {
    hasIncoming.add(e.target);
  }
  const roots = nodes.filter((n) => !hasIncoming.has(n.id));
  if (roots.length === 0) return;

  const measureMemo = new Map<string, number>();

  function measureSubtree(id: string): number {
    if (measureMemo.has(id)) return measureMemo.get(id)!;
    const node = nodeById.get(id);
    if (!node) {
      measureMemo.set(id, 0);
      return 0;
    }
    const selfW = NODE_SIZES[node.type as BuilderNodeType]?.width ?? NODE_SIZES.builderCondition.width;
    const children = childrenByParent.get(id) ?? [];
    if (children.length === 0) {
      measureMemo.set(id, selfW);
      return selfW;
    }
    let sum = 0;
    for (const cid of children) {
      sum += measureSubtree(cid);
    }
    sum += NODE_GAP * (children.length - 1);
    const total = Math.max(selfW, sum);
    measureMemo.set(id, total);
    return total;
  }

  function placeSubtree(id: string, depth: number, left: number, width: number): void {
    const node = nodeById.get(id);
    if (!node) return;
    const sz = NODE_SIZES[node.type as BuilderNodeType] || NODE_SIZES.builderCondition;
    const children = childrenByParent.get(id) ?? [];
    node.position = { x: left + (width - sz.width) / 2, y: depth * RANK_SEP };
    node.width = sz.width;
    node.height = sz.height;

    if (children.length === 0) return;

    const childWidths = children.map((cid) => measureMemo.get(cid) ?? 0);
    let childRowWidth = 0;
    for (let i = 0; i < children.length; i++) {
      childRowWidth += childWidths[i];
      if (i < children.length - 1) childRowWidth += NODE_GAP;
    }
    const childLeftStart = left + (width - childRowWidth) / 2;
    let cursor = childLeftStart;
    for (let i = 0; i < children.length; i++) {
      const cid = children[i];
      const cw = childWidths[i];
      placeSubtree(cid, depth + 1, cursor, cw);
      cursor += cw;
      if (i < children.length - 1) cursor += NODE_GAP;
    }
  }

  let xCursor = 0;
  for (let r = 0; r < roots.length; r++) {
    const rootId = roots[r].id;
    const w = measureSubtree(rootId);
    placeSubtree(rootId, 0, xCursor, w);
    xCursor += w;
    if (r < roots.length - 1) xCursor += NODE_GAP;
  }
}

export interface BuilderTreeToFlowOptions {
  availableKeys: Set<string>;
  currentTimeBlocks: number;
  highlightedIds?: Set<string>;
  definedRoles?: Set<string>;
  isReadOnly?: boolean;
  locale?: 'zh' | 'en';
  /** Optional UI strings; if omitted, locale fallbacks are used */
  labels?: {
    /** Line shown on virtual add-child and child placeholder nodes, e.g. "+ Add Condition" */
    addConditionLine?: string;
  };
}

/**
 * Convert a StrategyNode tree to React Flow nodes and edges
 */
export function builderTreeToFlow(
  tree: StrategyNode,
  options: BuilderTreeToFlowOptions
): { nodes: Node<BuilderFlowNodeData>[]; edges: Edge<BuilderFlowEdgeData>[] } {
  flowNodeIdCounter = 0;

  const {
    availableKeys,
    currentTimeBlocks,
    highlightedIds = new Set(),
    definedRoles = new Set(),
    isReadOnly = false,
    locale = 'zh',
    labels,
  } = options;

  const addConditionLine =
    labels?.addConditionLine ?? (locale === 'zh' ? '+ 添加条件' : '+ Add Condition');

  // Compute statuses bottom-up
  const statusMap = new Map<string, BuilderNodeStatus>();
  computeAllStatuses(tree, availableKeys, currentTimeBlocks, statusMap);

  const ctx: BuildContext = {
    nodes: [],
    edges: [],
    statusMap,
    highlightedIds,
    definedRoles,
    isReadOnly,
    locale,
    addConditionLine,
  };

  buildFlowGraph(tree, ctx);
  layoutBuilderTree(ctx.nodes, ctx.edges);

  return { nodes: ctx.nodes, edges: ctx.edges };
}
