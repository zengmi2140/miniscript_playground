'use client';

import { memo, useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Key, Clock, AlertTriangle, Plus, MoreHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';
import type { BuilderFlowNodeData } from '@/lib/builder/tree-to-flow';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { OperatorSwitchPopover } from './OperatorSwitchPopover';

const STATUS_COLORS = {
  satisfied: {
    border: 'border-green-500',
    bg: 'bg-green-500/10',
    text: 'text-green-500',
  },
  pending: {
    border: 'border-btc-500',
    bg: 'bg-btc-500/10',
    text: 'text-btc-500',
  },
  missing: {
    border: 'border-border-subtle',
    bg: 'bg-surface-card',
    text: 'text-text-muted',
  },
};

const HIGHLIGHT_RING = 'ring-2 ring-btc-500 ring-offset-2 ring-offset-surface-base';

const NODE_ICONS = {
  signature: Key,
  timelock: Clock,
  group: Users,
};

interface NodeProps {
  data: BuilderFlowNodeData;
}

function NodeWrapper({
  children,
  data,
  onClick,
  width,
  height,
}: {
  children: React.ReactNode;
  data: BuilderFlowNodeData;
  onClick?: () => void;
  width: number;
  height: number;
}) {
  const colors = STATUS_COLORS[data.status];
  const isClickable = !data.isReadOnly && onClick;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex items-center justify-center rounded-lg border-2 transition-all',
        colors.border,
        colors.bg,
        data.isHighlighted && HIGHLIGHT_RING,
        data.isReadOnly && 'opacity-60',
        isClickable && 'cursor-pointer hover:border-btc-500',
      )}
      style={{ width, height }}
      onClick={isClickable ? onClick : undefined}
    >
      {children}
    </motion.div>
  );
}

export const BuilderRootNode = memo(function BuilderRootNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);
  const switchNodeOperator = usePlaygroundStore((s) => s.switchNodeOperator);
  const colors = STATUS_COLORS[data.status];
  const [showOpSwitch, setShowOpSwitch] = useState(false);

  const isGroup = data.kind === 'group';

  let label = data.label;
  if (isGroup) {
    if (data.op === 'all') label = t('builder.node.all');
    else if (data.op === 'any') label = t('builder.node.any');
    else if (data.op === 'threshold') label = `${data.threshold}-of-${data.childCount}`;
  }

  const handleNodeClick = useCallback(() => {
    if (!data.isReadOnly) {
      setSelectedBuilderNodeId(data.strategyNodeId);
    }
  }, [data.isReadOnly, data.strategyNodeId, setSelectedBuilderNodeId]);

  const handleBadgeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.isReadOnly) {
      setShowOpSwitch((v) => !v);
    }
  }, [data.isReadOnly]);

  return (
    <div className="relative">
      <NodeWrapper data={data} onClick={handleNodeClick} width={180} height={44}>
        {isGroup && !data.isReadOnly ? (
          <button
            onClick={handleBadgeClick}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-white/10',
              colors.text,
            )}
          >
            <span className="text-sm font-semibold">{label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        ) : (
          <span className={cn('text-sm font-semibold', colors.text)}>{label}</span>
        )}
        <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
      </NodeWrapper>

      {showOpSwitch && isGroup && (
        <OperatorSwitchPopover
          currentOp={data.op as 'all' | 'any' | 'threshold'}
          currentThreshold={data.threshold}
          realChildCount={data.childCount ?? 0}
          onSwitch={(newOp, newThreshold) => {
            switchNodeOperator(data.strategyNodeId, newOp, newThreshold);
          }}
          onClose={() => setShowOpSwitch(false)}
        />
      )}
    </div>
  );
});

