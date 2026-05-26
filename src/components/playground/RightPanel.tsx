'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import type { I18nKey } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { GLOSSARY } from '@/lib/glossary/data';
import { ExplainPopover } from '@/components/shared/ExplainPopover';
import { PathsTab } from '@/components/results/PathsTab';
import { PolicyTab } from '@/components/results/PolicyTab';
import { MiniscriptTab } from '@/components/results/MiniscriptTab';
import { ScriptTab } from '@/components/results/ScriptTab';
import { DescriptorTab } from '@/components/results/DescriptorTab';
import { AddressTab } from '@/components/results/AddressTab';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ResultTab } from '@/lib/engine/types';

type SecondaryTab = Exclude<ResultTab, 'paths'>;

interface TabDef {
  key: SecondaryTab;
  i18nKey: I18nKey;
  glossaryKey?: string;
}

const SECONDARY_TABS: TabDef[] = [
  { key: 'policy', i18nKey: 'playground.results.policy', glossaryKey: 'policy' },
  { key: 'miniscript', i18nKey: 'playground.results.miniscript', glossaryKey: 'miniscript' },
  { key: 'script', i18nKey: 'playground.results.script' },
  { key: 'descriptor', i18nKey: 'playground.results.descriptor', glossaryKey: 'descriptor' },
  { key: 'address', i18nKey: 'playground.results.address' },
];

const TAB_COMPONENTS: Record<SecondaryTab, React.FC> = {
  policy: PolicyTab,
  miniscript: MiniscriptTab,
  script: ScriptTab,
  descriptor: DescriptorTab,
  address: AddressTab,
};

const MIN_TOP_HEIGHT = 100;
const MIN_BOTTOM_HEIGHT = 120;
const HOVER_CARD_DELAY_MS = 2000;

