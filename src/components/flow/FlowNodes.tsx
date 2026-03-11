'use client';

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Key, Clock, Hash, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { FlowNodeData } from '@/lib/flow/tree-to-flow';

const STATUS_STYLES: Record<string, string> = {
  satisfied: 'border-semantic-satisfied bg-semantic-satisfied/10 text-semantic-satisfied',
  pending: 'border-btc-500 bg-btc-500/10 text-btc-400',
  missing: 'border-border-default bg-surface-elevated text-text-muted',
};

const CONDITION_ICONS: Record<string, typeof Key> = {
  key: Key,
  timelock: Clock,
  hashlock: Hash,
  multi: ShieldCheck,
};

export const RootNode = memo(function RootNode({ data }: { data: FlowNodeData }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-node border-2 px-3',
        STATUS_STYLES[data.status],
      )}
      style={{ width: 200, height: 44 }}
    >
      <span className="text-[13px] font-medium">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </div>
  );
});

export const OperatorNode = memo(function OperatorNode({ data }: { data: FlowNodeData }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-node border-2 px-3',
        STATUS_STYLES[data.status],
      )}
      style={{ width: 120, height: 36 }}
    >
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <span className="text-[13px] font-medium">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </div>
  );
});

export const ConditionNode = memo(function ConditionNode({ data }: { data: FlowNodeData }) {
  const IconComp = data.conditionType ? CONDITION_ICONS[data.conditionType] : null;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-node border-2 px-3',
        STATUS_STYLES[data.status],
      )}
      style={{ width: 160, height: 40 }}
    >
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
      {IconComp && <IconComp className="h-3.5 w-3.5 flex-shrink-0" />}
      <span className="truncate text-[13px] font-medium">{data.label}</span>
    </div>
  );
});

export const nodeTypes = {
  root: RootNode,
  operator: OperatorNode,
  condition: ConditionNode,
};
