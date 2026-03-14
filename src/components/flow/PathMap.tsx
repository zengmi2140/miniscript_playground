'use client';

import { useMemo } from 'react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { treeToFlow } from '@/lib/flow/tree-to-flow';
import { nodeTypes } from './FlowNodes';
import { edgeTypes } from './PathEdge';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';

function PathMapInner() {
  const semanticTree = usePlaygroundStore((s) => s.semanticTree);
  const availableKeys = usePlaygroundStore((s) => s.availableKeys);
  const availableHashes = usePlaygroundStore((s) => s.availableHashes);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);
  const { locale } = useI18n();

  const { nodes, edges } = useMemo(() => {
    if (!semanticTree) return { nodes: [], edges: [] };
    return treeToFlow(semanticTree, availableKeys, availableHashes, currentTimeBlocks, locale);
  }, [semanticTree, availableKeys, availableHashes, currentTimeBlocks, locale]);

  if (!semanticTree) return null;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
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
  );
}

export function PathMap() {
  return (
    <ReactFlowProvider>
      <PathMapInner />
    </ReactFlowProvider>
  );
}
