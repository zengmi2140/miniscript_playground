'use client';

import { useMemo } from 'react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { builderTreeToFlow } from '@/lib/builder/tree-to-flow';
import { builderNodeTypes } from './BuilderNodes';
import { builderEdgeTypes } from './BuilderEdge';
import { BuilderEmptyState } from './BuilderEmptyState';
import { BuilderSyncBanner } from './BuilderSyncBanner';
import { BuilderPopover } from './BuilderPopover';

function BuilderCanvasInner() {
  const { locale } = useI18n();
  const strategyTree = usePlaygroundStore((s) => s.strategyTree);
  const builderSyncState = usePlaygroundStore((s) => s.builderSyncState);
  const availableKeys = usePlaygroundStore((s) => s.availableKeys);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const selectedBuilderNodeId = usePlaygroundStore((s) => s.selectedBuilderNodeId);

  const isReadOnly = builderSyncState !== 'synced';
  const definedRoles = useMemo(
    () => new Set(keyVariables.map((kv) => kv.name)),
    [keyVariables]
  );

  const { nodes, edges } = useMemo(() => {
    if (!strategyTree) return { nodes: [], edges: [] };
    return builderTreeToFlow(strategyTree, {
      availableKeys,
      currentTimeBlocks,
      highlightedIds: new Set(),
      definedRoles,
      isReadOnly,
      locale,
    });
  }, [strategyTree, availableKeys, currentTimeBlocks, definedRoles, isReadOnly, locale]);

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
