'use client';

import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { Key, Clock, AlertTriangle, Plus, MoreHorizontal, ChevronDown, Users } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';
import type { BuilderFlowNodeData } from '@/lib/builder/tree-to-flow';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
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
  ariaLabel,
}: {
  children: React.ReactNode;
  data: BuilderFlowNodeData;
  onClick?: () => void;
  width: number;
  height: number;
  ariaLabel?: string;
}) {
  const colors = STATUS_COLORS[data.status];
  const isClickable = !data.isReadOnly && Boolean(onClick);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable || !onClick) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex items-center justify-center rounded-lg border-2 outline-none transition-all',
        colors.border,
        colors.bg,
        data.isHighlighted && HIGHLIGHT_RING,
        data.isReadOnly && 'opacity-60',
        isClickable &&
          'cursor-pointer hover:border-btc-500 focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
      )}
      style={{ width, height }}
      onClick={isClickable && onClick ? onClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? ariaLabel : undefined}
    >
      {children}
    </motion.div>
  );
}

export const BuilderRootNode = memo(function BuilderRootNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);
  const setOperatorSwitchNodeId = usePlaygroundStore((s) => s.setOperatorSwitchNodeId);
  const colors = STATUS_COLORS[data.status];

  const isGroup = data.kind === 'group';

  let label = data.label;
  if (isGroup) {
    if (data.op === 'all') label = t('builder.node.all');
    else if (data.op === 'any') label = t('builder.node.any');
    else if (data.op === 'threshold') {
      const n = data.childCount ?? 0;
      const k = Math.min(Math.max(1, data.threshold ?? 1), Math.max(1, n));
      label = `${k}-of-${n}`;
    }
  }

  const handleNodeClick = useCallback(() => {
    if (!data.isReadOnly) {
      setSelectedBuilderNodeId(data.strategyNodeId);
    }
  }, [data.isReadOnly, data.strategyNodeId, setSelectedBuilderNodeId]);

  const handleBadgeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.isReadOnly) {
      const s = usePlaygroundStore.getState();
      const next =
        s.operatorSwitchNodeId === data.strategyNodeId ? null : data.strategyNodeId;
      setOperatorSwitchNodeId(next);
    }
  }, [data.isReadOnly, data.strategyNodeId, setOperatorSwitchNodeId]);

  const handleBadgeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.stopPropagation();
    }
  }, []);

  return (
    <div className="relative">
      <NodeWrapper
        data={data}
        onClick={handleNodeClick}
        width={180}
        height={44}
        ariaLabel={t('builder.node.aria.edit', { label })}
      >
        {isGroup && !data.isReadOnly ? (
          <button
            type="button"
            onClick={handleBadgeClick}
            onKeyDown={handleBadgeKeyDown}
            aria-label={t('builder.node.aria.switchOperator', { label })}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-btc-500',
              colors.text,
            )}
          >
            <span className="text-sm font-semibold">{label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
          </button>
        ) : (
          <span className={cn('text-sm font-semibold', colors.text)}>{label}</span>
        )}
        <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
      </NodeWrapper>
    </div>
  );
});

