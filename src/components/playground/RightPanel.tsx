'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { GripHorizontal } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { ExplainPopover } from '@/components/shared/ExplainPopover';
import { PathsTab } from '@/components/results/PathsTab';
import { PolicyTab } from '@/components/results/PolicyTab';
import { MiniscriptTab } from '@/components/results/MiniscriptTab';
import { ScriptTab } from '@/components/results/ScriptTab';
import { DescriptorTab } from '@/components/results/DescriptorTab';
import { AddressTab } from '@/components/results/AddressTab';
import { WarningsTab } from '@/components/results/WarningsTab';
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
  { key: 'warnings', i18nKey: 'playground.results.warnings' },
];

const TAB_COMPONENTS: Record<SecondaryTab, React.FC> = {
  policy: PolicyTab,
  miniscript: MiniscriptTab,
  script: ScriptTab,
  descriptor: DescriptorTab,
  address: AddressTab,
  warnings: WarningsTab,
};

const MIN_TOP_HEIGHT = 100;
const MIN_BOTTOM_HEIGHT = 120;

export function RightPanel() {
  const { t } = useI18n();
  const activeTab = usePlaygroundStore((s) => s.activeResultTab);
  const setActiveTab = usePlaygroundStore((s) => s.setActiveResultTab);
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const compilationError = usePlaygroundStore((s) => s.compilationError);

  const isStale = compilationError !== null && compilationResult !== null;

  const secondaryTab: SecondaryTab = activeTab === 'paths' ? 'policy' : activeTab as SecondaryTab;
  const ActiveComponent = TAB_COMPONENTS[secondaryTab];

  const containerRef = useRef<HTMLDivElement>(null);
  const [topRatio, setTopRatio] = useState(0.45);
  const dragging = useRef(false);

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

      {/* Bottom section: Other tabs */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden" style={{ height: bottomHeight }}>
        <div className="flex flex-wrap items-end gap-0.5 border-b border-border-subtle px-3 pt-2">
          {SECONDARY_TABS.map((tab) => (
            <div key={tab.key} className="flex items-center gap-0.5">
              <button
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'rounded-t-button px-2 py-1.5 text-[11px] font-medium transition-colors',
                  secondaryTab === tab.key
                    ? 'border-b-2 border-btc-500 text-text-primary'
                    : 'text-text-muted hover:text-text-secondary',
                )}
              >
                {t(tab.i18nKey)}
                {isStale && secondaryTab === tab.key && tab.key !== 'warnings' && (
                  <span className="ml-1 text-[10px] text-text-muted">
                    ({t('playground.results.stale')})
                  </span>
                )}
              </button>
              {tab.glossaryKey && (
                <ExplainPopover glossaryKey={tab.glossaryKey} className="mb-1" />
              )}
            </div>
          ))}
        </div>

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
  );
}
