'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position } from '@xyflow/react';
import { Key, Clock, Hash, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';
import { GLOSSARY } from '@/lib/glossary/data';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { FlowNodeData } from '@/lib/flow/tree-to-flow';

const STATUS_COLORS: Record<string, { borderColor: string; backgroundColor: string; color: string }> = {
  satisfied: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    color: '#22C55E',
  },
  pending: {
    borderColor: '#F7931A',
    backgroundColor: 'rgba(247, 147, 26, 0.1)',
    color: '#fb923c',
  },
  missing: {
    borderColor: '#44403C',
    backgroundColor: '#1C1917',
    color: '#78716C',
  },
};

const NODE_TRANSITION = { duration: 0.3, ease: 'easeInOut' as const };

const CONDITION_ICONS: Record<string, typeof Key> = {
  key: Key,
  timelock: Clock,
  hashlock: Hash,
  multi: ShieldCheck,
};

export const RootNode = memo(function RootNode({ data }: { data: FlowNodeData }) {
  const { t } = useI18n();
  const colors = STATUS_COLORS[data.status] || STATUS_COLORS.missing;

  const displayLabel = data.operatorType === 'and'
    ? t('flow.andLabel')
    : data.operatorType === 'or'
    ? t('flow.orLabel')
    : data.label || t('flow.rootLabel');

  return (
    <motion.div
      className="flex items-center justify-center rounded-node border-2 px-3"
      animate={{
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        color: colors.color,
      }}
      transition={NODE_TRANSITION}
      style={{ width: 200, height: 44 }}
    >
      <span className="text-[13px] font-medium">{displayLabel}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </motion.div>
  );
});

export const OperatorNode = memo(function OperatorNode({ data }: { data: FlowNodeData }) {
  const { t } = useI18n();
  const colors = STATUS_COLORS[data.status] || STATUS_COLORS.missing;

  const displayLabel = data.operatorType === 'and'
    ? t('flow.andLabel')
    : data.operatorType === 'or'
    ? t('flow.orLabel')
    : data.label;

  return (
    <motion.div
      className="flex items-center justify-center rounded-node border-2 px-3"
      animate={{
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        color: colors.color,
      }}
      transition={NODE_TRANSITION}
      style={{ width: 120, height: 36 }}
    >
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <span className="text-[13px] font-medium">{displayLabel}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </motion.div>
  );
});

export const ConditionNode = memo(function ConditionNode({ data }: { data: FlowNodeData }) {
  const { locale } = useI18n();

  const IconComp = data.conditionType ? CONDITION_ICONS[data.conditionType] : null;
  const glossaryKey = data.glossaryKey as string | undefined;
  const nodeValue = data.nodeValue as string | undefined;
  const entry = glossaryKey ? GLOSSARY[glossaryKey] : null;
  const colors = STATUS_COLORS[data.status] || STATUS_COLORS.missing;

  const title = entry ? (locale === 'zh' ? entry.zh : entry.en) : '';
  const explanation = entry ? (locale === 'zh' ? entry.explain_zh : entry.explain_en) : '';

  const nodeContent = (
    <motion.div
      className={cn(
        'nodrag nopan flex items-center justify-center gap-1.5 rounded-node border-2 px-3 outline-none',
        entry ? 'cursor-help focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base' : '',
      )}
      animate={{
        borderColor: colors.borderColor,
        backgroundColor: colors.backgroundColor,
        color: colors.color,
      }}
      transition={NODE_TRANSITION}
      style={{ width: 160, height: 40 }}
      data-glossary-key={glossaryKey}
      tabIndex={entry ? 0 : -1}
    >
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
      {IconComp && <IconComp className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />}
      <span className="truncate text-[13px] font-medium">{data.label}</span>
    </motion.div>
  );

  if (!entry) return nodeContent;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{nodeContent}</TooltipTrigger>
      <TooltipContent
        side="top"
        align="center"
        className="max-w-[220px] rounded-[12px] border-[#44403C] bg-[#1C1917] px-3 py-2.5"
      >
        <p className="mb-1 text-[12px] font-semibold text-[#FAFAF9]">
          {nodeValue ? `${title}: ${nodeValue}` : title}
        </p>
        <p className="text-[11px] leading-relaxed text-[#A8A29E]">{explanation}</p>
      </TooltipContent>
    </Tooltip>
  );
});

export const nodeTypes = {
  root: RootNode,
  operator: OperatorNode,
  condition: ConditionNode,
};