export const BuilderOperatorNode = memo(function BuilderOperatorNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);
  const setOperatorSwitchNodeId = usePlaygroundStore((s) => s.setOperatorSwitchNodeId);
  const colors = STATUS_COLORS[data.status];

  let label = data.label;
  if (data.kind === 'group') {
    if (data.op === 'all') label = t('builder.node.all');
    else if (data.op === 'any') label = t('builder.node.any');
    else if (data.op === 'threshold') {
      const n = data.childCount ?? 0;
      const k = Math.min(Math.max(1, data.threshold ?? 1), Math.max(1, n));
      label = `${k}-of-${n}`;
    }
  }

  const handleNodeClick = useCallback(() => {
    if (!data.isReadOnly) {
      setSelectedBuilderNodeId(data.strategyNodeId);
    }
  }, [data.isReadOnly, data.strategyNodeId, setSelectedBuilderNodeId]);

  const handleBadgeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.isReadOnly) {
      const s = usePlaygroundStore.getState();
      const next =
        s.operatorSwitchNodeId === data.strategyNodeId ? null : data.strategyNodeId;
      setOperatorSwitchNodeId(next);
    }
  }, [data.isReadOnly, data.strategyNodeId, setOperatorSwitchNodeId]);

  const handleBadgeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.stopPropagation();
    }
  }, []);

  return (
    <div className="relative">
      <NodeWrapper
        data={data}
        onClick={handleNodeClick}
        width={140}
        height={40}
        ariaLabel={t('builder.node.aria.edit', { label })}
      >
        <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
        {!data.isReadOnly ? (
          <button
            type="button"
            onClick={handleBadgeClick}
            onKeyDown={handleBadgeKeyDown}
            aria-label={t('builder.node.aria.switchOperator', { label })}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-btc-500',
              colors.text,
            )}
          >
            <span className="text-sm font-medium">{label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" aria-hidden="true" />
          </button>
        ) : (
          <span className={cn('text-sm font-medium', colors.text)}>{label}</span>
        )}
        <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
      </NodeWrapper>
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
    <NodeWrapper
      data={data}
      onClick={handleClick}
      width={160}
      height={44}
      ariaLabel={t('builder.node.aria.edit', { label: data.label })}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-border-subtle" />
      <div className="flex items-center gap-2 px-3">
        <Icon className={cn('h-4 w-4 flex-shrink-0', colors.text)} aria-hidden="true" />
        <span className={cn('truncate text-sm font-medium', colors.text)}>
          {data.label}
        </span>
        {data.isUndefinedRole && (
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500" aria-hidden="true" />
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

  const isInteractive = !data.isReadOnly;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      }
    },
    [isInteractive, handleClick],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-btc-500/50 bg-btc-500/5 outline-none transition-all',
        isInteractive
          ? 'cursor-pointer hover:border-btc-500 hover:bg-btc-500/10 focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base'
          : 'opacity-60 cursor-not-allowed',
      )}
      style={{ width: 200, height: 60 }}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? t('builder.node.aria.addRoot') : undefined}
    >
      <Plus className="h-5 w-5 text-btc-500 mb-1" aria-hidden="true" />
      <span className="text-xs font-medium text-btc-500">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
    </motion.div>
  );
});

export const BuilderAddChildNode = memo(function BuilderAddChildNode({ data }: NodeProps) {
  const { t } = useI18n();
  const setSelectedBuilderNodeId = usePlaygroundStore((s) => s.setSelectedBuilderNodeId);

  const handleClick = useCallback(() => {
    if (data.isReadOnly) return;
    const slot = data.addChildSlotKind;
    if (slot === 'virtual') {
      setSelectedBuilderNodeId(`add_child:${data.strategyNodeId}`);
    } else if (slot === 'treePlaceholder') {
      setSelectedBuilderNodeId(data.strategyNodeId);
    }
  }, [data.isReadOnly, data.strategyNodeId, data.addChildSlotKind, setSelectedBuilderNodeId]);

  const isInteractive = !data.isReadOnly;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractive) return;
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      }
    },
    [isInteractive, handleClick],
  );

  const parentRoleId = typeof data.parentRoleId === 'string' ? data.parentRoleId : '';
  const ariaLabel = parentRoleId
    ? t('builder.node.aria.addChild', { label: parentRoleId })
    : data.label;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'flex items-center justify-center rounded-md border border-dashed border-border-subtle bg-surface-elevated/50 outline-none transition-all',
        isInteractive
          ? 'cursor-pointer hover:border-btc-500 hover:bg-btc-500/10 focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base'
          : 'opacity-40 cursor-not-allowed',
      )}
      style={{ width: 120, height: 36 }}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={isInteractive ? ariaLabel : undefined}
    >
      <Handle type="target" position={Position.Top} className="!h-1.5 !w-1.5 !border-0 !bg-transparent" />
      <Plus className="h-3.5 w-3.5 text-text-muted mr-1" aria-hidden="true" />
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