export const BuilderOperatorNode = memo(function BuilderOperatorNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);
  const switchNodeOperator = usePlaygroundStore((s) => s.switchNodeOperator);
  const colors = STATUS_COLORS[data.status];
  const [showOpSwitch, setShowOpSwitch] = useState(false);

  let label = data.label;
  if (data.kind === 'group') {
    if (data.op === 'all') label = t('builder.node.all');
    else if (data.op === 'any') label = t('builder.node.any');
    else if (data.op === 'threshold') label = `${data.threshold}-of-${data.childCount}`;
  }

  const handleNodeClick = useCallback(() => {
    if (!data.isReadOnly) {
      setSelectedBuilderNodeId(data.strategyNodeId);
    }
  }, [data.isReadOnly, data.strategyNodeId, setSelectedBuilderNodeId]);

  const handleBadgeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.isReadOnly) {
      setShowOpSwitch((v) => !v);
    }
  }, [data.isReadOnly]);

  return (
    <div className="relative">
      <NodeWrapper data={data} onClick={handleNodeClick} width={140} height={40}>
        <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
        {!data.isReadOnly ? (
          <button
            onClick={handleBadgeClick}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 transition-colors hover:bg-white/10',
              colors.text,
            )}
          >
            <span className="text-sm font-medium">{label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        ) : (
          <span className={cn('text-sm font-medium', colors.text)}>{label}</span>
        )}
        <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
      </NodeWrapper>

      {showOpSwitch && (
        <OperatorSwitchPopover
          currentOp={data.op as 'all' | 'any' | 'threshold'}
          currentThreshold={data.threshold}
          realChildCount={data.childCount ?? 0}
          onSwitch={(newOp, newThreshold) => {
            switchNodeOperator(data.strategyNodeId, newOp, newThreshold);
          }}
          onClose={() => setShowOpSwitch(false)}
        />
      )}
    </div>
  );
});

export const BuilderConditionNode = memo(function BuilderConditionNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);
  const colors = STATUS_COLORS[data.status];

  const Icon = data.kind === 'signature'
    ? Key
    : data.kind === 'timelock'
    ? Clock
    : MoreHorizontal;

  const handleClick = useCallback(() => {
    if (!data.isReadOnly) {
      setSelectedBuilderNodeId(data.strategyNodeId);
    }
  }, [data.isReadOnly, data.strategyNodeId, setSelectedBuilderNodeId]);

  return (
    <NodeWrapper data={data} onClick={handleClick} width={160} height={44}>
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
      <div className="flex items-center gap-2 px-3">
        <Icon className={cn('h-4 w-4 flex-shrink-0', colors.text)} />
        <span className={cn('truncate text-sm font-medium', colors.text)}>
          {data.label}
        </span>
        {data.isUndefinedRole && (
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
        )}
      </div>
    </NodeWrapper>
  );
});

export const BuilderPlaceholderNode = memo(function BuilderPlaceholderNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);

  const handleClick = useCallback(() => {
    if (!data.isReadOnly) {
      setSelectedBuilderNodeId(data.strategyNodeId);
    }
  }, [data.isReadOnly, data.strategyNodeId, setSelectedBuilderNodeId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-btc-500/50 bg-btc-500/5 transition-all cursor-pointer hover:border-btc-500 hover:bg-btc-500/10',
        data.isReadOnly && 'opacity-60 cursor-not-allowed',
      )}
      style={{ width: 200, height: 60 }}
      onClick={!data.isReadOnly ? handleClick : undefined}
    >
      <Plus className="h-5 w-5 text-btc-500 mb-1" />
      <span className="text-xs font-medium text-btc-500">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
    </motion.div>
  );
});

export const BuilderAddChildNode = memo(function BuilderAddChildNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);

  const handleClick = useCallback(() => {
    if (!data.isReadOnly) {
      // For add child nodes, we pass the parent group ID
      setSelectedBuilderNodeId(`add_child:${data.strategyNodeId}`);
    }
  }, [data.isReadOnly, data.strategyNodeId, setSelectedBuilderNodeId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex items-center justify-center rounded-md border border-dashed border-border-subtle bg-surface-elevated/50 transition-all cursor-pointer hover:border-btc-500 hover:bg-btc-500/10',
        data.isReadOnly && 'opacity-40 cursor-not-allowed',
      )}
      style={{ width: 120, height: 36 }}
      onClick={!data.isReadOnly ? handleClick : undefined}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
      <Plus className="h-3.5 w-3.5 text-text-muted mr-1" />
      <span className="text-xs text-text-muted">{data.label}</span>
    </motion.div>
  );
});

export const builderNodeTypes = {
  builderRoot: BuilderRootNode,
  builderOperator: BuilderOperatorNode,
  builderCondition: BuilderConditionNode,
  builderPlaceholder: BuilderPlaceholderNode,
  builderAddChild: BuilderAddChildNode,
};
