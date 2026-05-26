'use client';

import { useMemo, useEffect } from 'react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';
import { NodeInternalsSync } from '@/components/flow/NodeInternalsSync';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { findNode, countRealChildren } from '@/lib/builder/node-ops';
import { builderTreeToFlow } from '@/lib/builder/tree-to-flow';
import { collectHighlightedNodeIds } from '@/lib/builder/path-highlighting';
import { builderNodeTypes } from './BuilderNodes';
import { builderEdgeTypes } from './BuilderEdge';
import { BuilderSyncBanner } from './BuilderSyncBanner';
import { BuilderPopover } from './BuilderPopover';
import { OperatorSwitchPopover } from './OperatorSwitchPopover';
function BuilderCanvasInner() {
  const { locale, t } = useI18n();
  const policy = usePlaygroundStore((s) => s.policy);
  const strategyTree = usePlaygroundStore((s) => s.strategyTree);
  const builderSyncState = usePlaygroundStore((s) => s.builderSyncState);
  const availableKeys = usePlaygroundStore((s) => s.availableKeys);
  const currentTimeBlocks = usePlaygroundStore((s) => s.currentTimeBlocks);
  const blockTipHeight = usePlaygroundStore((s) => s.blockTipHeight);
  const blockTipHeightReady = usePlaygroundStore((s) => s.blockTipHeightReady);
  const keyVariables = usePlaygroundStore((s) => s.keyVariables);
  const selectedBuilderNodeId = usePlaygroundStore((s) => s.selectedBuilderNodeId);
  const operatorSwitchNodeId = usePlaygroundStore((s) => s.operatorSwitchNodeId);
  const setOperatorSwitchNodeId = usePlaygroundStore((s) => s.setOperatorSwitchNodeId);
  const switchNodeOperator = usePlaygroundStore((s) => s.switchNodeOperator);
  const spendingPaths = usePlaygroundStore((s) => s.spendingPaths);
  const selectedPathIndex = usePlaygroundStore((s) => s.selectedPathIndex);
  const builderDepthWarning = usePlaygroundStore((s) => s.builderDepthWarning);
  const clearDepthWarning = usePlaygroundStore((s) => s.clearDepthWarning);
  const builderBinaryTrimNotice = usePlaygroundStore((s) => s.builderBinaryTrimNotice);
  const clearBinaryTrimNotice = usePlaygroundStore((s) => s.clearBinaryTrimNotice);

  // Auto-dismiss depth warning after 4 seconds
  useEffect(() => {
    if (!builderDepthWarning) return;
    const timer = setTimeout(() => clearDepthWarning(), 4000);
    return () => clearTimeout(timer);
  }, [builderDepthWarning, clearDepthWarning]);

  useEffect(() => {
    if (!builderBinaryTrimNotice) return;
    const timer = setTimeout(() => clearBinaryTrimNotice(), 4000);
    return () => clearTimeout(timer);
  }, [builderBinaryTrimNotice, clearBinaryTrimNotice]);

  const isReadOnly = builderSyncState !== 'synced';
  const definedRoles = useMemo(
    () => new Set(keyVariables.map((kv) => kv.policyName)),
    [keyVariables]
  );

  // Compute highlighted node IDs based on selected spending path
  const highlightedIds = useMemo(() => {
    if (!strategyTree || selectedPathIndex === null || selectedPathIndex >= spendingPaths.length) {
      return new Set<string>();
    }
    const selectedPath = spendingPaths[selectedPathIndex];
    if (!selectedPath) return new Set<string>();
    return collectHighlightedNodeIds(strategyTree, selectedPath);
  }, [strategyTree, spendingPaths, selectedPathIndex]);

  const { nodes, edges } = useMemo(() => {
    if (!strategyTree) return { nodes: [], edges: [] };
    return builderTreeToFlow(strategyTree, {
      availableKeys,
      currentTimeBlocks,
      blockTipHeight: blockTipHeightReady ? blockTipHeight : undefined,
      highlightedIds,
      definedRoles,
      isReadOnly,
      locale,
      labels: {
        addConditionLine: `+ ${t('builder.node.addChild')}`,
      },
    });
  }, [strategyTree, availableKeys, currentTimeBlocks, blockTipHeight, blockTipHeightReady, highlightedIds, definedRoles, isReadOnly, locale, t]);

  const operatorSwitchGroup = useMemo(() => {
    if (!strategyTree || !operatorSwitchNodeId) return null;
    const n = findNode(strategyTree, operatorSwitchNodeId);
    if (!n || n.kind !== 'group') return null;
    return n;
  }, [strategyTree, operatorSwitchNodeId]);

  useEffect(() => {
    if (!operatorSwitchNodeId || !strategyTree) return;
    const n = findNode(strategyTree, operatorSwitchNodeId);
    if (!n || n.kind !== 'group') {
      setOperatorSwitchNodeId(null);
    }
  }, [strategyTree, operatorSwitchNodeId, setOperatorSwitchNodeId]);

  // No tree: empty policy should be rare after useBuilderSync (root placeholder); non-empty → wait for compile
  if (!strategyTree) {
    return (
      <div className="relative flex h-full w-full items-center justify-center">
        <p className="text-sm text-text-muted">
          {policy.trim() ? t('builder.canvas.waitingTree') : t('builder.canvas.initializing')}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <BuilderSyncBanner />

      {/* Depth warning toast */}
      {builderDepthWarning && (
        <div className="absolute bottom-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-400 shadow-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{t('builder.wrap.depthWarning') || '嵌套较深，建议保持在 5 层以内'}</span>
          <button
            onClick={clearDepthWarning}
            className="ml-2 text-yellow-500/60 hover:text-yellow-400"
            aria-label="dismiss"
          >
            ×
          </button>
        </div>
      )}
      {builderBinaryTrimNotice && (
        <div className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 flex max-w-md items-center gap-2 rounded-lg border border-btc-500/40 bg-btc-500/10 px-4 py-2.5 text-sm text-btc-400 shadow-lg">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{t('builder.op.binaryTrimNotice')}</span>
          <button
            onClick={clearBinaryTrimNotice}
            className="ml-2 text-btc-500/60 hover:text-btc-400"
            aria-label="dismiss"
          >
            ×
          </button>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={builderNodeTypes}
        edgeTypes={builderEdgeTypes}
        fitView
        fitViewOptions={{ padding: 0.5, includeHiddenNodes: false, minZoom: 0.5, maxZoom: 1.5 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        nodesFocusable={true}
        panOnDrag
        zoomOnScroll
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <NodeInternalsSync />
      </ReactFlow>
      {operatorSwitchGroup && !isReadOnly && (
        <OperatorSwitchPopover
          key={operatorSwitchGroup.id}
          className="absolute right-4 top-4 z-50"
          currentOp={operatorSwitchGroup.op}
          currentThreshold={operatorSwitchGroup.threshold}
          realChildCount={countRealChildren(operatorSwitchGroup)}
          onSwitch={(newOp, newThreshold) =>
            switchNodeOperator(operatorSwitchGroup.id, newOp, newThreshold)
          }
          onClose={() => setOperatorSwitchNodeId(null)}
        />
      )}
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
