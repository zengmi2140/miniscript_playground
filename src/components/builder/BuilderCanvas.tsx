'use client';

import { useMemo } from 'react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { builderTreeToFlow } from '@/lib/builder/tree-to-flow';
import { builderNodeTypes } from './BuilderNodes';
import { builderEdgeTypes } from './BuilderEdge';
import { BuilderEmptyState } from './BuilderEmptyState';
import { BuilderSyncBanner } from './BuilderSyncBanner';
import { BuilderPopover } from './BuilderPopover';

/**
 * Compute which builder node IDs should be highlighted based on the selected spending path.
 * This maps spending path conditions back to builder tree node IDs.
 */
function computeHighlightedIds(
  strategyTree: import('@/lib/builder/types').StrategyNode | null,
  spendingPaths: import('@/lib/engine/types').SpendingPath[],
  selectedPathIndex: number | null
): Set<string> {
  if (!strategyTree || selectedPathIndex === null || selectedPathIndex >= spendingPaths.length) {
    return new Set();
  }

  const selectedPath = spendingPaths[selectedPathIndex];
  if (!selectedPath) return new Set();

  const highlightedIds = new Set<string>();

  // Collect all signature key names and timelock values from the selected path
  const pathKeys = new Set<string>();
  const pathTimelocks = new Set<number>();

  for (const cond of selectedPath.conditions) {
    if (cond.type === 'signature') {
      pathKeys.add(cond.keyName);
    } else if (cond.type === 'timelock_relative') {
      pathTimelocks.add(cond.blocks);
    }
  }

  // Recursively find matching nodes in the strategy tree
  function findMatchingNodes(node: import('@/lib/builder/types').StrategyNode): void {
    if (node.kind === 'signature' && pathKeys.has(node.roleId)) {
      highlightedIds.add(node.id);
    } else if (node.kind === 'timelock' && node.mode === 'relative' && pathTimelocks.has(node.value)) {
      highlightedIds.add(node.id);
    } else if (node.kind === 'group') {
      // For groups, check if any children match
      for (const child of node.children) {
        findMatchingNodes(child);
      }
      // Highlight the group if it has any highlighted children
      const hasHighlightedChild = node.children.some(c => highlightedIds.has(c.id));
      if (hasHighlightedChild) {
        highlightedIds.add(node.id);
      }
    }
  }

  findMatchingNodes(strategyTree);
  return highlightedIds;
}

function BuilderCanvasInner() {
  const { locale } = useI18n();
  const strategyTree = usePlaygroundStore((s) => s.strategyTree);
  const builderSyncState = usePlaygroundStore((s) => s.builderSyncState);
  const availableKeys = usePlaygroundStore((s) => s.availableKeys);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const selectedBuilderNodeId = usePlaygroundStore((s) => s.selectedBuilderNodeId);
  const spendingPaths = usePlaygroundStore((s) => s.spendingPaths);
  const selectedPathIndex = usePlaygroundStore((s) => s.selectedPathIndex);

  const isReadOnly = builderSyncState !== 'synced';
  const definedRoles = useMemo(
    () => new Set(keyVariables.map((kv) => kv.name)),
    [keyVariables]
  );

  // Compute highlighted node IDs based on selected spending path
  const highlightedIds = useMemo(
    () => computeHighlightedIds(strategyTree, spendingPaths, selectedPathIndex),
    [strategyTree, spendingPaths, selectedPathIndex]
  );

  const { nodes, edges } = useMemo(() => {
    if (!strategyTree) return { nodes: [], edges: [] };
    return builderTreeToFlow(strategyTree, {
      availableKeys,
      currentTimeBlocks,
      highlightedIds,
      definedRoles,
      isReadOnly,
      locale,
    });
  }, [strategyTree, availableKeys, currentTimeBlocks, highlightedIds, definedRoles, isReadOnly, locale]);

  // Show empty state if no tree
  if (!strategyTree) {
    return <BuilderEmptyState />;
  }

  return (
    <div className="relative h-full w-full">
      <BuilderSyncBanner />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={builderNodeTypes}
        edgeTypes={builderEdgeTypes}
        fitView
        fitViewOptions={{ padding: 0.4 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      />
      {selectedBuilderNodeId && !isReadOnly && <BuilderPopover />}
    </div>
  );
}

export function BuilderCanvas() {
  return (
    <ReactFlowProvider>
      <BuilderCanvasInner />
    </ReactFlowProvider>
  );
}
