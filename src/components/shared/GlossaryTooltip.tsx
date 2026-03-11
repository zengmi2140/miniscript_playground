'use client';

import { useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GLOSSARY } from '@/lib/glossary/data';
import { useI18n } from '@/lib/i18n/context';

interface TooltipPos {
  x: number;
  y: number;
}

interface GlossaryTooltipProps {
  glossaryKey: string;
  children: React.ReactNode;
  nodeValue?: string;
}

export function GlossaryTooltip({ glossaryKey, children, nodeValue }: GlossaryTooltipProps) {
  const { locale } = useI18n();
  const [pos, setPos] = useState<TooltipPos | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entry = GLOSSARY[glossaryKey];

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const handlePointerLeave = useCallback(() => {
    hideTimer.current = setTimeout(() => {
      setPos(null);
      hideTimer.current = null;
    }, 80);
  }, []);

  if (!entry) return <>{children}</>;

  const title = locale === 'zh' ? entry.zh : entry.en;
  const explanation = locale === 'zh' ? entry.explain_zh : entry.explain_en;

  const tooltipContent = pos
    ? createPortal(
        <div
          role="tooltip"
          className="fixed z-[9999] max-w-[220px] rounded-[12px] border border-[#44403C] bg-[#1C1917] px-3 py-2.5 shadow-lg"
          style={{
            left: pos.x,
            top: pos.y - 8,
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
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -5,
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
      )
    : null;

  return (
    <>
      <div
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={{ display: 'contents' }}
      >
        {children}
      </div>
      {tooltipContent}
    </>
  );
}
