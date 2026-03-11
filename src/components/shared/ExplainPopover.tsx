'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { GLOSSARY } from '@/lib/glossary/data';
import { cn } from '@/lib/utils/cn';

interface ExplainPopoverProps {
  glossaryKey: string;
  className?: string;
}

export function ExplainPopover({ glossaryKey, className }: ExplainPopoverProps) {
  const [open, setOpen] = useState(false);
  const { locale } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const entry = GLOSSARY[glossaryKey];

  const adjustPosition = useCallback(() => {
    const popover = popoverRef.current;
    const wrapper = ref.current;
    if (!popover || !wrapper) return;

    popover.style.left = '';
    popover.style.right = '0';

    const popoverRect = popover.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    const rightPanel = wrapper.closest('[data-panel="right"]')
      || wrapper.closest('[class*="flex h-full flex-col"]');
    const containerLeft = rightPanel
      ? rightPanel.getBoundingClientRect().left
      : 0;

    if (popoverRect.left < containerLeft) {
      const overflow = containerLeft - popoverRect.left + 4;
      const baseLeft = wrapperRect.width - popoverRect.width;
      popover.style.right = '';
      popover.style.left = `${baseLeft + overflow}px`;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(adjustPosition);

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, adjustPosition]);

  if (!entry) return null;

  const title = locale === 'zh' ? entry.zh : entry.en;
  const explanation = locale === 'zh' ? entry.explain_zh : entry.explain_en;

  return (
    <div className={cn('relative inline-flex', className)} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-4 w-4 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-secondary"
        aria-label={title}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-6 z-50 w-64 rounded-card border border-border-default bg-surface-card p-3 shadow-lg"
        >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[12px] font-semibold text-text-primary">{title}</span>
            <button
              onClick={() => setOpen(false)}
              className="flex h-4 w-4 items-center justify-center text-text-muted hover:text-text-secondary"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-[12px] leading-relaxed text-text-secondary">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
