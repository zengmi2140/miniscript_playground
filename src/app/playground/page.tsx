'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ThreeColumnLayout } from '@/components/playground/ThreeColumnLayout';
import { LeftPanel } from '@/components/playground/LeftPanel';
import { CenterPanel } from '@/components/playground/CenterPanel';
import { RightPanel } from '@/components/playground/RightPanel';
import { usePlaygroundStore } from '@/lib/stores/playground-store';
import { useCompiler } from '@/lib/hooks/useCompiler';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { decodeSharePayload } from '@/lib/utils/share';
import { loadSession } from '@/lib/utils/storage';

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const loadScenario = usePlaygroundStore((s) => s.loadScenario);
  const restoreSession = usePlaygroundStore((s) => s.restoreSession);
  const activeScenarioId = usePlaygroundStore((s) => s.activeScenarioId);
  const initialized = useRef(false);

  useCompiler();
  useAutoSave();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

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
      return;
    }

    const saved = loadSession();
    if (saved && saved.policy) {
      restoreSession(saved);
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

export default function PlaygroundPage() {
  return (
    <Suspense>
      <PlaygroundContent />
    </Suspense>
  );
}
