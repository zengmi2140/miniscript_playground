import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';
import type { MiniscriptNode } from '@/lib/engine/types';

export type FlowNodeType = 'root' | 'operator' | 'condition';

export interface FlowNodeData {
  nodeType: FlowNodeType;
  label: string;
  conditionType?: 'key' | 'timelock' | 'hashlock' | 'multi';
  status: 'satisfied' | 'pending' | 'missing';
  parentRelation?: 'and' | 'or' | 'threshold';
  [key: string]: unknown;
}

export interface FlowEdgeData {
  relation: 'and' | 'or' | 'threshold';
  satisfied: boolean;
  [key: string]: unknown;
}

const NODE_SIZES: Record<FlowNodeType, { width: number; height: number }> = {
  root: { width: 200, height: 44 },
  operator: { width: 120, height: 36 },
  condition: { width: 160, height: 40 },
};

let nodeIdCounter = 0;

function nextId(): string {
  return `n_${nodeIdCounter++}`;
}

function getConditionStatus(
  node: MiniscriptNode,
  availableKeys: Set<string>,
  availableHashes: Set<string>,
  currentTimeBlocks: number,
): 'satisfied' | 'pending' | 'missing' {
  switch (node.type) {
    case 'key':
      return availableKeys.has(node.name) ? 'satisfied' : 'missing';
    case 'older':
      return currentTimeBlocks >= node.blocks ? 'satisfied' : 'pending';
    case 'after':
      return 'pending';
    case 'hash':
      return availableHashes.has(node.hash) ? 'satisfied' : 'missing';
    case 'multi':
      return 'missing';
    case 'just_1':
      return 'satisfied';
    case 'just_0':
      return 'missing';
    default:
      return 'missing';
  }
}

function getCompositeStatus(childStatuses: ('satisfied' | 'pending' | 'missing')[], type: 'and' | 'or', k?: number): 'satisfied' | 'pending' | 'missing' {
  if (type === 'and') {
    if (childStatuses.every((s) => s === 'satisfied')) return 'satisfied';
    if (childStatuses.some((s) => s === 'pending')) return 'pending';
    return 'missing';
  }
  if (type === 'or') {
    if (childStatuses.some((s) => s === 'satisfied')) return 'satisfied';
    if (childStatuses.some((s) => s === 'pending')) return 'pending';
    return 'missing';
  }

  const satisfiedCount = childStatuses.filter((s) => s === 'satisfied').length;
  const pendingCount = childStatuses.filter((s) => s === 'pending').length;
  const threshold = k ?? 1;
  if (satisfiedCount >= threshold) return 'satisfied';
  if (satisfiedCount + pendingCount >= threshold) return 'pending';
  return 'missing';
}

function conditionLabel(node: MiniscriptNode): string {
  switch (node.type) {
    case 'key':
      return node.name;
    case 'older':
      return node.humanReadable;
    case 'after':
      return node.humanReadable;
    case 'hash':
      return `${node.hashType}(${node.hash.slice(0, 8)}...)`;
    case 'multi':
      return `${node.k}-of-${node.keys.length}`;
    case 'just_1':
      return 'TRUE';
    case 'just_0':
      return 'FALSE';
    default:
      return '?';
  }
}

function conditionType(node: MiniscriptNode): FlowNodeData['conditionType'] {
  switch (node.type) {
    case 'key':
      return 'key';
    case 'older':
    case 'after':
      return 'timelock';
    case 'hash':
      return 'hashlock';
    case 'multi':
      return 'multi';
    default:
      return undefined;
  }
}

interface BuildResult {
  nodeId: string;
  status: 'satisfied' | 'pending' | 'missing';
}