export function RightPanel() {
  const { t, locale } = useI18n();
  const activeTab = usePlaygroundStore((s) => s.activeResultTab);
  const setActiveTab = usePlaygroundStore((s) => s.setActiveResultTab);
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const compilationError = usePlaygroundStore((s) => s.compilationError);

  const isStale = compilationError !== null && compilationResult !== null;

  const secondaryTab: SecondaryTab = activeTab === 'paths' ? 'policy' : activeTab as SecondaryTab;
  const ActiveComponent = TAB_COMPONENTS[secondaryTab];

  const containerRef = useRef<HTMLDivElement>(null);
  const [topRatio, setTopRatio] = useState(0.6);
  const dragging = useRef(false);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const releasePointerCapture = useCallback((e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    if (el.hasPointerCapture?.(e.pointerId)) {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    }
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const totalHeight = rect.height;
    const y = e.clientY - rect.top;
    const minTop = MIN_TOP_HEIGHT / totalHeight;
    const maxTop = 1 - MIN_BOTTOM_HEIGHT / totalHeight;
    setTopRatio(Math.min(maxTop, Math.max(minTop, y / totalHeight)));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    releasePointerCapture(e);
  }, [releasePointerCapture]);

  const onPointerCancel = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    releasePointerCapture(e);
  }, [releasePointerCapture]);

  const minTopRatio =
    containerHeight > 0 ? MIN_TOP_HEIGHT / containerHeight : 0;
  const maxTopRatio =
    containerHeight > 0 ? 1 - MIN_BOTTOM_HEIGHT / containerHeight : 1;

  const adjustRatio = useCallback(
    (delta: number) => {
      setTopRatio((prev) => {
        const next = prev + delta;
        return Math.min(maxTopRatio, Math.max(minTopRatio, next));
      });
    },
    [minTopRatio, maxTopRatio],
  );

  const onDividerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          adjustRatio(-0.05);
          break;
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          adjustRatio(0.05);
          break;
        case 'PageUp':
          e.preventDefault();
          adjustRatio(-0.1);
          break;
        case 'PageDown':
          e.preventDefault();
          adjustRatio(0.1);
          break;
        case 'Home':
          e.preventDefault();
          setTopRatio(minTopRatio);
          break;
        case 'End':
          e.preventDefault();
          setTopRatio(maxTopRatio);
          break;
        default:
          break;
      }
    },
    [adjustRatio, minTopRatio, maxTopRatio],
  );

  const topHeight = Math.max(MIN_TOP_HEIGHT, containerHeight * topRatio);
  const bottomHeight = Math.max(MIN_BOTTOM_HEIGHT, containerHeight - topHeight - 8);

  return (
    <div data-panel="right" ref={containerRef} className="flex h-full flex-col">
      {/* Top section: Spending Paths (always visible) */}
      <div className="flex flex-shrink-0 flex-col overflow-hidden" style={{ height: topHeight }}>
        <div className="flex items-center gap-1 border-b border-border-subtle px-3 py-2">
          <span className="text-[13px] font-semibold text-text-primary">
            {t('playground.results.paths')}
          </span>
          <ExplainPopover glossaryKey="satisfaction" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {!compilationResult ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[13px] text-text-muted">
                {t('playground.right.waiting')}
              </p>
            </div>
          ) : (
            <PathsTab />
          )}
        </div>
      </div>

      {/* Drag handle */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label={t('playground.right.divider')}
        aria-valuemin={Math.round(minTopRatio * 100)}
        aria-valuemax={Math.round(maxTopRatio * 100)}
        aria-valuenow={Math.round(topRatio * 100)}
        tabIndex={0}
        className="flex h-2 flex-shrink-0 cursor-row-resize items-center justify-center border-y border-border-subtle bg-surface-card outline-none transition-colors hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onLostPointerCapture={onPointerCancel}
        onKeyDown={onDividerKeyDown}
      >
        <GripHorizontal className="h-3 w-3 text-text-muted" aria-hidden="true" />
      </div>

      {/* Bottom section: vertical nav + content */}
      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        style={{ height: bottomHeight }}
      >
        <nav
          className="flex w-[100px] flex-shrink-0 flex-col border-r border-border-subtle bg-surface-card"
          aria-label={t('playground.results.panelNav')}
        >
          {SECONDARY_TABS.map((tab) => {
            const entry = tab.glossaryKey ? GLOSSARY[tab.glossaryKey] : null;
            const title = entry ? (locale === 'zh' ? entry.zh : entry.en) : '';
            const explanation = entry
              ? locale === 'zh'
                ? entry.explain_zh
                : entry.explain_en
              : '';
            const buttonClassName = cn(
              'flex cursor-pointer items-center gap-1.5 border-l-2 px-3 py-2 text-left text-[13px] leading-snug outline-none transition-colors focus-visible:ring-2 focus-visible:ring-btc-500 focus-visible:ring-inset',
              secondaryTab === tab.key
                ? 'border-l-btc-500 bg-surface-elevated font-semibold text-text-primary'
                : 'border-l-transparent text-text-muted hover:bg-surface-elevated hover:text-text-secondary',
            );
            const buttonContent = (
              <>
                <span className="min-w-0 flex-1 truncate">{t(tab.i18nKey)}</span>
                {isStale && secondaryTab === tab.key && (
                  <span className="flex-shrink-0 text-[10px] text-text-muted">
                    ({t('playground.results.stale')})
                  </span>
                )}
              </>
            );

            if (!entry) {
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-current={secondaryTab === tab.key ? 'true' : undefined}
                  className={buttonClassName}
                >
                  {buttonContent}
                </button>
              );
            }

            return (
              <Tooltip key={tab.key} delayDuration={HOVER_CARD_DELAY_MS}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    aria-current={secondaryTab === tab.key ? 'true' : undefined}
                    className={buttonClassName}
                  >
                    {buttonContent}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="start"
                  className="max-w-[260px] p-3"
                >
                  <p className="mb-1.5 text-[12px] font-semibold text-text-primary">
                    {title}
                  </p>
                  <p className="text-[12px] leading-relaxed text-text-secondary">
                    {explanation}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3">
            {!compilationResult ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[13px] text-text-muted">
                  {t('playground.right.tabPlaceholder')}
                </p>
              </div>
            ) : (
              <ActiveComponent />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
