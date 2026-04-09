'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GripHorizontal } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { GLOSSARY } from '@/lib/glossary/data';
import { ExplainPopover } from '@/components/shared/ExplainPopover';
import { PathsTab } from '@/components/results/PathsTab';
import { PolicyTab } from '@/components/results/PolicyTab';
import { MiniscriptTab } from '@/components/results/MiniscriptTab';
import { ScriptTab } from '@/components/results/ScriptTab';
import { DescriptorTab } from '@/components/results/DescriptorTab';
import { AddressTab } from '@/components/results/AddressTab';
import type { ResultTab } from '@/lib/engine/types';

type SecondaryTab = Exclude<ResultTab, 'paths'>;

interface TabDef {
  key: SecondaryTab;
  i18nKey: string;
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
const NAV_WIDTH = 100;

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

  const [hoverCardKey, setHoverCardKey] = useState<SecondaryTab | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredButtonRef = useRef<HTMLButtonElement | null>(null);

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  const handleTabMouseEnter = useCallback(
    (tab: TabDef, e: React.MouseEvent<HTMLButtonElement>) => {
      if (!tab.glossaryKey) return;
      hoveredButtonRef.current = e.currentTarget;
      clearHoverTimer();
      hoverTimerRef.current = setTimeout(() => setHoverCardKey(tab.key), HOVER_CARD_DELAY_MS);
    },
    [clearHoverTimer],
  );

  const handleTabMouseLeave = useCallback(() => {
    clearHoverTimer();
    setHoverCardKey(null);
    hoveredButtonRef.current = null;
  }, [clearHoverTimer]);

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
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

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

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
        className="flex h-2 flex-shrink-0 cursor-row-resize items-center justify-center border-y border-border-subtle bg-surface-card hover:bg-surface-elevated"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <GripHorizontal className="h-3 w-3 text-text-muted" />
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
          {SECONDARY_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-current={secondaryTab === tab.key ? 'true' : undefined}
              onMouseEnter={(e) => handleTabMouseEnter(tab, e)}
              onMouseLeave={handleTabMouseLeave}
              className={cn(
                'flex cursor-pointer items-center gap-1.5 border-l-2 px-3 py-2 text-left text-[13px] leading-snug transition-colors',
                secondaryTab === tab.key
                  ? 'border-l-btc-500 bg-surface-elevated font-semibold text-text-primary'
                  : 'border-l-transparent text-text-muted hover:bg-surface-elevated hover:text-text-secondary',
              )}
            >
              <span className="min-w-0 flex-1 truncate">{t(tab.i18nKey)}</span>
              {isStale && secondaryTab === tab.key && (
                <span className="flex-shrink-0 text-[10px] text-text-muted">
                  ({t('playground.results.stale')})
                </span>
              )}
            </button>
          ))}
        </nav>

        {hoverCardKey &&
          (() => {
            const tab = SECONDARY_TABS.find((x) => x.key === hoverCardKey);
            const entry = tab?.glossaryKey && GLOSSARY[tab.glossaryKey];
            if (!entry || typeof document === 'undefined') return null;
            const title = locale === 'zh' ? entry.zh : entry.en;
            const explanation = locale === 'zh' ? entry.explain_zh : entry.explain_en;
            const rect = hoveredButtonRef.current?.getBoundingClientRect();
            const panel = containerRef.current;
            const panelRect = panel?.getBoundingClientRect();

            let style: React.CSSProperties = { position: 'fixed', zIndex: 50 };

            if (rect && panelRect) {
              const availableWidth = Math.max(200, panelRect.width - NAV_WIDTH - 24);
              const left = panelRect.left + NAV_WIDTH + 12;
              const top = rect.top;

              style = {
                position: 'fixed',
                zIndex: 50,
                left,
                top,
                width: availableWidth,
                maxWidth: availableWidth,
              };
            }
            return createPortal(
              <div
                className="rounded-card border border-border-default bg-surface-card p-3 shadow-lg"
                style={style}
                role="tooltip"
              >
                <p className="mb-1.5 text-[12px] font-semibold text-text-primary">{title}</p>
                <p className="text-[12px] leading-relaxed text-text-secondary">{explanation}</p>
              </div>,
              document.body,
            );
          })()}

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