function buildGraph(
  msNode: MiniscriptNode,
  nodes: Node<FlowNodeData>[],
  edges: Edge<FlowEdgeData>[],
  availableKeys: Set<string>,
  availableHashes: Set<string>,
  currentTimeBlocks: number,
  parentId?: string,
  relation?: 'and' | 'or' | 'threshold',
): BuildResult {
  const isLeaf =
    msNode.type === 'key' ||
    msNode.type === 'older' ||
    msNode.type === 'after' ||
    msNode.type === 'hash' ||
    msNode.type === 'just_1' ||
    msNode.type === 'just_0';

  if (msNode.type === 'multi') {
    const id = nextId();
    const status = getConditionStatus(msNode, availableKeys, availableHashes, currentTimeBlocks);
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'condition',
        label: conditionLabel(msNode),
        conditionType: 'multi',
        status,
        parentRelation: relation,
      },
    });
    if (parentId) {
      edges.push({
        id: `e_${parentId}_${id}`,
        source: parentId,
        target: id,
        type: 'pathEdge',
        data: { relation: relation || 'and', satisfied: status === 'satisfied' },
      });
    }
    return { nodeId: id, status };
  }

  if (isLeaf) {
    const id = nextId();
    const status = getConditionStatus(msNode, availableKeys, availableHashes, currentTimeBlocks);
    nodes.push({
      id,
      type: 'condition',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'condition',
        label: conditionLabel(msNode),
        conditionType: conditionType(msNode),
        status,
        parentRelation: relation,
      },
    });
    if (parentId) {
      edges.push({
        id: `e_${parentId}_${id}`,
        source: parentId,
        target: id,
        type: 'pathEdge',
        data: { relation: relation || 'and', satisfied: status === 'satisfied' },
      });
    }
    return { nodeId: id, status };
  }

  if (msNode.type === 'and' || msNode.type === 'or') {
    const opType = msNode.type;
    const id = nextId();
    const labelText = opType === 'and' ? '都需要' : '任选一';

    nodes.push({
      id,
      type: 'operator',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'operator',
        label: labelText,
        status: 'missing',
        parentRelation: relation,
      },
    });

    if (parentId) {
      edges.push({
        id: `e_${parentId}_${id}`,
        source: parentId,
        target: id,
        type: 'pathEdge',
        data: { relation: relation || 'and', satisfied: false },
      });
    }

    const childStatuses: ('satisfied' | 'pending' | 'missing')[] = [];
    for (const child of msNode.children) {
      const result = buildGraph(child, nodes, edges, availableKeys, availableHashes, currentTimeBlocks, id, opType);
      childStatuses.push(result.status);
    }

    const compositeStatus = getCompositeStatus(childStatuses, opType);
    const nodeRef = nodes.find((n) => n.id === id);
    if (nodeRef) nodeRef.data.status = compositeStatus;

    if (parentId) {
      const edgeRef = edges.find((e) => e.id === `e_${parentId}_${id}`);
      if (edgeRef?.data) edgeRef.data.satisfied = compositeStatus === 'satisfied';
    }

    return { nodeId: id, status: compositeStatus };
  }

  if (msNode.type === 'threshold') {
    const id = nextId();
    nodes.push({
      id,
      type: 'operator',
      position: { x: 0, y: 0 },
      data: {
        nodeType: 'operator',
        label: `${msNode.k}-of-${msNode.n}`,
        status: 'missing',
        parentRelation: relation,
      },
    });

    if (parentId) {
      edges.push({
        id: `e_${parentId}_${id}`,
        source: parentId,
        target: id,
        type: 'pathEdge',
        data: { relation: relation || 'threshold', satisfied: false },
      });
    }

    const childStatuses: ('satisfied' | 'pending' | 'missing')[] = [];
    for (const child of msNode.children) {
      const result = buildGraph(child, nodes, edges, availableKeys, availableHashes, currentTimeBlocks, id, 'threshold');
      childStatuses.push(result.status);
    }

    const compositeStatus = getCompositeStatus(childStatuses, 'or', msNode.k);
    const nodeRef = nodes.find((n) => n.id === id);
    if (nodeRef) nodeRef.data.status = compositeStatus;

    if (parentId) {
      const edgeRef = edges.find((e) => e.id === `e_${parentId}_${id}`);
      if (edgeRef?.data) edgeRef.data.satisfied = compositeStatus === 'satisfied';
    }

    return { nodeId: id, status: compositeStatus };
  }

  const id = nextId();
  nodes.push({
    id,
    type: 'condition',
    position: { x: 0, y: 0 },
    data: { nodeType: 'condition', label: '?', status: 'missing' },
  });
  return { nodeId: id, status: 'missing' };
}

function layoutWithDagre(nodes: Node<FlowNodeData>[], edges: Edge<FlowEdgeData>[]): void {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 60 });

  for (const node of nodes) {
    const size = NODE_SIZES[node.type as FlowNodeType] || NODE_SIZES.condition;
    g.setNode(node.id, { width: size.width, height: size.height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  for (const node of nodes) {
    const pos = g.node(node.id);
    const size = NODE_SIZES[node.type as FlowNodeType] || NODE_SIZES.condition;
    node.position = {
      x: pos.x - size.width / 2,
      y: pos.y - size.height / 2,
    };
  }
}

export function treeToFlow(
  tree: MiniscriptNode,
  availableKeys: Set<string>,
  availableHashes: Set<string>,
  currentTimeBlocks: number,
): { nodes: Node<FlowNodeData>[]; edges: Edge<FlowEdgeData>[] } {
  nodeIdCounter = 0;

  const nodes: Node<FlowNodeData>[] = [];
  const edges: Edge<FlowEdgeData>[] = [];

  const rootId = nextId();
  nodes.push({
    id: rootId,
    type: 'root',
    position: { x: 0, y: 0 },
    data: {
      nodeType: 'root',
      label: '花费条件',
      status: 'missing',
    },
  });

  const isLeafTree =
    tree.type === 'key' ||
    tree.type === 'older' ||
    tree.type === 'after' ||
    tree.type === 'hash' ||
    tree.type === 'multi' ||
    tree.type === 'just_1' ||
    tree.type === 'just_0';

  if (isLeafTree) {
    const result = buildGraph(tree, nodes, edges, availableKeys, availableHashes, currentTimeBlocks, rootId, 'and');
    const rootNode = nodes.find((n) => n.id === rootId);
    if (rootNode) rootNode.data.status = result.status;
  } else if (tree.type === 'and' || tree.type === 'or') {
    const childStatuses: ('satisfied' | 'pending' | 'missing')[] = [];
    for (const child of tree.children) {
      const result = buildGraph(child, nodes, edges, availableKeys, availableHashes, currentTimeBlocks, rootId, tree.type);
      childStatuses.push(result.status);
    }
    const compositeStatus = getCompositeStatus(childStatuses, tree.type);
    const rootNode = nodes.find((n) => n.id === rootId);
    if (rootNode) rootNode.data.status = compositeStatus;
  } else if (tree.type === 'threshold') {
    const childStatuses: ('satisfied' | 'pending' | 'missing')[] = [];
    for (const child of tree.children) {
      const result = buildGraph(child, nodes, edges, availableKeys, availableHashes, currentTimeBlocks, rootId, 'threshold');
      childStatuses.push(result.status);
    }
    const compositeStatus = getCompositeStatus(childStatuses, 'or', tree.k);
    const rootNode = nodes.find((n) => n.id === rootId);
    if (rootNode) rootNode.data.status = compositeStatus;
  }

  layoutWithDagre(nodes, edges);

  return { nodes, edges };
}
