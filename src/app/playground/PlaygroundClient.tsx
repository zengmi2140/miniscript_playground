'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Monitor, ArrowLeft } from 'lucide-react';
import { ThreeColumnLayout } from '@/components/playground/ThreeColumnLayout';
import { LeftPanel } from '@/components/playground/LeftPanel';
import { CenterPanel } from '@/components/playground/CenterPanel';
import { RightPanel } from '@/components/playground/RightPanel';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useCompiler } from '@/lib/hooks/useCompiler';
import { useBuilderSync } from '@/lib/hooks/useBuilderSync';
import { decodeSharePayload } from '@/lib/utils/share';
import { clearSession } from '@/lib/utils/storage';
import { useI18n } from '@/lib/i18n/context';

function useViewportMode() {
  const [mode, setMode] = useState<'loading' | 'desktop' | 'mobile'>('loading');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    setMode(mq.matches ? 'desktop' : 'mobile');
    const handler = (e: MediaQueryListEvent) =>
      setMode(e.matches ? 'desktop' : 'mobile');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return mode;
}

function MobileFallback() {
  const { t } = useI18n();

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated">
          <Monitor className="h-8 w-8 text-text-muted" />
        </div>
        <h2 className="mb-3 text-[20px] font-semibold text-text-primary">
          {t('playground.mobile.title')}
        </h2>
        <p className="mb-8 text-body text-text-secondary">
          {t('playground.mobile.description')}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-button border border-border-default bg-surface-elevated px-5 py-2.5 text-body font-medium text-text-primary transition-all hover:border-border-hover"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('playground.mobile.goScenarios')}
        </Link>
      </div>
    </div>
  );
}

function DesktopPlayground() {
  const searchParams = useSearchParams();
  const loadScenario = usePlaygroundStore((s) => s.loadScenario);
  const restoreSession = usePlaygroundStore((s) => s.restoreSession);
  const enterBuildMode = usePlaygroundStore((s) => s.enterBuildMode);
  const activeScenarioId = usePlaygroundStore((s) => s.activeScenarioId);
  const initialized = useRef(false);

  useCompiler();
  useBuilderSync();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    clearSession();

    const shareParam = searchParams.get('s');
    if (shareParam) {
      const payload = decodeSharePayload(shareParam);
      if (payload) {
        restoreSession(payload);
        return;
      }
    }

    const scenarioId = searchParams.get('scenario');
    if (scenarioId) {
      loadScenario(scenarioId);
    } else if (searchParams.get('mode') === 'build') {
      enterBuildMode();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!initialized.current) return;
    const scenarioId = searchParams.get('scenario');
    if (scenarioId && scenarioId !== activeScenarioId) {
      loadScenario(scenarioId);
    }
  }, [searchParams, loadScenario, activeScenarioId]);

  return (
    <ThreeColumnLayout
      left={<LeftPanel />}
      center={<CenterPanel />}
      right={<RightPanel />}
    />
  );
}

function PlaygroundContent() {
  const mode = useViewportMode();

  // On mobile, show fallback. During SSR / hydration ('loading'),
  // render the desktop shell immediately — the user sees the frame
  // right away instead of a blank screen, then viewport-check resolves.
  if (mode === 'mobile') return <MobileFallback />;
  return <DesktopPlayground />;
}

export function PlaygroundClient() {
  return (
    <Suspense>
      <PlaygroundContent />
    </Suspense>
  );
}
