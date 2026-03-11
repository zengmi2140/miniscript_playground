'use client';

import { memo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position } from '@xyflow/react';
import { Key, Clock, Hash, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/lib/i18n/context';
import { GLOSSARY } from '@/lib/glossary/data';
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

interface TooltipPos {
  x: number;
  y: number;
}

export const RootNode = memo(function RootNode({ data }: { data: FlowNodeData }) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-node border-2 px-3',
        STATUS_STYLES[data.status],
      )}
      style={{ width: 200, height: 44 }}
    >
      <span className="text-[13px] font-medium">{t('flow.rootLabel')}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </div>
  );
});

export const OperatorNode = memo(function OperatorNode({ data }: { data: FlowNodeData }) {
  const { t } = useI18n();

  const displayLabel = data.operatorType === 'and'
    ? t('flow.andLabel')
    : data.operatorType === 'or'
    ? t('flow.orLabel')
    : data.label;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-node border-2 px-3',
        STATUS_STYLES[data.status],
      )}
      style={{ width: 120, height: 36 }}
    >
      <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
      <span className="text-[13px] font-medium">{displayLabel}</span>
      <Handle type="source" position={Position.Bottom} className="!h-1 !w-1 !border-0 !bg-transparent" />
    </div>
  );
});

export const ConditionNode = memo(function ConditionNode({ data }: { data: FlowNodeData }) {
  const { locale } = useI18n();
  const [tooltipPos, setTooltipPos] = useState<TooltipPos | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const IconComp = data.conditionType ? CONDITION_ICONS[data.conditionType] : null;
  const glossaryKey = data.glossaryKey as string | undefined;
  const nodeValue = data.nodeValue as string | undefined;
  const entry = glossaryKey ? GLOSSARY[glossaryKey] : null;

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!entry) return;
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, [entry]);

  const handlePointerLeave = useCallback(() => {
    if (!entry) return;
    hideTimer.current = setTimeout(() => {
      setTooltipPos(null);
      hideTimer.current = null;
    }, 80);
  }, [entry]);

  const title = entry ? (locale === 'zh' ? entry.zh : entry.en) : '';
  const explanation = entry ? (locale === 'zh' ? entry.explain_zh : entry.explain_en) : '';

  return (
    <>
      <div
        className={cn(
          'nodrag nopan flex items-center justify-center gap-1.5 rounded-node border-2 px-3',
          STATUS_STYLES[data.status],
          entry ? 'cursor-help' : '',
        )}
        style={{ width: 160, height: 40 }}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        data-glossary-key={glossaryKey}
      >
        <Handle type="target" position={Position.Top} className="!h-1 !w-1 !border-0 !bg-transparent" />
        {IconComp && <IconComp className="h-3.5 w-3.5 flex-shrink-0" />}
        <span className="truncate text-[13px] font-medium">{data.label}</span>
      </div>
      {tooltipPos && entry && typeof document !== 'undefined' && createPortal(
        <div
          role="tooltip"
          className="fixed z-[9999] max-w-[220px] rounded-[12px] border border-[#44403C] bg-[#1C1917] px-3 py-2.5 shadow-lg"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y - 8,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
          }}
        >
          <p className="mb-1 text-[12px] font-semibold text-[#FAFAF9]">
            {nodeValue ? `${title}: ${nodeValue}` : title}
          </p>
          <p className="text-[11px] leading-relaxed text-[#A8A29E]">
            {explanation}
          </p>
          <div
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              width: 10,
              height: 10,
              transform: 'translateX(-50%) rotate(45deg)',
              background: '#1C1917',
              borderRight: '1px solid #44403C',
              borderBottom: '1px solid #44403C',
            }}
          />
        </div>,
        document.body,
      )}
    </>
  );
});

export const nodeTypes = {
  root: RootNode,
  operator: OperatorNode,
  condition: ConditionNode,
};
