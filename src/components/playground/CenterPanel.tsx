'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { FileCode2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils/cn';
import { PolicyEditor } from './PolicyEditor';
import { ConditionToggles } from './ConditionToggles';
import { TimeSlider } from './TimeSlider';
import { StatusBanner } from './StatusBanner';

// Skeleton shown while the heavy canvas chunks are downloading
function CanvasSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-surface-base">
      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-border-subtle border-t-btc-500" />
      <p className="text-sm text-text-muted">Loading...</p>
    </div>
  );
}

// Both canvases are client-only (ReactFlow, WASM, lucide icons all break SSR).
// ssr: false is the definitive fix for the "Users is not defined" crash.
const PathMap = dynamic(
  () => import('@/components/flow/PathMap').then((m) => ({ default: m.PathMap })),
  { ssr: false, loading: () => <CanvasSkeleton /> }
);

const BuilderCanvas = dynamic(
  () => import('@/components/builder/BuilderCanvas').then((m) => ({ default: m.BuilderCanvas })),
  { ssr: false, loading: () => <CanvasSkeleton /> }
);

function EditorSection() {
  const { t } = useI18n();
  const compilationError = usePlaygroundStore((s) => s.compilationError);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex-shrink-0 border-b border-border-subtle bg-surface-card">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex w-full items-center gap-2 px-4 py-2 text-[12px] font-semibold text-text-secondary transition-colors hover:text-text-primary"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 flex-shrink-0" />
        )}
        {t('playground.editor.title')}
      </button>
      {!collapsed && (
        <div className="px-4 pb-3">
          <PolicyEditor compilationError={compilationError} />
        </div>
      )}
    </div>
  );
}

export function CenterPanel() {
  const { t } = useI18n();
  const policy = usePlaygroundStore((s) => s.policy);
  const compilationResult = usePlaygroundStore((s) => s.compilationResult);
  const compilationError = usePlaygroundStore((s) => s.compilationError);
  const semanticTree = usePlaygroundStore((s) => s.semanticTree);
  const playgroundMode = usePlaygroundStore((s) => s.playgroundMode);
  const strategyTree = usePlaygroundStore((s) => s.strategyTree);

  // Layer 2: while the user browses scenario mode, silently prefetch
  // the BuilderCanvas bundle so switching to build mode feels instant.
  useEffect(() => {
    if (playgroundMode !== 'build') {
      const timer = setTimeout(() => {
        import('@/components/builder/BuilderCanvas');
        import('@/components/builder/BuilderNodes');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [playgroundMode]);

  // Build mode: show BuilderCanvas
  if (playgroundMode === 'build') {
    // Show starter cards if no tree, otherwise show canvas
    if (!strategyTree && !policy) {
      return (
        <div className="flex flex-1 flex-col">
          <EditorSection />
          <div className="relative min-h-0 flex-1">
            <BuilderCanvas />
          </div>
          <div className="border-t border-border-subtle bg-surface-card">
            <div className="px-4 pt-2 pb-1">
              <StatusBanner />
            </div>
            <div className={cn('flex flex-col gap-3 px-4 pb-3 pt-1')}>
              <ConditionToggles />
              <TimeSlider />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <EditorSection />

        {compilationError && compilationResult && (
          <div className="mx-4 mt-2 flex items-center gap-2 rounded-button bg-btc-600/10 px-3 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-btc-500" />
            <p className="text-[12px] text-btc-400">
              {t('playground.center.staleWarning')}
            </p>
          </div>
        )}

        <div className="relative min-h-0 flex-1">
          <BuilderCanvas />
        </div>

        <div className="border-t border-border-subtle bg-surface-card">
          <div className="px-4 pt-2 pb-1">
            <StatusBanner />
          </div>
          <div className={cn('flex flex-col gap-3 px-4 pb-3 pt-1')}>
            <ConditionToggles />
            <TimeSlider />
          </div>
        </div>
      </div>
    );
  }

  // Scenario mode: original logic
  if (!policy && !compilationResult) {
    return (
      <div className="flex flex-1 flex-col">
        <EditorSection />
        <EmptyState />
      </div>
    );
  }

  if (!compilationResult && !semanticTree) {
    return (
      <div className="flex flex-1 flex-col">
        <EditorSection />
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="rounded-card border border-dashed border-border-default bg-surface-card p-8 text-center">
            <p className="text-body text-text-secondary">
              {compilationError
                ? t('playground.center.hasError')
                : t('playground.center.compilePlaceholder')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <EditorSection />

      {compilationError && compilationResult && (
        <div className="mx-4 mt-2 flex items-center gap-2 rounded-button bg-btc-600/10 px-3 py-1.5">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-btc-500" />
          <p className="text-[12px] text-btc-400">
            {t('playground.center.staleWarning')}
          </p>
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        <PathMap />
      </div>

      <div className="border-t border-border-subtle bg-surface-card">
        <div className="px-4 pt-2 pb-1">
          <StatusBanner />
        </div>
        <div className={cn(
          'flex flex-col gap-3 px-4 pb-3 pt-1',
        )}>
          <ConditionToggles />
          <TimeSlider />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="flex max-w-sm flex-col items-center rounded-card border border-dashed border-border-default bg-surface-card p-10 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-btc-500/10">
          <FileCode2 className="h-6 w-6 text-btc-500" />
        </div>
        <p className="mb-1.5 text-section-title text-text-secondary">
          {t('playground.empty.title')}
        </p>
        <p className="text-body text-text-muted">
          {t('playground.empty.subtitle')}
        </p>
      </div>
    </div>
  );
}
